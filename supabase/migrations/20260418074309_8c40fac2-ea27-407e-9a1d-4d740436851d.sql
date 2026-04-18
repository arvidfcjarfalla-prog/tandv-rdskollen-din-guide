-- ============================================
-- Tandskadekollen: full schema
-- ============================================

-- Enums
CREATE TYPE public.app_role AS ENUM ('patient', 'clinic', 'admin');
CREATE TYPE public.request_status AS ENUM ('open', 'quoted', 'accepted', 'declined', 'closed');
CREATE TYPE public.offer_status AS ENUM ('pending', 'accepted', 'declined', 'withdrawn');

-- ============================================
-- profiles (patient profile)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  birth_year INTEGER,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- user_roles (separate table - critical for security)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  clinic_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.user_roles
  WHERE user_id = _user_id AND role = 'clinic'
  LIMIT 1
$$;

-- ============================================
-- clinics
-- ============================================
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_number TEXT,
  address TEXT,
  area TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_clinic_fk FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL;

-- ============================================
-- requests
-- ============================================
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track TEXT,
  selected_teeth TEXT[] DEFAULT '{}',
  treatments JSONB DEFAULT '[]',
  treatment_free_text TEXT,
  symptom TEXT,
  pain_level INTEGER,
  description TEXT,
  time_preference TEXT,
  area TEXT,
  status public.request_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- offers
-- ============================================
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  total_price INTEGER NOT NULL,
  line_items JSONB DEFAULT '[]',
  earliest_date DATE,
  message TEXT,
  valid_until DATE,
  status public.offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- messages (chat between patient & clinic on a request)
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role public.app_role NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- reviews
-- ============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- updated_at trigger fn
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_clinics_updated BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_requests_updated BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_offers_updated BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Auto-create profile + patient role on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );

  -- Default role is patient unless metadata says otherwise (clinics created by admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS POLICIES
-- ============================================

-- profiles: own only
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_roles: users can read own roles; only admins manage
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- clinics: public readable; only admins or own clinic-staff can update
CREATE POLICY "Clinics public read" ON public.clinics FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert clinics" ON public.clinics FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update clinics" ON public.clinics FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clinic staff update own clinic" ON public.clinics FOR UPDATE USING (id = public.get_user_clinic_id(auth.uid()));

-- requests: patient owns; all clinics can read open requests
CREATE POLICY "Patient reads own requests" ON public.requests FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Clinics read all requests" ON public.requests FOR SELECT USING (public.has_role(auth.uid(), 'clinic'));
CREATE POLICY "Patient creates request" ON public.requests FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patient updates own request" ON public.requests FOR UPDATE USING (auth.uid() = patient_id);

-- offers: clinic creates; patient who owns request can read; clinic reads its own
CREATE POLICY "Clinic reads own offers" ON public.offers FOR SELECT USING (clinic_id = public.get_user_clinic_id(auth.uid()));
CREATE POLICY "Patient reads offers on own requests" ON public.offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.requests r WHERE r.id = offers.request_id AND r.patient_id = auth.uid())
);
CREATE POLICY "Clinic inserts offer" ON public.offers FOR INSERT WITH CHECK (
  clinic_id = public.get_user_clinic_id(auth.uid())
);
CREATE POLICY "Clinic updates own offer" ON public.offers FOR UPDATE USING (clinic_id = public.get_user_clinic_id(auth.uid()));
CREATE POLICY "Patient updates offer status" ON public.offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.requests r WHERE r.id = offers.request_id AND r.patient_id = auth.uid())
);

-- messages: participants only
CREATE POLICY "Participants read messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.requests r WHERE r.id = messages.request_id AND r.patient_id = auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = public.get_user_clinic_id(auth.uid()))
);
CREATE POLICY "Participants insert messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    EXISTS (SELECT 1 FROM public.requests r WHERE r.id = messages.request_id AND r.patient_id = auth.uid())
    OR (clinic_id IS NOT NULL AND clinic_id = public.get_user_clinic_id(auth.uid()))
  )
);

-- reviews: public read; patient writes own
CREATE POLICY "Reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Patient writes own review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patient updates own review" ON public.reviews FOR UPDATE USING (auth.uid() = patient_id);

-- Indexes
CREATE INDEX idx_requests_patient ON public.requests(patient_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_offers_request ON public.offers(request_id);
CREATE INDEX idx_offers_clinic ON public.offers(clinic_id);
CREATE INDEX idx_messages_request ON public.messages(request_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);