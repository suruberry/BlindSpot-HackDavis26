import Navbar from "../components/Navbar"
import { Link } from "react-router-dom"
import { AlertTriangle, Bell, CheckCircle2, Eye, MapPinned, Users } from "lucide-react"

const responses = 12

const stats = [
  {
    icon: AlertTriangle,
    value: "92%",
    label: "Would not report, or would not know how",
    sub: "11 out of 12 respondents",
    color: "text-red-500",
    bg: "bg-red-50 border-red-100",
  },
  {
    icon: Eye,
    value: "67%",
    label: "Experienced at least one near-miss in 6 months",
    sub: "8 out of 12 respondents",
    color: "text-orange-500",
    bg: "bg-orange-50 border-orange-100",
  },
  {
    icon: CheckCircle2,
    value: "92%",
    label: "Would tag a dangerous location if it is fast",
    sub: "9 yes, 2 if it is super fast",
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
  },
  {
    icon: Bell,
    value: "3.4 / 5",
    label: "Average helpfulness rating for safety alerts",
    sub: "5 was the most common rating",
    color: "text-zinc-900",
    bg: "bg-white/75 border-zinc-200",
  },
]

const reportIntent = [
  { label: "No", count: 7, color: "bg-red-500" },
  { label: "Wouldn't know how", count: 4, color: "bg-orange-500" },
  { label: "Yes", count: 1, color: "bg-green-600" },
]

const infraIssues = [
  { label: "Right-hook risks", count: 8, color: "bg-red-500" },
  { label: "Bike lane ending abruptly", count: 7, color: "bg-orange-500" },
  { label: "Poor lighting/visibility", count: 7, color: "bg-yellow-500" },
  { label: "Slippery/uneven pavement", count: 7, color: "bg-zinc-600" },
]

const nearMisses = [
  { label: "0", count: 4, color: "bg-zinc-400" },
  { label: "1-2", count: 2, color: "bg-yellow-500" },
  { label: "3-5", count: 2, color: "bg-orange-500" },
  { label: "5+", count: 4, color: "bg-red-500" },
]

const bikeFrequency = [
  { label: "Daily", count: 6, color: "bg-zinc-900" },
  { label: "Weekly", count: 2, color: "bg-zinc-500" },
  { label: "Rarely", count: 2, color: "bg-zinc-400" },
  { label: "Never", count: 2, color: "bg-zinc-300" },
]

const alertRatings = [
  { label: "1", count: 2 },
  { label: "2", count: 2 },
  { label: "3", count: 2 },
  { label: "4", count: 1 },
  { label: "5", count: 5 },
]

const tagWillingness = [
  { label: "Yes", count: 9, color: "bg-green-600" },
  { label: "Only if super fast", count: 2, color: "bg-orange-500" },
  { label: "No", count: 1, color: "bg-red-500" },
]

function pct(count: number) {
  return Math.round((count / responses) * 100)
}

function HorizontalBars({
  data,
  max = responses,
}: {
  data: { label: string; count: number; color: string }[]
  max?: number
}) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-zinc-700">{item.label}</span>
            <span className="shrink-0 text-sm font-black text-zinc-900">
              {item.count}/{responses}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
            <div
              className={`h-full rounded-full ${item.color}`}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-zinc-500">{pct(item.count)}%</p>
        </div>
      ))}
    </div>
  )
}

