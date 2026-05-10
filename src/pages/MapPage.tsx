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
  map.setView(center, 15)
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
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.24);
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
        <MapContainer className="h-full w-full" center={center} zoom={15} zoomControl={false}>
          <SetView />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            pane="shadowPane"
          />

          {combinedReports.map((report) => {
            const source = "source" in report ? report.source : sourceForReport(report)
            const detail = "description" in report ? report.description : report.note
            const suggestedFix = report.ai_classification?.suggested_fix

            return (
              <Fragment key={report.id}>
                <Circle
                  center={[report.latitude, report.longitude]}
                  radius={report.severity === "High" ? 70 : report.severity === "Medium" ? 54 : 40}
                  pathOptions={{
                    color: report.severity === "High" ? "#ef4444" : "#f97316",
                    fillColor: report.severity === "High" ? "#ef4444" : "#f97316",
                    fillOpacity: report.severity === "High" ? 0.12 : 0.08,
                    opacity: 0.38,
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

        <div className="pointer-events-none absolute left-5 top-44 z-[950] h-24 w-24 rounded-full bg-red-500/10 blur-2xl" />
        <div className="pointer-events-none absolute right-8 top-72 z-[950] h-24 w-24 rounded-full bg-orange-400/10 blur-2xl" />

        <div className="absolute left-5 right-5 top-5 z-[1000] rounded-[1.35rem] bg-red-500 px-4 py-4 text-white shadow-xl shadow-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <h1 className="text-base font-black">High Risk Zones</h1>
              <p className="mt-1 text-sm font-semibold text-red-50">
                {combinedReports.length} Davis safety signals
              </p>
            </div>
          </div>
        </div>

        <div className="absolute right-5 top-28 z-[1000] rounded-[1.25rem] bg-white/95 p-4 text-[#063664] shadow-xl shadow-slate-200">
          <p className="mb-2 text-xs font-black">Danger Levels</p>
          <div className="space-y-1.5 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" /> High
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-500" /> Medium
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-yellow-400" /> Low
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSafeRoute(!showSafeRoute)}
          className="primary-action absolute left-5 top-28 z-[1000] rounded-full px-4 py-2.5 text-sm"
        >
          {showSafeRoute ? "Hide route" : "Safer route"}
        </button>

        {/* Report FAB */}
        <Link
          to="/report"
          className="primary-action absolute bottom-52 right-5 z-[1000] flex h-13 w-13 items-center justify-center rounded-full"
        >
          <FileWarning className="h-7 w-7" />
        </Link>

        <div className="absolute bottom-20 left-0 right-0 z-[1000] max-h-[42vh] overflow-y-auto rounded-t-[2rem] bg-white px-6 pb-7 pt-4 text-[#063664] shadow-2xl shadow-slate-300">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-300" />
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black">
              {highRiskLocation(combinedReports)}
            </h2>
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-600">
              {combinedReports.length} reports
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">Tap markers for source, severity, and recommendations.</p>

          <div className="mt-4 flex flex-wrap gap-2">
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
