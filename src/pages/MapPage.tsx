import { Fragment, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polyline,
  Circle,
} from "react-leaflet"
import L from "leaflet"
import { AlertTriangle, FileWarning } from "lucide-react"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"
import type { Report } from "../lib/supabase"
import { safestRoute, dangerousRoute } from "../data/mockRoutes"
import { realIncidents } from "../data/realIncidents"

const center: [number, number] = [38.5449, -121.7405]

function SetView() {
  const map = useMap()
  map.setView(center, 14)
  return null
}

function createDangerIcon(severity: string) {
  const color =
    severity === "High" ? "#ef4444" :
    severity === "Medium" ? "#f97316" : "#22c55e"

  const size =
    severity === "High" ? 24 :
    severity === "Medium" ? 20 : 18

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: white;
      border: 2px solid ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.22);
    ">
      <div style="
        width: ${size * 0.42}px;
        height: ${size * 0.42}px;
        background: ${color};
        border-radius: 50%;
      "></div>
    </div>
  `

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function sourceForReport(report: Report) {
  return report.ai_classification ? "Community Report + AI" : "Community Report"
}

export default function MapPage() {
  const [showSafeRoute, setShowSafeRoute] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const combinedReports = [...realIncidents, ...reports]

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("reports").select("*")
      if (data) setReports(data)
    }
    load()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel("reports-map")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload) => setReports((prev) => [...prev, payload.new as Report])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="app-shell">
      <div className="relative h-screen w-full max-w-[430px] overflow-hidden bg-[#f6f8fb]">
        <MapContainer className="h-full w-full" center={center} zoom={14}>
          <SetView />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {combinedReports.map((report) => {
            const source = "source" in report ? report.source : sourceForReport(report)
            const detail = "description" in report ? report.description : report.note
            const suggestedFix = report.ai_classification?.suggested_fix

            return (
              <Fragment key={report.id}>
                <Circle
                  center={[report.latitude, report.longitude]}
                  radius={report.severity === "High" ? 90 : report.severity === "Medium" ? 70 : 50}
                  pathOptions={{
                    color: report.severity === "High" ? "#ef4444" : "#f97316",
                    fillColor: report.severity === "High" ? "#ef4444" : "#f97316",
                    fillOpacity: report.severity === "High" ? 0.08 : 0.06,
                    opacity: 0.28,
                    weight: 1,
                  }}
                />
                <Marker
                  position={[report.latitude, report.longitude]}
                  icon={createDangerIcon(report.severity)}
                >
                  <Popup>
                    <div className="min-w-[220px]">
                      <h3 className="text-base font-bold">{report.type}</h3>
                      <p className="mt-1 text-sm text-gray-600">{report.location}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-700">
                        Source: {source}
                      </p>
                      {detail && (
                        <p className="mt-2 text-sm italic text-gray-500">"{detail}"</p>
                      )}
                      {suggestedFix && (
                        <div className="mt-2 rounded-lg bg-orange-50 p-2">
                          <p className="text-xs font-bold text-orange-700">Infrastructure Recommendation</p>
                          <p className="text-xs text-gray-600">{suggestedFix}</p>
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          report.severity === "High" ? "bg-red-100 text-red-600"
                          : report.severity === "Medium" ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                        }`}>
                          {report.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </Fragment>
            )
          })}

          {showSafeRoute && (
            <>
              <Polyline
                positions={dangerousRoute as [number, number][]}
                pathOptions={{ color: "#ef4444", weight: 5, opacity: 0.5, dashArray: "10" }}
              />
              <Polyline
                positions={safestRoute as [number, number][]}
                pathOptions={{ color: "#22c55e", weight: 7 }}
              />
            </>
          )}
        </MapContainer>

        <div className="pointer-events-none absolute inset-0 z-[900] bg-white/55 backdrop-blur-[1px]" />
        <div className="pointer-events-none absolute left-4 top-52 z-[950] h-36 w-36 rounded-full bg-red-500/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-72 z-[950] h-32 w-32 rounded-full bg-orange-400/35 blur-3xl" />
        <div className="pointer-events-none absolute left-16 bottom-72 z-[950] h-28 w-28 rounded-full bg-yellow-300/35 blur-3xl" />

        <div className="absolute left-7 right-7 top-20 z-[1000] rounded-[1.65rem] bg-red-500 px-5 py-5 text-white shadow-xl shadow-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 shrink-0" />
            <div>
              <h1 className="text-lg font-black">High Right-Hook Risk Zone</h1>
              <p className="mt-1 text-sm font-semibold text-red-50">
                {combinedReports.length} incidents across Davis signals
              </p>
            </div>
          </div>
        </div>

        <div className="absolute right-7 top-48 z-[1000] rounded-[1.5rem] bg-white p-5 text-[#063664] shadow-xl shadow-slate-200">
          <p className="mb-3 text-sm font-black">Danger Levels</p>
          <div className="space-y-2 text-sm font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-red-500" /> High
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-orange-500" /> Medium
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-yellow-400" /> Low
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSafeRoute(!showSafeRoute)}
          className="primary-action absolute left-7 top-44 z-[1000] rounded-full px-5 py-3 text-sm"
        >
          {showSafeRoute ? "Hide route" : "Safer route"}
        </button>

        {/* Report FAB */}
        <Link
          to="/report"
          className="primary-action absolute bottom-56 right-7 z-[1000] flex h-14 w-14 items-center justify-center rounded-full"
        >
          <FileWarning className="h-7 w-7" />
        </Link>

        <div className="absolute bottom-20 left-0 right-0 z-[1000] rounded-t-[2.25rem] bg-white px-7 pb-8 pt-5 text-[#063664] shadow-2xl shadow-slate-300">
          <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-slate-300" />
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black">
              {highRiskLocation(combinedReports)}
            </h2>
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-600">
              {combinedReports.length} reports
            </span>
          </div>
          <p className="mt-2 font-semibold text-slate-500">Last reported from live community signals</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-xl bg-[#063664] px-4 py-2 text-sm font-bold text-white">Right Hook</span>
            <span className="rounded-xl bg-[#063664] px-4 py-2 text-sm font-bold text-white">Close Pass</span>
            <span className="rounded-xl bg-[#063664] px-4 py-2 text-sm font-bold text-white">Poor Lighting</span>
          </div>

          {showSafeRoute && (
            <div className="mt-5 rounded-2xl border border-orange-300 bg-orange-50 px-4 py-3">
              <p className="text-sm font-black text-[#063664]">Safety Tip</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">Lower exposure route highlighted. Review hazard zones before you ride.</p>
            </div>
          )}

          <div className="mt-5 space-y-2">
            {combinedReports
              .filter((r) => r.severity === "High")
              .slice(0, 2)
              .map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between border-t border-slate-100 pt-3"
                >
                  <div>
                    <p className="text-sm font-black">{report.location}</p>
                    <p className="text-xs font-semibold text-slate-500">{report.type}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-black text-red-600">
                    {report.severity}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  )
}

function highRiskLocation(reports: Array<Report | (typeof realIncidents)[number]>) {
  return reports.find((report) => report.severity === "High")?.location ?? "Hutchison Dr & Covell Blvd"
}
