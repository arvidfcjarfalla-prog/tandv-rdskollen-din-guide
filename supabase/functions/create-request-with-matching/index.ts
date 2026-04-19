// Edge function: create-request-with-matching
// Creates a request, geo-matches up to 5 nearest clinics, invites them.
// If patient is a guest (no auth), creates an account and sends magic link.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Postal-code centroid lookup file is bundled at deploy time? We don't have it here.
// Instead we expect the client to send `postal_code` and we look it up via a public
// Nominatim-free approach: we accept lat/lng OR fall back to clinic-postal-prefix match.

interface Body {
  postal_code?: string;
  patient: {
    name: string;
    email: string;
    phone?: string;
    birth_year?: number;
  };
  request: {
    track?: string;
    selected_teeth?: string[];
    symptom?: string;
    pain_level?: number;
    treatment_free_text?: string;
    treatments?: unknown;
    description?: string;
    time_preference?: string;
    area?: string;
  };
}

// Haversine distance in km
function distance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Extract caller's auth (if any)
    const authHeader = req.headers.get("Authorization");
    let patientUserId: string | null = null;
    if (authHeader) {
      const userClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      patientUserId = user?.id ?? null;
    }

    const body: Body = await req.json();
    if (!body?.patient?.email || !body?.request) {
      return new Response(JSON.stringify({ error: "Missing patient or request data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let isNewAccount = false;
    let magicLinkSent = false;

    // Create or fetch patient user
    if (!patientUserId) {
      // Check if user exists
      const { data: existing } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      // listUsers can't filter by email natively; use generateLink to invite
      // Try to invite — if user exists, that's fine, we still send a magic link
      const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        body.patient.email,
        {
          data: {
            full_name: body.patient.name,
            phone: body.patient.phone,
          },
        },
      );

      if (inviteErr && !inviteErr.message?.toLowerCase().includes("already")) {
        console.error("Invite error:", inviteErr);
      }

      if (inviteData?.user) {
        patientUserId = inviteData.user.id;
        isNewAccount = true;
      } else {
        // User exists — find by listing (paginated). Better: use signInWithOtp via admin
        // Use a workaround: query profiles by email
        const { data: prof } = await admin
          .from("profiles")
          .select("user_id")
          .eq("email", body.patient.email)
          .maybeSingle();
        patientUserId = prof?.user_id ?? null;
      }

      // Send magic link regardless (so user can log in to portal)
      if (patientUserId) {
        const { error: linkErr } = await admin.auth.admin.generateLink({
          type: "magiclink",
          email: body.patient.email,
          options: {
            redirectTo: `${req.headers.get("origin") ?? ""}/mina-sidor`,
          },
        });
        if (!linkErr) magicLinkSent = true;
      }

      // Update profile with extra fields
      if (patientUserId) {
        await admin
          .from("profiles")
          .update({
            full_name: body.patient.name,
            phone: body.patient.phone,
            birth_year: body.patient.birth_year,
          })
          .eq("user_id", patientUserId);
      }
    }

    if (!patientUserId) {
      return new Response(
        JSON.stringify({ error: "Could not create or find patient account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create the request
    const { data: createdRequest, error: reqErr } = await admin
      .from("requests")
      .insert({
        patient_id: patientUserId,
        postal_code: body.postal_code,
        track: body.request.track,
        selected_teeth: body.request.selected_teeth ?? [],
        symptom: body.request.symptom,
        pain_level: body.request.pain_level,
        treatment_free_text: body.request.treatment_free_text,
        treatments: body.request.treatments ?? [],
        description: body.request.description,
        time_preference: body.request.time_preference,
        area: body.request.area,
        status: "open",
      })
      .select()
      .single();

    if (reqErr || !createdRequest) {
      console.error("Request insert error:", reqErr);
      return new Response(JSON.stringify({ error: reqErr?.message ?? "Could not create request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Geo-match: derive patient coords from postal code centroid via clinics with same prefix
    // Strategy: average lat/lng of all clinics whose postal_code shares the first 3 digits
    let centerLat: number | null = null;
    let centerLng: number | null = null;
    if (body.postal_code) {
      const prefix = body.postal_code.replace(/\s/g, "").slice(0, 3);
      const { data: nearby } = await admin
        .from("clinics")
        .select("lat,lng")
        .like("postal_code", `${prefix}%`)
        .not("lat", "is", null)
        .limit(50);
      if (nearby && nearby.length) {
        centerLat = nearby.reduce((s, c) => s + Number(c.lat), 0) / nearby.length;
        centerLng = nearby.reduce((s, c) => s + Number(c.lng), 0) / nearby.length;
      }
    }

    // Fetch all geocoded clinics (small dataset, <500 rows)
    const { data: allClinics } = await admin
      .from("clinics")
      .select("id, lat, lng")
      .eq("active", true)
      .not("lat", "is", null);

    let chosen: { id: string; distance_km: number }[] = [];
    if (allClinics && allClinics.length && centerLat !== null && centerLng !== null) {
      chosen = allClinics
        .map((c) => ({
          id: c.id as string,
          distance_km: distance(centerLat!, centerLng!, Number(c.lat), Number(c.lng)),
        }))
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, 5);
    } else if (allClinics && allClinics.length) {
      // Fallback: random 5
      chosen = allClinics
        .slice(0, 5)
        .map((c) => ({ id: c.id as string, distance_km: 0 }));
    }

    if (chosen.length > 0) {
      const invitations = chosen.map((c) => ({
        request_id: createdRequest.id,
        clinic_id: c.id,
        distance_km: Number(c.distance_km.toFixed(2)),
        status: "invited" as const,
      }));
      const { error: invErr } = await admin.from("request_clinics").insert(invitations);
      if (invErr) console.error("Invitation insert error:", invErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        request_id: createdRequest.id,
        invited_clinics: chosen.length,
        is_new_account: isNewAccount,
        magic_link_sent: magicLinkSent,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
