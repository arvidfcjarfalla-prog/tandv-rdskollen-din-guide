# Lovable Import Guide

## 1. Push project to GitHub
1. Create a new repository.
2. Push this folder as main branch.

## 2. Import in Lovable
1. Connect GitHub in Lovable.
2. Import the repository.
3. Set environment variables from `.env.example`.

## 3. Supabase setup
1. Create Supabase project.
2. Run migration: `supabase/migrations/0001_init.sql`.
3. Deploy edge function scaffold: `supabase/functions/create-request`.

## 4. Validate
1. Run `npm install`.
2. Run `npm run dev`.
3. Open `/request` and verify form flow scaffolding.

## 5. Next implementation steps
1. Build request wizard UI and validation.
2. Add quote compare data fetch from Supabase.
3. Add clinic portal auth + role-based views.
4. Add benchmark import job for Tandpriskollen snapshots.
