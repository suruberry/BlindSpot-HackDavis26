// Keep type exports for compatibility
export type IncidentType =
  | "Close pass"
  | "Unsafe merge"
  | "Poor lighting"
  | "Blocked bike lane"
  | "Speeding vehicle"
  | "Confusing intersection"
  | "Dooring risk"

export type IncidentReport = {
  id: string
  type: string
  location: string
  latitude: number
  longitude: number
  severity: "Low" | "Medium" | "High"
  note?: string | null
  ai_classification?: any
  time?: string
  created_at?: string
}

// Empty array — real data comes from Supabase now
export const mockReports: IncidentReport[] = []