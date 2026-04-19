// Edge function: accept-offer
// Patient accepts an offer → creates booking, marks offer accepted, closes other offers.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { offer_id, scheduled_at } = await req.json();
    if (!offer_id) {
      return new Response(JSON.stringify({ error: "Missing offer_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Load offer + verify the request belongs to this patient
    const { data: offer, error: offerErr } = await admin
      .from("offers")
      .select("id, request_id, clinic_id, status")
      .eq("id", offer_id)
      .single();

    if (offerErr || !offer) {
      return new Response(JSON.stringify({ error: "Offer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: request } = await admin
      .from("requests")
      .select("id, patient_id")
      .eq("id", offer.request_id)
      .single();

    if (!request || request.patient_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark this offer accepted, others on same request declined
    await admin.from("offers").update({ status: "accepted" }).eq("id", offer.id);
    await admin
      .from("offers")
      .update({ status: "declined" })
      .eq("request_id", offer.request_id)
      .neq("id", offer.id)
      .eq("status", "pending");

    // Mark request as accepted
    await admin
      .from("requests")
      .update({ status: "accepted", accepted_offer_id: offer.id })
      .eq("id", offer.request_id);

    // Create booking
    const { data: booking, error: bookErr } = await admin
      .from("bookings")
      .insert({
        request_id: offer.request_id,
        offer_id: offer.id,
        clinic_id: offer.clinic_id,
        patient_id: user.id,
        scheduled_at: scheduled_at ?? null,
        status: "confirmed",
      })
      .select()
      .single();

    if (bookErr) {
      return new Response(JSON.stringify({ error: bookErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, booking_id: booking.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
