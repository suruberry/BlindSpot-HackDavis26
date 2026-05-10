# BlindSpot

> See it. Signal it. Fix it.

BlindSpot is a community-powered cyclist safety intelligence platform for Davis, California. It combines public crash hotspot context, live community near-miss reports, and AI-generated infrastructure recommendations so dangerous bike corridors can be identified before someone gets hurt.

Cyclist crashes do not happen randomly. They often cluster around the same invisible danger zones: confusing crossings, unsafe merges, poor lighting, fast turns, and missing bike protection. BlindSpot makes those patterns visible.

**Live demo:** https://blindspot-two.vercel.app/

---

## Hackathon Pitch

BlindSpot turns near-misses into real-time city planning intelligence.

Most city safety systems react after crashes are officially reported. But cyclists experience warning signs long before that: close passes, blocked bike lanes, unsafe turns, and intersections that simply feel wrong. Those moments rarely make it into public datasets.

BlindSpot fills that missing layer. Riders can signal a near-miss in seconds, the report appears on a live safety map, and the planner mode helps translate clustered risk into concrete infrastructure fixes.

The core demo story:

1. Open the safety map and show Davis public hotspots alongside community signals.
2. Click a risk zone to show severity, source, and an infrastructure recommendation.
3. Submit a new near-miss report live.
4. Watch it feed into the map and planning workflow.
5. Ask the AI planner which intersections need urgent bike safety improvements.

This is not just a map app. It is a community-powered early warning system for cyclist safety.

---

## What It Does

- Lets cyclists report near-misses quickly from a mobile-first interface.
- Displays public Davis safety hotspots and live community reports on one map.
- Labels each signal by source, such as public safety data or community report.
- Uses severity markers and radius overlays to make risk zones easy to scan.
- Uses Claude through a Supabase Edge Function to classify reports and suggest infrastructure fixes.
- Provides a planner mode for asking safety questions about the combined dataset.
- Uses Supabase Auth and row-level security so reports can be tied to users.
- Gives each signed-in user a personal report history page.
- Deploys as a Vercel web app with Supabase for database, auth, realtime, and serverless AI calls.

---

## Why It Matters

Davis is one of the most bike-heavy cities in the United States, but even bike-friendly cities still have dangerous intersections and underreported near-miss patterns.

Public crash datasets are valuable, but they usually capture collisions after harm has happened. Near-misses are earlier signals. BlindSpot helps surface those signals while there is still time to fix the street design.

In our initial Davis cyclist survey, only 1 of 12 respondents said they would report a close call to police or the city. 92% either would not report it or would not know how. BlindSpot makes that reporting step simple enough to actually happen.

---

## Key Features

### Live Safety Map

The map blends:

- Davis public safety hotspot context based on the City of Davis Local Road Safety Plan and SWITRS collision summaries.
- Live BlindSpot community near-miss submissions.

Map details include:

- severity-based markers
- source labels
- compact risk zone list
- safer route preview
- clean mobile-first interface

### Near-Miss Reporting

The report flow lets users:

1. Choose an incident type.
2. Add a location and optional details.
3. Submit the signal.
4. See confirmation that the report was saved and added to the map.
5. Review their own submitted reports from the My Reports page.

### AI Safety Planner

Planner mode uses Claude to reason over the combined safety signals and answer questions like:

- Which intersections need bike lane improvements most urgently?
- Where are the highest-risk conflict zones?
- What infrastructure fixes would reduce cyclist exposure?

Claude is called through a Supabase Edge Function, so the Anthropic API key is not shipped to the browser.

### Home and Insights

The Home screen summarizes the current signal count, high-risk areas, and community reports. The Insights page frames the bigger civic story: near-misses are invisible data, and BlindSpot turns them into usable safety intelligence.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Maps | React Leaflet, OpenStreetMap/CARTO tiles |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| AI | Claude via Supabase Edge Functions |
| Deployment | Vercel |
| Public Data Context | City of Davis LRSP and SWITRS summaries |

---

## Architecture

```text
Cyclist near-miss report
    ↓
React report form
    ↓
Supabase Auth user session
    ↓
Supabase Edge Function
    ↓
Claude risk classification
    ↓
Supabase PostgreSQL reports table
    ↓
Realtime map + dashboard updates

City of Davis LRSP / SWITRS hotspot context
    ↓
Curated real incident dataset
    ↓
Map + dashboard + planner context
```

---

## Data Sources

- City of Davis Transportation resources, including the Local Road Safety Plan context.
- California Statewide Integrated Traffic Records System (SWITRS), as summarized in Davis safety planning materials.
- BlindSpot live community near-miss submissions.
- Initial Davis cyclist survey responses collected for HackDavis 2026.

The public safety layer is used as hotspot context, not as a complete raw crash ETL pipeline. BlindSpot is designed to add the missing near-miss layer that traditional collision datasets do not capture.

---

## Local Setup

Clone the repository:

```bash
git clone https://github.com/suruberry/BlindSpot-HackDavis26.git
cd BlindSpot-HackDavis26
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Supabase Notes

The frontend should only use public Vite-safe variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not expose the Anthropic key in frontend environment variables. Store it as a Supabase Edge Function secret:

```bash
supabase secrets set ANTHROPIC_API_KEY=your_key
```

Deploy the Claude function:

```bash
supabase functions deploy claude
```

Apply the auth/report migration in Supabase:

```sql
alter table public.reports
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.reports enable row level security;

create policy "Anyone can read reports"
  on public.reports for select
  using (true);

create policy "Users can insert their own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);
```

---

## Reports Table Shape

```sql
create table reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  type text not null,
  location text not null,
  latitude double precision not null,
  longitude double precision not null,
  severity text,
  note text,
  ai_classification jsonb,
  created_at timestamptz default now()
);
```

---

## Judge-Relevant Highlights

- Real user research through an initial Davis cyclist survey.
- Davis-specific social impact and public safety framing.
- Live reporting and realtime map updates.
- Public safety hotspot context blended with community reports.
- AI classification and infrastructure recommendations.
- Secure API architecture using Supabase Edge Functions instead of browser-exposed AI keys.
- Minimal, mobile-first UI designed around quick reporting.

---

## Future Work

- Expand the public data pipeline with fuller SWITRS ingestion.
- Add richer geocoding for user-entered locations.
- Add city staff dashboards for trend review and export.
- Add safer-route scoring based on clustered risk exposure.
- Support additional bike-heavy cities beyond Davis.

---

## Built at HackDavis 2026

BlindSpot makes invisible danger visible before it becomes a crash statistic.
