# Tandvards Offert (Lovable-ready)

MVP boilerplate for a Swedish dental damage quote-comparison product inspired by Autobutler/Lasingoo patterns.

## Includes
- React + TypeScript + Vite frontend
- Route scaffolding for patient, clinic, admin flows
- Supabase migration with core domain tables
- Supabase Edge Function scaffold (`create-request`)
- Lovable import guide

## Quick start
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - `npm install`
3. Start dev server:
   - `npm run dev`

## Pages
- `/` landing
- `/request` create request flow
- `/compare` quote comparison
- `/clinic` clinic portal (scaffold)
- `/admin` admin panel (scaffold)

## Data model focus
- Benchmark layer (reference + median)
- Live quote layer (request -> matching -> quotes)
- Event layer (lead events and funnel)

## Lovable compatibility
The structure is kept simple on purpose:
- no custom server runtime
- env-driven configuration
- Supabase-first backend integration
