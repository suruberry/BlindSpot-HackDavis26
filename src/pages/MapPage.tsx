import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"

const center: [number, number] = [38.5449, -121.7405]

function SetView() {
  const map = useMap()
  map.setView(center, 15)
  return null
}

export default function MapPage() {
  return (
    <div className="h-screen w-screen">
      <MapContainer className="h-full w-full">
        <SetView />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={center}>
          <Popup>UC Davis</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}