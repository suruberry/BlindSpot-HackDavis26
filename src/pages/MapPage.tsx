import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { AlertTriangle } from "lucide-react"
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

      <div className="absolute left-4 right-4 top-4 z-[1000] rounded-2xl bg-black/85 p-4 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">BlindSpot Safety Map</h1>
        </div>
        <p className="mt-1 text-sm text-gray-300">
          Community-reported near misses around Davis.
        </p>
      </div>
    </div>
  )
}