import { Link } from "react-router-dom"
import { BarChart3, ChevronRight, MapPin, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Circle, MapContainer, TileLayer } from "react-leaflet"
import Navbar from "../components/Navbar"
import BlindSpotLogo from "../components/BlindSpotLogo"
import { supabase } from "../lib/supabase"
import type { Report } from "../lib/supabase"
import { realIncidents } from "../data/realIncidents"
import { useAuth } from "../lib/auth"

const previewCenter: [number, number] = [38.5449, -121.7405]

function previewCircleStyle(severity: string) {
  const isHigh = severity === "High"
  const isMedium = severity === "Medium"

  return {
    radius: isHigh ? 230 : isMedium ? 160 : 100,
    color: isHigh ? "#ef4444" : isMedium ? "#f97316" : "#eab308",
    fillColor: isHigh ? "#ef4444" : isMedium ? "#f97316" : "#eab308",
    fillOpacity: isHigh ? 0.22 : isMedium ? 0.16 : 0.12,
    opacity: 0.18,
    weight: 1,
  }
}

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
  const recentAlerts = highRisk.slice(0, 2)

  return (
    <div className="app-shell">
      <div className="mobile-canvas">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BlindSpotLogo className="h-12 w-12 shrink-0 rounded-2xl shadow-lg shadow-slate-200" />
            <div>
              <h1 className="text-3xl font-black leading-none text-[#063664]">BlindSpot</h1>
              <p className="text-sm font-bold text-slate-500">Davis, California</p>
            </div>
          </div>
          <div className="text-right">
            <p className="status-pill px-4 py-1 text-sm">72% Safe</p>
            <p className="mt-1 text-xs font-bold text-slate-400">Safety Score</p>
          </div>
        </header>

        <section className="mt-7 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200">
          <div className="relative h-56 overflow-hidden">
            <MapContainer
              className="h-full w-full"
              center={previewCenter}
              zoom={13}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              keyboard={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" pane="shadowPane" />
              {combinedReports.slice(0, 18).map((report) => {
                const style = previewCircleStyle(report.severity)
                return (
                  <Circle
                    key={report.id}
                    center={[report.latitude, report.longitude]}
                    radius={style.radius}
                    pathOptions={style}
                  />
                )
              })}
            </MapContainer>
            <div className="pointer-events-none absolute inset-0 bg-white/10" />
            <span className="absolute left-5 top-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-[#063664] shadow-lg">
              {highRisk.length} danger zones nearby
            </span>
            <Link
              to="/map"
              className="primary-action absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full"
            >
              <MapPin className="h-8 w-8" />
            </Link>
          </div>
          <Link to="/map" className="flex items-center justify-between bg-[#063664] px-6 py-6 text-white">
            <div>
              <h2 className="text-2xl font-black">Safety Zone Map</h2>
              <p className="mt-1 text-lg text-blue-100">Review hazards before you ride</p>
            </div>
            <ChevronRight className="h-6 w-6" />
          </Link>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-4">
          <Link to="/insights" className="overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-200">
            <div className="flex h-24 items-end justify-center gap-2 bg-sky-100 pb-5 text-[#7890aa]">
              <BarChart3 className="h-16 w-16" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-black text-[#063664]">Insights</h3>
              <p className="text-sm font-bold text-slate-500">Community data</p>
            </div>
          </Link>
          <Link to="/planner" className="overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-200">
            <div className="flex h-24 items-center justify-end bg-orange-100 pr-6 text-[#ff8a00]">
              <Sparkles className="h-12 w-12" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-black text-[#063664]">AI Planner</h3>
              <p className="text-sm font-bold text-slate-500">Ask questions</p>
            </div>
          </Link>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-700">Recent Alerts</h2>
            <Link to="/map" className="text-sm font-black text-slate-500">See All</Link>
          </div>
          <div className="space-y-4">
            {recentAlerts.map((alert, index) => (
              <Link key={alert.id} to="/map" className="block overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-200">
                <div className="road-art relative h-32">
                  <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-black text-[#063664] shadow-md">
                    {index === 0 ? combinedReports.length : Math.max(1, highRisk.length)} reports
                  </span>
                  <span className="absolute right-5 top-5 rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white">
                    HIGH
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-black text-[#063664]">{alert.location}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{alert.type}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-6 text-center text-xs font-bold text-slate-500">
          <p className="truncate">
            Signed in as {user?.email}
          </p>
          <Link to="/my-reports" className="mt-2 inline-flex text-[#ff8a00] underline">
            View my reports
          </Link>
          <button onClick={signOut} className="ml-4 underline">Sign out</button>
        </div>

        <Navbar />
      </div>
    </div>
  )
}
