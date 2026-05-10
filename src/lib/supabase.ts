import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Report = {
  id: string
  type: string
  location: string
  latitude: number
  longitude: number
  severity: "Low" | "Medium" | "High"
  note: string | null
  ai_classification: {
    incident_type: string
    severity_score: number
    tags: string[]
    suggested_fix: string
    confidence: string
  } | null
  created_at: string
}