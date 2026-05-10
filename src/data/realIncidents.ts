export type SafetySeverity = "Low" | "Medium" | "High"
export type SafetySourceType = "public" | "community"

export type RealIncident = {
  id: string
  type: string
  location: string
  latitude: number
  longitude: number
  severity: SafetySeverity
  source: string
  sourceType: SafetySourceType
  sourceUrl: string
  description: string
  riskReason: string
  suggestedFix: string
  created_at: string
  ai_classification: {
    incident_type: string
    severity_score: number
    tags: string[]
    suggested_fix: string
    confidence: string
  }
}

const lrspSourceUrl =
  "https://documents.cityofdavis.org/Media/Default/Documents/PDF/CityCouncil/Bicycling-Transportation-Street-Safety-Commission/Local%20Road%20Safety%20Plan%202023/Final%20Davis%20LRSP%20Executive%20Summary%20PDF.pdf"

export const realIncidents: RealIncident[] = [
  {
    id: "lrsp-russell-anderson",
    type: "Bicycle collision hotspot",
    location: "Russell Blvd & Anderson Rd",
    latitude: 38.5465,
    longitude: -121.7596,
    severity: "High",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "Priority collision area near a major campus approach and cross-town bicycle corridor.",
    riskReason: "High bicycle volumes mix with turning vehicles and multiple crossing movements.",
    suggestedFix: "Add protected signal phasing, high-visibility conflict markings, and curb-separated bike approaches.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Bicycle collision hotspot",
      severity_score: 9,
      tags: ["public-data", "priority-intersection", "turn-conflict"],
      suggested_fix: "Add protected signal phasing, high-visibility conflict markings, and curb-separated bike approaches.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-russell-oak",
    type: "Unsignalized crossing risk",
    location: "Russell Blvd & Oak Ave",
    latitude: 38.5463,
    longitude: -121.7511,
    severity: "High",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "Documented priority area along Russell Boulevard near dense student travel demand.",
    riskReason: "Unsignalized or complex crossing movements create low-visibility cyclist conflicts.",
    suggestedFix: "Evaluate a protected crossing treatment with RRFBs, median refuge, and bike-priority markings.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Unsignalized crossing risk",
      severity_score: 8,
      tags: ["public-data", "crossing", "student-route"],
      suggested_fix: "Evaluate a protected crossing treatment with RRFBs, median refuge, and bike-priority markings.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-b-st-5th",
    type: "Signalized intersection conflict",
    location: "B St & 5th St",
    latitude: 38.5471,
    longitude: -121.7469,
    severity: "High",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "Central Davis priority collision location near a signalized corridor.",
    riskReason: "Signalized intersections concentrate turning, crossing, and queueing conflicts.",
    suggestedFix: "Upgrade signal visibility, add leading bike/ped intervals, and tighten turning speeds.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Signalized intersection conflict",
      severity_score: 8,
      tags: ["public-data", "signal", "downtown"],
      suggested_fix: "Upgrade signal visibility, add leading bike/ped intervals, and tighten turning speeds.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-b-st-1st",
    type: "Downtown bicycle collision cluster",
    location: "B St & 1st St",
    latitude: 38.5432,
    longitude: -121.7473,
    severity: "High",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "Downtown priority area shown in Davis collision cluster mapping.",
    riskReason: "Short blocks, parking turnover, and mixed bicycle/vehicle movements raise exposure.",
    suggestedFix: "Use daylighting, protected intersection corners, and clearer bike lane continuity.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Downtown bicycle collision cluster",
      severity_score: 8,
      tags: ["public-data", "downtown", "parking-conflict"],
      suggested_fix: "Use daylighting, protected intersection corners, and clearer bike lane continuity.",
      confidence: "Medium",
    },
  },
  {
    id: "lrsp-f-st-5th",
    type: "Downtown crossing conflict",
    location: "F St & 5th St",
    latitude: 38.5468,
    longitude: -121.7406,
    severity: "High",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "Priority collision area at a central Davis street crossing.",
    riskReason: "Bicycle crossings compete with turning vehicles and downtown curb activity.",
    suggestedFix: "Install bike boxes, daylight corners, and high-visibility green conflict striping.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Downtown crossing conflict",
      severity_score: 8,
      tags: ["public-data", "downtown", "turn-conflict"],
      suggested_fix: "Install bike boxes, daylight corners, and high-visibility green conflict striping.",
      confidence: "Medium",
    },
  },
  {
    id: "lrsp-l-st-5th",
    type: "Signalized corridor hotspot",
    location: "L St & 5th St",
    latitude: 38.5461,
    longitude: -121.7337,
    severity: "High",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "Priority collision area on the 5th Street east-west corridor.",
    riskReason: "Fast corridor traffic and intersection turning movements create cyclist exposure.",
    suggestedFix: "Evaluate protected bike lane continuity and protected turns at the signal.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Signalized corridor hotspot",
      severity_score: 8,
      tags: ["public-data", "signal", "corridor"],
      suggested_fix: "Evaluate protected bike lane continuity and protected turns at the signal.",
      confidence: "Medium",
    },
  },
  {
    id: "lrsp-covell-pole-line",
    type: "High-speed arterial crossing",
    location: "Covell Blvd & Pole Line Rd",
    latitude: 38.5604,
    longitude: -121.7317,
    severity: "High",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "North/east Davis priority area on a wider arterial crossing.",
    riskReason: "Large intersection geometry increases crossing distance and vehicle exposure.",
    suggestedFix: "Shorten crossings with refuge islands and add protected bicycle signal timing.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "High-speed arterial crossing",
      severity_score: 9,
      tags: ["public-data", "arterial", "crossing-distance"],
      suggested_fix: "Shorten crossings with refuge islands and add protected bicycle signal timing.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-covell-anderson",
    type: "Arterial bike crossing risk",
    location: "Covell Blvd & Anderson Rd",
    latitude: 38.5601,
    longitude: -121.7598,
    severity: "High",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "Collision cluster area on a major bicycle approach into north Davis.",
    riskReason: "Cyclists cross a wide arterial with significant turning and through traffic.",
    suggestedFix: "Add protected intersection treatments and improve nighttime crossing visibility.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Arterial bike crossing risk",
      severity_score: 9,
      tags: ["public-data", "arterial", "visibility"],
      suggested_fix: "Add protected intersection treatments and improve nighttime crossing visibility.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-cowell-pole-line",
    type: "South Davis crossing risk",
    location: "Cowell Blvd & Pole Line Rd",
    latitude: 38.5334,
    longitude: -121.7324,
    severity: "Medium",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "South Davis crossing area shown in public collision mapping.",
    riskReason: "Arterial crossing distance and approach speeds raise conflict severity.",
    suggestedFix: "Add bike refuge space, crossing visibility upgrades, and approach speed management.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "South Davis crossing risk",
      severity_score: 6,
      tags: ["public-data", "south-davis", "arterial"],
      suggested_fix: "Add bike refuge space, crossing visibility upgrades, and approach speed management.",
      confidence: "Medium",
    },
  },
  {
    id: "lrsp-mace-cowell",
    type: "Outer corridor conflict",
    location: "Mace Blvd & Cowell Blvd",
    latitude: 38.5348,
    longitude: -121.6999,
    severity: "Medium",
    source: "City of Davis Local Road Safety Plan / SWITRS",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description: "East Davis corridor area with public collision activity.",
    riskReason: "Wide road geometry and higher vehicle speeds increase cyclist stress.",
    suggestedFix: "Extend separated bike facilities and improve crossing markings at the intersection.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Outer corridor conflict",
      severity_score: 6,
      tags: ["public-data", "east-davis", "speed"],
      suggested_fix: "Extend separated bike facilities and improve crossing markings at the intersection.",
      confidence: "Medium",
    },
  },
]
