import { supabase } from "./supabase"

const realDavisIncidents = [
  { type: "Unsafe merge", location: "Hutchison Dr near West Village", latitude: 38.5398, longitude: -121.7653, severity: "High", note: "Cars merging without checking for cyclists" },
  { type: "Close pass", location: "Russell Blvd & Sycamore Ln", latitude: 38.5462, longitude: -121.7541, severity: "Medium", note: "Vehicles passing too close at speed" },
  { type: "Poor lighting", location: "Covell Blvd crossing", latitude: 38.5605, longitude: -121.7488, severity: "High", note: "No lighting at night, dangerous crossing" },
  { type: "Blocked bike lane", location: "5th St & L St", latitude: 38.5441, longitude: -121.7417, severity: "Medium", note: "Delivery trucks regularly block lane" },
  { type: "Confusing intersection", location: "Russell Blvd & Oak Ave", latitude: 38.5478, longitude: -121.7398, severity: "High", note: "No clear cyclist right of way" },
  { type: "Speeding vehicle", location: "Anderson Rd near Nugget", latitude: 38.5489, longitude: -121.7234, severity: "High", note: "Vehicles regularly exceed speed limit" },
  { type: "Dooring risk", location: "G St downtown Davis", latitude: 38.5446, longitude: -121.7401, severity: "Medium", note: "Parked cars opening into bike lane" },
  { type: "Close pass", location: "Bike Lane on Covell Blvd", latitude: 38.5587, longitude: -121.7502, severity: "High", note: "Lane too narrow, cars encroach" },
  { type: "Unsafe merge", location: "Richards Blvd underpass", latitude: 38.5412, longitude: -121.7327, severity: "High", note: "Blind merge from on-ramp" },
  { type: "Poor lighting", location: "Arboretum path at night", latitude: 38.5378, longitude: -121.7512, severity: "Medium", note: "Path completely dark after 9pm" },
  { type: "Speeding vehicle", location: "Mrak Hall Dr", latitude: 38.5367, longitude: -121.7491, severity: "Low", note: "Campus speed limit ignored" },
  { type: "Blocked bike lane", location: "1st St & F St", latitude: 38.5432, longitude: -121.7441, severity: "Medium", note: "Construction blocking lane for months" },
  { type: "Confusing intersection", location: "Pole Line Rd & 2nd St", latitude: 38.5501, longitude: -121.7311, severity: "High", note: "No signals for cyclists" },
  { type: "Close pass", location: "La Rue Rd near ARC", latitude: 38.5341, longitude: -121.7568, severity: "High", note: "Students almost hit regularly" },
  { type: "Dooring risk", location: "E St near Davis Food Co-op", latitude: 38.5449, longitude: -121.7389, severity: "Medium", note: "High parking turnover, frequent dooring risk" },
]

export async function seedDatabase() {
  const { data: existing } = await supabase.from("reports").select("id").limit(1)
  if (existing && existing.length > 0) {
    console.log("Database already seeded")
    return
  }

  const reportsWithDefaults = realDavisIncidents.map((r) => ({
    ...r,
    ai_classification: null,
  }))

  const { error } = await supabase.from("reports").insert(reportsWithDefaults)
  if (error) console.error("Seed error:", error)
  else console.log("✅ Seeded 15 real Davis incidents")
}