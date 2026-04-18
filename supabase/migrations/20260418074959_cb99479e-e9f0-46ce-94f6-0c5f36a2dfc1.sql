
-- Insert demo clinic
INSERT INTO public.clinics (id, name, org_number, address, area, description, phone, email, rating, rating_count, active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo Tandklinik Stockholm',
  '556677-8899',
  'Sveavägen 50, 111 34 Stockholm',
  'Stockholm',
  'En modern tandklinik i centrala Stockholm med fokus på högkvalitativ tandvård och personlig service.',
  '08-123 45 67',
  'klinik@tandskadekollen.se',
  4.7,
  128,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Helper function to create test users
DO $$
DECLARE
  admin_uid uuid := '22222222-2222-2222-2222-222222222222';
  clinic_uid uuid := '33333333-3333-3333-3333-333333333333';
  patient_uid uuid := '44444444-4444-4444-4444-444444444444';
  demo_clinic_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_uid) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_uid, 'authenticated', 'authenticated',
      'admin@tandskadekollen.se', crypt('Admin123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin Adminsson"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_uid,
      jsonb_build_object('sub', admin_uid::text, 'email', 'admin@tandskadekollen.se'),
      'email', admin_uid::text, now(), now(), now());
  END IF;

  -- Clinic user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = clinic_uid) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', clinic_uid, 'authenticated', 'authenticated',
      'klinik@tandskadekollen.se', crypt('Klinik123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Anna Klinikchef"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), clinic_uid,
      jsonb_build_object('sub', clinic_uid::text, 'email', 'klinik@tandskadekollen.se'),
      'email', clinic_uid::text, now(), now(), now());
  END IF;

  -- Patient user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = patient_uid) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', patient_uid, 'authenticated', 'authenticated',
      'patient@tandskadekollen.se', crypt('Patient123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Erik Patientsson","phone":"070-123 45 67"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), patient_uid,
      jsonb_build_object('sub', patient_uid::text, 'email', 'patient@tandskadekollen.se'),
      'email', patient_uid::text, now(), now(), now());
  END IF;

  -- Ensure profiles exist (handle_new_user trigger should create them, but be safe)
  INSERT INTO public.profiles (user_id, full_name, email, phone, birth_year)
  VALUES
    (admin_uid, 'Admin Adminsson', 'admin@tandskadekollen.se', NULL, NULL),
    (clinic_uid, 'Anna Klinikchef', 'klinik@tandskadekollen.se', '08-123 45 67', NULL),
    (patient_uid, 'Erik Patientsson', 'patient@tandskadekollen.se', '070-123 45 67', 1985)
  ON CONFLICT DO NOTHING;

  -- Set roles (override default 'patient' role for admin/clinic)
  DELETE FROM public.user_roles WHERE user_id IN (admin_uid, clinic_uid);

  INSERT INTO public.user_roles (user_id, role, clinic_id) VALUES
    (admin_uid, 'admin', NULL),
    (clinic_uid, 'clinic', demo_clinic_id)
  ON CONFLICT DO NOTHING;

  -- Make sure patient has patient role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (patient_uid, 'patient')
  ON CONFLICT DO NOTHING;
END $$;
