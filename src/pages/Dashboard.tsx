import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { AlertTriangle, Bike, Clock3, MapPin, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import type { Report } from "../lib/supabase"
import { realIncidents } from "../data/realIncidents"

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
      if (data) setReports(data)
      setLoading(false)
    }
    load()
  }, [])

  // Real-time subscription — map updates live as reports come in
  useEffect(() => {
    const channel = supabase
      .channel("reports-dashboard")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" },
        (payload) => setReports((prev) => [payload.new as Report, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const combinedReports = [...realIncidents, ...reports]
  const highRisk = combinedReports.filter((r) => r.severity === "High")
  const mostReported = combinedReports.length > 0
    ? Object.entries(
        combinedReports.reduce((acc, r) => {
          acc[r.location] = (acc[r.location] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0]?.split(" ").slice(0, 2).join(" ")
    : "Loading..."

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-md p-6 pb-24">

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
            BlindSpot Analytics
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight">
            Infrastructure Risk Dashboard
          </h1>
          <p className="mt-4 text-gray-400">
            Public crash hotspot data and community near-miss reports helping identify
            dangerous cyclist infrastructure before someone gets hurt.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/map" className="rounded-full bg-white px-6 py-3 font-bold text-black">
              View Safety Map
            </Link>
            <Link to="/report" className="rounded-full border border-orange-400 px-6 py-3 font-bold text-orange-400">
              Report Near Miss
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                <AlertTriangle className="mb-4 h-7 w-7 text-orange-400" />
                <p className="text-sm text-gray-400">Safety Signals</p>
                <h2 className="mt-2 text-4xl font-bold">{combinedReports.length}</h2>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                <Bike className="mb-4 h-7 w-7 text-orange-400" />
                <p className="text-sm text-gray-400">High Risk Zones</p>
                <h2 className="mt-2 text-4xl font-bold">{highRisk.length}</h2>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                <Clock3 className="mb-4 h-7 w-7 text-orange-400" />
                <p className="text-sm text-gray-400">Peak Risk Time</p>
                <h2 className="mt-2 text-2xl font-bold">5–8 PM</h2>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
                <MapPin className="mb-4 h-7 w-7 text-orange-400" />
                <p className="text-sm text-gray-400">Public Hotspots</p>
                <h2 className="mt-2 text-4xl font-bold">{realIncidents.length}</h2>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
              <p className="text-sm font-semibold text-orange-400">Most concentrated area</p>
              <p className="mt-1 text-lg font-bold">{mostReported}</p>
              <p className="mt-1 text-xs text-gray-400">
                Data blend: Davis LRSP/SWITRS public hotspots + live BlindSpot reports.
              </p>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recent Near-Miss Reports</h2>
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {combinedReports.map((report) => (
                  <div key={report.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{report.type}</h3>
                        <p className="mt-1 text-sm text-gray-400">{report.location}</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-bold ${
                        report.severity === "High" ? "bg-red-500/20 text-red-400"
                        : report.severity === "Medium" ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                      }`}>
                        {report.severity}
                      </div>
                    </div>
                    {report.ai_classification && (
                      <div className="mt-3 rounded-xl bg-orange-500/10 border border-orange-500/20 p-3">
                        <p className="text-xs text-orange-400 font-semibold">Infrastructure Recommendation</p>
                        <p className="mt-1 text-xs text-gray-300">{report.ai_classification.suggested_fix}</p>
                      </div>
                    )}
                    <p className="mt-3 text-xs font-semibold text-orange-400">
                      Source: {"source" in report ? report.source : "Community Report"}
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Navbar />
      </div>
    </div>
  )
}
