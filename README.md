# BlindSpot 🚲

> Community-powered cyclist safety intelligence for safer cities.

BlindSpot transforms cyclist near-misses into real-time safety intelligence — helping riders avoid dangerous areas before accidents happen and giving cities actionable data to improve infrastructure where it matters most.

**Live Demo:** https://blindspot-two.vercel.app/

---

# The Problem

Cities usually react to cyclist safety issues *after* accidents occur.

But near-misses are the real warning signs.

Most dangerous intersections already have patterns:
- unsafe merges
- poor lighting
- aggressive turns
- missing bike lanes
- confusing crossings

Yet near-misses rarely get reported because reporting systems are slow, complicated, or inaccessible.

BlindSpot makes reporting frictionless and turns invisible danger into usable public safety data.

---

# Our Solution

BlindSpot is a real-time cyclist safety platform where users can:
- report near-misses in seconds
- visualize dangerous intersections on a live map
- discover safer routes
- help cities identify infrastructure problems before crashes happen

Using AI-powered analysis and community reports, BlindSpot creates a live safety layer for cities.

---

# Features

## 🗺️ Live Safety Map
Interactive map displaying community-reported danger zones across Davis.

- Real-time incident updates
- Severity-based risk markers
- Smart incident clustering
- Mobile-first responsive UI

---

## ⚡ 3-Second Near-Miss Reporting
Fast and frictionless reporting flow.

Users can:
1. Select incident type
2. Add location/details
3. Submit instantly

Reports immediately appear on the live map.

---

## 🤖 AI Safety Analyst
AI-powered planner interface for identifying infrastructure risks.

Example prompts:
- “Which intersections are most dangerous?”
- “Where should bike lane improvements be prioritized?”
- “Which areas have the highest nighttime risk?”

The AI analyzes incident trends and generates actionable safety insights.

---

## 🛡️ Safe Route Mode
Compares dangerous vs safer routes using community-reported hazard zones.

Cyclists can:
- avoid high-risk intersections
- reduce exposure to unsafe roads
- make safer navigation decisions

---

## 📊 Community Insights Dashboard
Visual dashboard built from collected cyclist safety research and reporting trends.

Highlights:
- near-miss frequency
- dangerous infrastructure patterns
- reporting behavior
- common incident types

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | TailwindCSS |
| Maps | React Leaflet + OpenStreetMap |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime |
| AI | Claude via Supabase Edge Functions |
| Deployment | Vercel |

---

# Architecture

```text
User Report
    ↓
React Frontend
    ↓
Supabase Edge Function
    ↓
Claude AI Classification
    ↓
Supabase PostgreSQL
    ↓
Realtime Map Updates
````

---

# Local Setup

## Clone the Repository

```bash
git clone https://github.com/yourusername/blindspot
cd blindspot
```

## Install Dependencies

```bash
npm install
```

## Create Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Start Development Server

```bash
npm run dev
```

---

# Database Schema

```sql
create table reports (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  location text not null,
  latitude double precision not null,
  longitude double precision not null,
  severity text,
  note text,
  ai_analysis jsonb,
  created_at timestamptz default now()
);
```

---

# Vision

BlindSpot is designed for Davis — but every city has dangerous intersections and invisible near-miss patterns.

Our vision is to create a scalable safety intelligence platform that helps communities proactively improve cyclist infrastructure before accidents happen.

---

# Prize Categories

* 🏆 Best Hack for Social Good
* 🤖 Best AI/ML Hack
* 🎨 Best UI/UX Design
* 📊 Best Use of Community Data

---

# Built at HackDavis 2026

*Making invisible danger visible.*

```
```
