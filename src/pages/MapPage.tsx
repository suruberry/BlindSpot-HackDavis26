import { Link } from "react-router-dom"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import { AlertTriangle, FileWarning, MapPin } from "lucide-react"
import { mockReports } from "../data/mockReports"

const center: [number, number] = [38.5449, -121.7405]

function SetView() {
  const map = useMap()
  map.setView(center, 14)
  return null
}

export default function MapPage() {
  return (
    <div className="relative h-screen w-screen bg-black">
      <MapContainer className="h-full w-full">
        <SetView />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {mockReports.map((report) => (
          <Marker key={report.id} position={[report.latitude, report.longitude]}>
            <Popup>
              <strong>{report.type}</strong>
              <br />
              {report.location}
              <br />
              Severity: {report.severity}
              <br />
              {report.time}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute left-4 right-4 top-4 z-[1000] rounded-3xl bg-black/85 p-4 text-white shadow-xl backdrop-blur">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h1 className="text-lg font-bold">BlindSpot Safety Map</h1>
        </div>
        <p className="mt-1 text-sm text-gray-300">
          Community-reported near misses around Davis.
        </p>
      </div>

      <Link
        to="/report"
        className="absolute bottom-40 right-5 z-[1000] flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-black shadow-2xl"
      >
        <FileWarning className="h-8 w-8" />
      </Link>

      <div className="absolute bottom-0 left-0 right-0 z-[1000] rounded-t-3xl bg-black p-5 text-white shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-700" />

        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-orange-400" />
          <h2 className="text-xl font-bold">Nearby Risk Zones</h2>
        </div>

        <div className="mt-4 space-y-3">
          {mockReports.slice(0, 2).map((report) => (
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
    </div>
  )
}