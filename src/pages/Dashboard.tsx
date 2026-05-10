import { Link } from "react-router-dom"
import { AlertTriangle, Bike, ChevronRight, MapPin, Plus, Route, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import BlindSpotLogo from "../components/BlindSpotLogo"
import { supabase } from "../lib/supabase"
import type { Report } from "../lib/supabase"
import { realIncidents } from "../data/realIncidents"
import { useAuth } from "../lib/auth"

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
      if (data) setReports(data)
    }
    load()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel("reports-home")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" },
        (payload) => setReports((prev) => [payload.new as Report, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const combinedReports = [...realIncidents, ...reports]
  const highRisk = combinedReports.filter((r) => r.severity === "High")
  const latestHighRisk = highRisk[0]

  return (
    <div className="app-shell">
      <div className="mobile-canvas">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BlindSpotLogo className="h-16 w-16 shrink-0" />
            <div>
              <p className="eyebrow">BlindSpot</p>
              <h1 className="text-2xl font-black">Home</h1>
            </div>
          </div>
          <button onClick={signOut} className="rounded-full bg-white/70 px-4 py-2 text-xs font-bold text-zinc-600">
            Sign out
          </button>
        </header>

        <section className="mt-8">
          <h2 className="text-4xl font-black leading-none">
            See it. Signal it. Fix it.
          </h2>
          <p className="muted-copy mt-4">
            A simple safety layer for Davis cyclists.
          </p>
        </section>

        <section className="mt-7 grid gap-3">
          <Link to="/map" className="primary-action flex items-center justify-between rounded-[1.75rem] px-5 py-5">
            <span className="flex items-center gap-3">
              <MapPin className="h-6 w-6" />
              View safety map
            </span>
            <ChevronRight className="h-5 w-5" />
          </Link>
          <Link to="/report" className="secondary-action flex items-center justify-between rounded-[1.75rem] px-5 py-5">
            <span className="flex items-center gap-3">
              <Plus className="h-6 w-6" />
              Report a near miss
            </span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </section>

        <section className="mt-7 grid grid-cols-3 gap-3">
          <div className="soft-card rounded-3xl p-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <p className="mt-4 text-2xl font-black">{combinedReports.length}</p>
            <p className="text-xs text-zinc-500">Signals</p>
          </div>
          <div className="soft-card rounded-3xl p-4">
            <ShieldCheck className="h-5 w-5 text-red-500" />
            <p className="mt-4 text-2xl font-black">{highRisk.length}</p>
            <p className="text-xs text-zinc-500">High risk</p>
          </div>
          <div className="soft-card rounded-3xl p-4">
            <Bike className="h-5 w-5 text-green-600" />
            <p className="mt-4 text-2xl font-black">{reports.length}</p>
            <p className="text-xs text-zinc-500">Community</p>
          </div>
        </section>

        {latestHighRisk && (
          <section className="glass-panel mt-7 rounded-[1.75rem] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-500">Watch this zone</p>
                <h3 className="mt-2 text-xl font-black">{latestHighRisk.location}</h3>
                <p className="muted-copy mt-2 text-sm">{latestHighRisk.type}</p>
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                High
              </span>
            </div>
          </section>
        )}

        <section className="mt-7 space-y-3">
          <Link to="/planner" className="soft-card flex items-center justify-between rounded-3xl p-5">
            <span className="flex items-center gap-3">
              <Route className="h-5 w-5 text-orange-500" />
              Ask the AI safety analyst
            </span>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </Link>
          <Link to="/insights" className="soft-card flex items-center justify-between rounded-3xl p-5">
            <span className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              View community insights
            </span>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </Link>
        </section>

        <div className="mt-6 text-center">
          <p className="truncate text-xs text-zinc-500">
            Signed in as {user?.email}
          </p>
          <Link to="/my-reports" className="mt-2 inline-flex text-xs font-bold text-zinc-700 underline">
            View my reports
          </Link>
        </div>

        <Navbar />
      </div>
    </div>
  )
}
