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
import { AlertTriangle, FileWarning, MapPin } from "lucide-react"
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
      <div className="relative h-screen w-full max-w-[430px] overflow-hidden bg-zinc-200">
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

        {/* Header */}
        <div className="glass-panel absolute left-4 right-4 top-4 z-[1000] rounded-[1.5rem] p-3 text-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <h1 className="text-base font-black">Safety Map</h1>
                <p className="text-xs text-zinc-500">See it. Signal it. Fix it.</p>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
              {combinedReports.length} signals
            </span>
          </div>
          <div className="mt-3 flex gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-red-100 px-2 py-1 text-red-600">
              {realIncidents.length} public
            </span>
            <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
              {reports.length} community
            </span>
          </div>
        </div>

        {/* Safe route button */}
        <button
          onClick={() => setShowSafeRoute(!showSafeRoute)}
          className="primary-action absolute left-4 top-32 z-[1000] rounded-full px-4 py-2.5 text-sm"
        >
          {showSafeRoute ? "Hide route" : "Safer route"}
        </button>

        {/* Report FAB */}
        <Link
          to="/report"
          className="primary-action absolute bottom-32 right-5 z-[1000] flex h-14 w-14 items-center justify-center rounded-full"
        >
          <FileWarning className="h-7 w-7" />
        </Link>

        {/* Bottom sheet */}
        <div className="glass-panel absolute bottom-20 left-4 right-4 z-[1000] rounded-[1.5rem] p-4 text-zinc-900">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300" />
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-black">Risk zones</h2>
          </div>

          {showSafeRoute && (
            <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-3 py-2">
              <p className="text-sm font-semibold text-green-700">Lower exposure route highlighted.</p>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {combinedReports
              .filter((r) => r.severity === "High")
              .slice(0, 2)
              .map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between border-t border-zinc-200 pt-2"
                >
                  <div>
                    <p className="text-sm font-semibold">{report.location}</p>
                    <p className="text-xs text-zinc-500">{report.type}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
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
