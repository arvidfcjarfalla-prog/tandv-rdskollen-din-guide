-- 1. Add columns to existing tables
ALTER TABLE public.requests 
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS accepted_offer_id uuid,
  ADD COLUMN IF NOT EXISTS claimed_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric;

-- 2. New enum for request_clinics status
DO $$ BEGIN
  CREATE TYPE public.request_clinic_status AS ENUM ('invited', 'claimed', 'declined', 'closed', 'quoted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. request_clinics junction table
CREATE TABLE IF NOT EXISTS public.request_clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  status public.request_clinic_status NOT NULL DEFAULT 'invited',
  distance_km numeric,
  invited_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  declined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_request_clinics_clinic ON public.request_clinics(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_request_clinics_request ON public.request_clinics(request_id);

ALTER TABLE public.request_clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient sees own request matches"
  ON public.request_clinics FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.patient_id = auth.uid()));

CREATE POLICY "Clinic sees own invitations"
  ON public.request_clinics FOR SELECT
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Clinic updates own invitation"
  ON public.request_clinics FOR UPDATE
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- 4. Bookings table
DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('confirmed', 'rescheduled', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL,
  scheduled_at timestamptz,
  duration_minutes integer DEFAULT 60,
  status public.booking_status NOT NULL DEFAULT 'confirmed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_clinic_date ON public.bookings(clinic_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_patient ON public.bookings(patient_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient reads own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Clinic reads own bookings"
  ON public.bookings FOR SELECT
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Clinic updates own bookings"
  ON public.bookings FOR UPDATE
  USING (clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Atomic claim function (max 3 clinics per request)
CREATE OR REPLACE FUNCTION public.claim_request_for_clinic(_request_id uuid, _clinic_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  invitation_exists boolean;
BEGIN
  -- Lock the request row
  SELECT claimed_count INTO current_count FROM public.requests WHERE id = _request_id FOR UPDATE;

  IF current_count IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'request_not_found');
  END IF;

  IF current_count >= 3 THEN
    -- Mark this invitation as closed
    UPDATE public.request_clinics
      SET status = 'closed'
      WHERE request_id = _request_id AND clinic_id = _clinic_id AND status = 'invited';
    RETURN jsonb_build_object('success', false, 'reason', 'request_full');
  END IF;

  -- Check the clinic was invited and is still invited
  SELECT EXISTS(
    SELECT 1 FROM public.request_clinics
    WHERE request_id = _request_id AND clinic_id = _clinic_id AND status = 'invited'
  ) INTO invitation_exists;

  IF NOT invitation_exists THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_invited_or_already_acted');
  END IF;

  -- Claim it
  UPDATE public.request_clinics
    SET status = 'claimed', claimed_at = now()
    WHERE request_id = _request_id AND clinic_id = _clinic_id;

  UPDATE public.requests
    SET claimed_count = claimed_count + 1
    WHERE id = _request_id;

  -- If now full, close remaining invited
  IF current_count + 1 >= 3 THEN
    UPDATE public.request_clinics
      SET status = 'closed'
      WHERE request_id = _request_id AND status = 'invited';
  END IF;

  RETURN jsonb_build_object('success', true, 'claimed_count', current_count + 1);
END;
$$;

-- 6. Update messages RLS so claimed clinics can chat
-- (existing policy already checks get_user_clinic_id, which is fine)

-- 7. Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_clinics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;