function DistributionChart({
  data,
  max,
}: {
  data: { label: string; count: number }[]
  max: number
}) {
  return (
    <div className="flex h-40 items-end gap-3 rounded-3xl border border-zinc-200 bg-white/70 px-4 pb-4 pt-6">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-end justify-center">
            <div
              className="w-full max-w-10 rounded-t-2xl bg-zinc-900"
              style={{ height: `${Math.max(10, (item.count / max) * 100)}%` }}
            />
          </div>
          <p className="text-xs font-black text-zinc-900">{item.count}</p>
          <p className="text-xs font-semibold text-zinc-500">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

function StackedBar({
  data,
}: {
  data: { label: string; count: number; color: string }[]
}) {
  return (
    <div>
      <div className="flex h-5 overflow-hidden rounded-full bg-zinc-200">
        {data.map((item) => (
          <div
            key={item.label}
            className={item.color}
            style={{ width: `${pct(item.count)}%` }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>
      <div className="mt-3 grid gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              {item.label}
            </span>
            <span className="text-sm font-black text-zinc-900">
              {item.count} ({pct(item.count)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InsightsPage() {
  return (
    <div className="app-shell">
      <div className="mobile-canvas pb-32">
        <header className="mobile-dark-hero">
          <p className="eyebrow-pill">User Research</p>
          <h1 className="mt-7 text-4xl font-black leading-none">Community Insights</h1>
          <p className="mt-5 text-lg font-semibold text-blue-100">
            See it. Signal it. Fix it.
          </p>
        </header>

        <div className="-mt-8 rounded-[1.75rem] bg-white p-6 shadow-xl shadow-slate-200">
          <div className="flex items-start gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-500">
              <Users className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                12 Davis cyclist responses
              </p>
              <p className="mt-2 text-xl font-black leading-snug text-[#063664]">
                The biggest gap is not awareness. It is reporting friction.
              </p>
              <p className="muted-copy mt-2 text-sm">
                Only 1 of 12 respondents said they would report a close call to police or the city.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-7 space-y-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[1.75rem] bg-white p-7 shadow-xl shadow-slate-200">
              <div className="flex items-start gap-4">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${s.bg.split(" ")[0]} ${s.color}`}>
                  <s.icon className="h-7 w-7" />
                </span>
                <div>
                  <p className={`text-5xl font-black leading-none ${s.color}`}>{s.value}</p>
                  <p className="mt-4 text-xl font-black text-[#063664]">{s.label}</p>
                  <p className="mt-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500">{s.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-7 rounded-[1.75rem] bg-white p-6 shadow-xl shadow-slate-200">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <h2 className="text-xl font-black text-[#063664]">Reporting Gap</h2>
              <p className="text-sm text-zinc-500">Would riders report a close call today?</p>
            </div>
          </div>
          <StackedBar data={reportIntent} />
        </section>

        <section className="mt-7 rounded-[1.75rem] bg-white p-6 shadow-xl shadow-slate-200">
          <div className="mb-5 flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-orange-500" />
            <div>
              <h2 className="text-xl font-black text-[#063664]">Top Infrastructure Issues</h2>
              <p className="text-sm text-zinc-500">What made riders feel unsafe</p>
            </div>
          </div>
          <HorizontalBars data={infraIssues} />
        </section>

        <section className="mt-7 rounded-[1.75rem] bg-white p-6 shadow-xl shadow-slate-200">
          <h2 className="text-2xl font-black text-[#063664]">Near-Miss Frequency</h2>
          <p className="muted-copy mt-1 text-sm">In the last 6 months</p>
          <div className="mt-5">
            <HorizontalBars data={nearMisses} max={4} />
          </div>
        </section>

        <section className="mt-7 rounded-[1.75rem] bg-white p-6 shadow-xl shadow-slate-200">
          <h2 className="text-2xl font-black text-[#063664]">Safety Alert Interest</h2>
          <p className="muted-copy mt-1 text-sm">
            Rating for a phone vibration near known hot spots
          </p>
          <div className="mt-5">
            <DistributionChart data={alertRatings} max={5} />
          </div>
        </section>

        <section className="mt-7 rounded-[1.75rem] bg-white p-6 shadow-xl shadow-slate-200">
          <h2 className="text-xl font-black text-[#063664]">3-Second Tagging</h2>
          <p className="mb-5 mt-1 text-sm text-zinc-500">
            Would riders tag danger at the end of a ride?
          </p>
          <StackedBar data={tagWillingness} />
        </section>

        <section className="mt-7 grid grid-cols-2 gap-3">
          {bikeFrequency.map((item) => (
            <div key={item.label} className="rounded-[1.4rem] bg-white p-4 shadow-lg shadow-slate-200">
              <div className={`mb-4 h-2 w-10 rounded-full ${item.color}`} />
              <p className="text-3xl font-black text-zinc-900">{pct(item.count)}%</p>
              <p className="mt-1 text-sm font-semibold text-zinc-500">{item.label}</p>
            </div>
          ))}
        </section>

        <div className="mt-7 rounded-[1.75rem] bg-[#063664] p-6 text-white shadow-xl shadow-slate-200">
          <h2 className="text-2xl font-black">Help Improve Safety</h2>
          <p className="mt-4 text-lg font-semibold text-blue-100">
            Your reports make Davis safer for everyone. Every signal counts.
          </p>
          <Link to="/report" className="primary-action mt-6 flex justify-center rounded-2xl px-5 py-4 text-center">
            Report Your Experience
          </Link>
        </div>

        <div className="mt-7 rounded-[1.75rem] bg-white p-6 shadow-xl shadow-slate-200">
          <p className="text-lg font-semibold leading-relaxed text-zinc-700 italic">
            "I wouldn't know how to report a near-miss even if I wanted to."
          </p>
          <p className="mt-3 text-sm font-bold text-zinc-500">
            Davis cyclist survey, May 2026
          </p>
        </div>

        <Navbar />
      </div>
    </div>
  )
}
