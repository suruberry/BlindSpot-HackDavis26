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
  "https://www.cityofdavis.org/city-hall/public-works-engineering-and-transportation/transportation"

// All locations verified from:
// City of Davis 2023 Local Road Safety Plan
// Table 3: Top 5 bicycle collision locations 2015-2019 (p.132)
// Table 5: Top signalized intersection collisions 2015-2019 (p.134)
// Table 6: Top unsignalized intersection collisions 2015-2019 (p.135)
// Narrative findings on violation clusters (pp.124-129)

export const realIncidents: RealIncident[] = [
  {
    id: "lrsp-russell-anderson",
    type: "Bicycle collision hotspot",
    location: "Russell Blvd & Anderson Rd",
    latitude: 38.5421,
    longitude: -121.7540,
    severity: "High",
    source: "City of Davis 2023 LRSP — Table 3 & Table 5",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Rank #1 bicycle collision location in Davis 2015–2019 with 6 bicycle crashes. Also rank #2 signalized intersection with 9 total collisions.",
    riskReason:
      "High bicycle volumes mix with turning vehicles at a major campus approach. Top location for both bicycle and pedestrian collisions per LRSP.",
    suggestedFix:
      "Add protected signal phasing, high-visibility conflict markings, and curb-separated bike approaches.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Bicycle collision hotspot",
      severity_score: 10,
      tags: ["lrsp-verified", "rank-1-bicycle", "priority-intersection", "turn-conflict"],
      suggested_fix:
        "Add protected signal phasing, high-visibility conflict markings, and curb-separated bike approaches.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-8th-l-st",
    type: "Bicycle collision hotspot",
    location: "8th St & L St",
    latitude: 38.5478,
    longitude: -121.7338,
    severity: "High",
    source: "City of Davis 2023 LRSP — Table 3 & Table 5",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Rank #2 bicycle collision location 2015–2019 with 5 bicycle crashes. Also rank #3 signalized intersection with 8 total collisions.",
    riskReason:
      "Signalized intersection with high bicycle volumes and documented turning conflicts on a major east-west corridor.",
    suggestedFix:
      "Install leading bicycle intervals, improve signal head visibility, and add green conflict zone markings.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Bicycle collision hotspot",
      severity_score: 9,
      tags: ["lrsp-verified", "rank-2-bicycle", "signal", "corridor"],
      suggested_fix:
        "Install leading bicycle intervals, improve signal head visibility, and add green conflict zone markings.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-5th-d-st",
    type: "Bicycle collision hotspot",
    location: "5th St & D St",
    latitude: 38.5441,
    longitude: -121.7431,
    severity: "High",
    source: "City of Davis 2023 LRSP — Table 3 & Table 6",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Rank #3 bicycle collision location (4 bicycle crashes) AND rank #1 unsignalized intersection (8 total collisions) 2015–2019.",
    riskReason:
      "Stop-controlled intersection in downtown Davis with the highest unsignalized collision count in the city. Cyclists face unprotected crossing movements.",
    suggestedFix:
      "Evaluate signalization or protected crossing treatment with RRFBs and daylighting at corners.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Bicycle collision hotspot",
      severity_score: 9,
      tags: ["lrsp-verified", "rank-3-bicycle", "rank-1-unsignalized", "stop-control", "downtown"],
      suggested_fix:
        "Evaluate signalization or protected crossing treatment with RRFBs and daylighting at corners.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-russell-california",
    type: "Bicycle collision hotspot",
    location: "Russell Blvd & California Ave",
    latitude: 38.5462,
    longitude: -121.7489,
    severity: "High",
    source: "City of Davis 2023 LRSP — Table 3 & Table 6",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Rank #3 bicycle collision location (4 crashes) and rank #2 unsignalized intersection (6 collisions) 2015–2019.",
    riskReason:
      "Unsignalized crossing on Russell Blvd with high bicycle traffic and documented collision history.",
    suggestedFix:
      "Install RRFB or protected crossing with median refuge island and advance bike warning signage.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Bicycle collision hotspot",
      severity_score: 9,
      tags: ["lrsp-verified", "rank-3-bicycle", "unsignalized", "russell-corridor"],
      suggested_fix:
        "Install RRFB or protected crossing with median refuge island and advance bike warning signage.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-anderson-villanova",
    type: "Bicycle collision hotspot",
    location: "Anderson Rd & Villanova Dr",
    latitude: 38.5489,
    longitude: -121.7234,
    severity: "High",
    source: "City of Davis 2023 LRSP — Table 3 & Table 5",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Rank #3 bicycle collision location (4 crashes) and rank #2 signalized intersection (9 total collisions) 2015–2019.",
    riskReason:
      "Major signalized intersection with documented bicycle and turning vehicle conflicts on Anderson Rd corridor.",
    suggestedFix:
      "Add protected bicycle signal phase and improve approach lane markings for cyclists.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Bicycle collision hotspot",
      severity_score: 9,
      tags: ["lrsp-verified", "rank-3-bicycle", "rank-2-signalized", "anderson-corridor"],
      suggested_fix:
        "Add protected bicycle signal phase and improve approach lane markings for cyclists.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-mace-2nd",
    type: "High collision signalized intersection",
    location: "Mace Blvd & 2nd St",
    latitude: 38.5389,
    longitude: -121.7089,
    severity: "High",
    source: "City of Davis 2023 LRSP — Table 5",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Rank #1 signalized intersection collision location in Davis — 10 total collisions 2015–2019.",
    riskReason:
      "Highest collision count of any signalized intersection in Davis. Major arterial crossing with high vehicle speeds.",
    suggestedFix:
      "Evaluate protected bicycle crossings, retroreflective signal back-plates, and advance bike warning signage.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "High collision signalized intersection",
      severity_score: 10,
      tags: ["lrsp-verified", "rank-1-signalized", "arterial", "mace-corridor"],
      suggested_fix:
        "Evaluate protected bicycle crossings, retroreflective signal back-plates, and advance bike warning signage.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-5th-corridor-ftw",
    type: "Failure-to-yield cluster",
    location: "5th St corridor — downtown Davis",
    latitude: 38.5444,
    longitude: -121.7417,
    severity: "High",
    source: "City of Davis 2023 LRSP — p.124",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Largest cluster of failure-to-yield violations in Davis 2009–2019. 7 of 8 KSI failure-to-yield violations involved bicycles.",
    riskReason:
      "Drivers failing to yield to cyclists is the dominant injury mechanism on 5th St. Bicycles involved in 87.5% of severe failure-to-yield crashes.",
    suggestedFix:
      "Install leading bicycle intervals, no-right-turn-on-red signs, and protected bicycle intersection treatments.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Failure-to-yield cluster",
      severity_score: 9,
      tags: ["lrsp-verified", "failure-to-yield", "ksi", "downtown", "bicycle-involved"],
      suggested_fix:
        "Install leading bicycle intervals, no-right-turn-on-red signs, and protected bicycle intersection treatments.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-anderson-improper-turn",
    type: "Improper turning violation cluster",
    location: "Anderson Rd corridor",
    latitude: 38.5501,
    longitude: -121.7311,
    severity: "High",
    source: "City of Davis 2023 LRSP — p.126",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Large cluster of improper-turning violations on Anderson Rd 2009–2019. 7 of 11 KSI improper-turning violations involved bicycles.",
    riskReason:
      "Cyclists are disproportionately involved in severe improper-turning crashes on this corridor — 64% of KSI violations.",
    suggestedFix:
      "Improve striping for bike lanes and travel lanes, add channelization, and restrict unsafe turning movements.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Improper turning violation cluster",
      severity_score: 8,
      tags: ["lrsp-verified", "improper-turning", "ksi", "anderson-corridor", "bicycle-involved"],
      suggested_fix:
        "Improve striping for bike lanes and travel lanes, add channelization, and restrict unsafe turning movements.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-covell-ftw",
    type: "Failure-to-yield cluster",
    location: "Covell Blvd corridor",
    latitude: 38.5605,
    longitude: -121.7488,
    severity: "Medium",
    source: "City of Davis 2023 LRSP — p.124",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Significant failure-to-yield collision cluster along Covell Blvd 2009–2019.",
    riskReason:
      "Covell Blvd is a wide arterial where driver failure-to-yield creates documented cyclist risk.",
    suggestedFix:
      "Add refuge islands, protected crossing treatments, and advance warning signage for cyclists.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "Failure-to-yield cluster",
      severity_score: 7,
      tags: ["lrsp-verified", "failure-to-yield", "arterial", "covell-corridor"],
      suggested_fix:
        "Add refuge islands, protected crossing treatments, and advance warning signage for cyclists.",
      confidence: "High",
    },
  },
  {
    id: "lrsp-8th-b-st",
    type: "High collision signalized intersection",
    location: "8th St & B St",
    latitude: 38.5485,
    longitude: -121.7468,
    severity: "Medium",
    source: "City of Davis 2023 LRSP — Table 5",
    sourceType: "public",
    sourceUrl: lrspSourceUrl,
    description:
      "Rank #3 signalized intersection collision location — 8 total collisions 2015–2019.",
    riskReason:
      "Signalized intersection on a major north-south corridor with documented collision clustering.",
    suggestedFix:
      "Upgrade signal head visibility with retroreflective back-plates and evaluate leading bicycle intervals.",
    created_at: "2023-12-01T00:00:00.000Z",
    ai_classification: {
      incident_type: "High collision signalized intersection",
      severity_score: 7,
      tags: ["lrsp-verified", "rank-3-signalized", "signal", "8th-corridor"],
      suggested_fix:
        "Upgrade signal head visibility with retroreflective back-plates and evaluate leading bicycle intervals.",
      confidence: "High",
    },
  },
]