import Navbar from "../components/Navbar"
import { Users, AlertTriangle, Eye, Zap } from "lucide-react"

const responses = 9

const stats = [
  {
    icon: Users,
    value: "78%",
    label: "Would NOT report a near-miss to police or city",
    sub: "7 out of 9 respondents",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: AlertTriangle,
    value: "56%",
    label: "Have experienced 1 or more near-misses in 6 months",
    sub: "5 out of 9 respondents",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: Zap,
    value: "89%",
    label: "Would tag a dangerous location to warn other students",
    sub: "8 out of 9 respondents said yes or maybe",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: Eye,
    value: "3.7 / 5",
    label: "Average helpfulness rating for proximity safety alerts",
    sub: "Cyclists want proactive warnings",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
]

const infraIssues = [
  { label: "Bike lane ending abruptly", count: 7 },
  { label: "Right-hook risks", count: 6 },
  { label: "Poor lighting at night", count: 6 },
  { label: "Slippery/uneven pavement", count: 5 },
]

const nearMisses = [
  { label: "0 near-misses", count: 4, pct: 44 },
  { label: "1–2 near-misses", count: 2, pct: 22 },
  { label: "3–5 near-misses", count: 2, pct: 22 },
  { label: "5+ near-misses", count: 1, pct: 11 },
]

const bikeFreq = [
  { label: "Daily", count: 3, pct: 33 },
  { label: "Weekly", count: 2, pct: 22 },
  { label: "Rarely", count: 2, pct: 22 },
  { label: "Never", count: 2, pct: 22 },
]

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-md p-6 pb-32">

        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
          User Research
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">
          Community Insights
        </h1>
        <p className="mt-3 text-gray-400">
          Real survey data from {responses} Davis cyclists collected May 2026.
        </p>

        {/* Key finding callout */}
        <div className="mt-6 rounded-3xl border border-orange-500/30 bg-orange-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
            Key Finding
          </p>
          <p className="mt-2 text-xl font-bold leading-snug">
            78% of cyclists wouldn't report a near-miss — because they don't know how.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            BlindSpot removes that barrier with a 3-second tap report.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mt-8 space-y-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`rounded-3xl border p-5 ${s.bg}`}
            >
              <div className="flex items-start gap-4">
                <s.icon className={`mt-1 h-6 w-6 shrink-0 ${s.color}`} />
                <div>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="mt-1 font-semibold text-white">{s.label}</p>
                  <p className="mt-1 text-sm text-gray-400">{s.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Infrastructure issues */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold">Top Infrastructure Issues</h2>
          <p className="mt-1 text-sm text-gray-400">
            What makes Davis cyclists feel unsafe
          </p>
          <div className="mt-5 space-y-4">
            {infraIssues.map((issue) => (
              <div key={issue.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{issue.label}</span>
                  <span className="text-sm text-orange-400 font-bold">
                    {issue.count}/{responses}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-orange-500 transition-all"
                    style={{ width: `${(issue.count / responses) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Near miss frequency */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold">Near-Miss Frequency</h2>
          <p className="mt-1 text-sm text-gray-400">In the last 6 months</p>
          <div className="mt-5 space-y-4">
            {nearMisses.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-gray-400">{item.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-zinc-500 transition-all"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bike frequency */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold">How Often They Bike</h2>
          <p className="mt-1 text-sm text-gray-400">
            Through high-traffic Davis intersections
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {bikeFreq.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center"
              >
                <p className="text-3xl font-bold text-white">{item.pct}%</p>
                <p className="mt-1 text-sm text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-lg font-medium leading-relaxed text-gray-200 italic">
            "I wouldn't know how to report a near-miss even if I wanted to."
          </p>
          <p className="mt-3 text-sm text-orange-400">
            — Davis cyclist, May 2026 survey
          </p>
        </div>

        <Navbar />
      </div>
    </div>
  )
}