import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polyline,
} from "react-leaflet"
import L from "leaflet"
import { AlertTriangle, FileWarning, MapPin } from "lucide-react"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"
import type { Report } from "../lib/supabase"
import { safestRoute, dangerousRoute } from "../data/mockRoutes"

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
    severity === "High" ? 36 :
    severity === "Medium" ? 28 : 22

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color}22;
      border: 2px solid ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: ${size * 0.35}px;
        height: ${size * 0.35}px;
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

export default function MapPage() {
  const [showSafeRoute, setShowSafeRoute] = useState(false)
  const [reports, setReports] = useState<Report[]>([])

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
    <div className="min-h-screen bg-black flex justify-center">
      <div className="relative h-screen w-full max-w-md overflow-hidden">
        <MapContainer className="h-full w-full" center={center} zoom={14}>
          <SetView />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createDangerIcon(report.severity)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="text-base font-bold">{report.type}</h3>
                  <p className="mt-1 text-sm text-gray-600">{report.location}</p>
                  {report.note && (
                    <p className="mt-2 text-sm italic text-gray-500">"{report.note}"</p>
                  )}
                  {report.ai_classification && (
                    <div className="mt-2 rounded-lg bg-orange-50 p-2">
                      <p className="text-xs font-bold text-orange-600">AI Insight</p>
                      <p className="text-xs text-gray-600">
                        {report.ai_classification.suggested_fix}
                      </p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      report.severity === "High" ? "bg-red-100 text-red-600"
                      : report.severity === "Medium" ? "bg-yellow-100 text-yellow-700"
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
          ))}

          {showSafeRoute && (
            <>
              <Polyline
                positions={dangerousRoute as [number, number][]}
                pathOptions={{ color: "red", weight: 5, opacity: 0.5, dashArray: "10" }}
              />
              <Polyline
                positions={safestRoute as [number, number][]}
                pathOptions={{ color: "#f97316", weight: 7 }}
              />
            </>
          )}
        </MapContainer>

        {/* Header */}
        <div className="absolute left-4 right-4 top-4 z-[1000] rounded-3xl bg-black/85 p-4 text-white shadow-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <h1 className="text-lg font-bold">BlindSpot Safety Map</h1>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              {reports.length} reports
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-300">
            Community-reported near misses around Davis.
          </p>
        </div>

        {/* Safe route button */}
        <button
          onClick={() => setShowSafeRoute(!showSafeRoute)}
          className="absolute left-4 top-32 z-[1000] rounded-full bg-orange-500 px-5 py-3 font-bold text-black shadow-xl"
        >
          {showSafeRoute ? "Hide Safe Route" : "Get Safer Route"}
        </button>

        {/* Report FAB */}
        <Link
          to="/report"
          className="absolute bottom-40 right-5 z-[1000] flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-black shadow-2xl"
        >
          <FileWarning className="h-8 w-8" />
        </Link>

        {/* Bottom sheet */}
        <div className="absolute bottom-20 left-0 right-0 z-[1000] rounded-t-3xl bg-black p-5 text-white shadow-2xl">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-700" />
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-400" />
            <h2 className="text-xl font-bold">Nearby Risk Zones</h2>
          </div>

          {showSafeRoute && (
            <div className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
              <p className="text-sm font-semibold text-orange-400">Safer Route Found</p>
              <p className="mt-2 text-sm text-gray-300">
                This route avoids 3 high-risk intersections and reduces reported
                danger exposure by 64%.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {reports
              .filter((r) => r.severity === "High")
              .slice(0, 2)
              .map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div>
                    <p className="font-semibold">{report.type}</p>
                    <p className="text-sm text-gray-400">{report.location}</p>
                  </div>
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm font-semibold text-red-400">
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
