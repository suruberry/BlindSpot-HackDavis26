export type IncidentType =
  | "Close pass"
  | "Unsafe merge"
  | "Poor lighting"
  | "Blocked bike lane"
  | "Speeding vehicle"
  | "Confusing intersection"
  | "Dooring risk"

export type IncidentReport = {
  id: number
  type: IncidentType
  location: string
  latitude: number
  longitude: number
  severity: "Low" | "Medium" | "High"
  time: string
}

export const mockReports: IncidentReport[] = [
  {
    id: 1,
    type: "Unsafe merge",
    location: "Hutchison Dr near West Village",
    latitude: 38.5398,
    longitude: -121.7653,
    severity: "High",
    time: "Today, 4:12 PM",
  },
  {
    id: 2,
    type: "Close pass",
    location: "Russell Blvd",
    latitude: 38.5462,
    longitude: -121.7541,
    severity: "Medium",
    time: "Today, 3:45 PM",
  },
  {
    id: 3,
    type: "Poor lighting",
    location: "Covell Blvd crossing",
    latitude: 38.5605,
    longitude: -121.7488,
    severity: "High",
    time: "Yesterday, 8:21 PM",
  },
]