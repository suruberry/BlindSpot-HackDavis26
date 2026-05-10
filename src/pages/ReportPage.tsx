import Navbar from "../components/Navbar"
import { useState } from "react"
import { AlertTriangle, Bike, Car, Lightbulb, MapPin, Send, Loader2 } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../lib/auth"

const incidentTypes = [
  { label: "Close pass", icon: Car },
  { label: "Unsafe merge", icon: Bike },
  { label: "Poor lighting", icon: Lightbulb },
  { label: "Blocked bike lane", icon: AlertTriangle },
  { label: "Speeding vehicle", icon: Car },
  { label: "Confusing intersection", icon: MapPin },
]

const DAVIS_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  "hutchison": { lat: 38.5398, lng: -121.7653 },
  "russell": { lat: 38.5462, lng: -121.7541 },
  "covell": { lat: 38.5605, lng: -121.7488 },
  "5th": { lat: 38.5441, lng: -121.7417 },
  "anderson": { lat: 38.5489, lng: -121.7234 },
  "g st": { lat: 38.5446, lng: -121.7401 },
  "richards": { lat: 38.5412, lng: -121.7327 },
  "arboretum": { lat: 38.5378, lng: -121.7512 },
  "mrak": { lat: 38.5367, lng: -121.7491 },
  "pole line": { lat: 38.5501, lng: -121.7311 },
}

function guessLocation(text: string): { lat: number; lng: number } {
  const lower = text.toLowerCase()
  for (const [key, coords] of Object.entries(DAVIS_LOCATIONS)) {
    if (lower.includes(key)) return coords
  }
  // Default to campus center with small random offset so it shows up
  return {
    lat: 38.5449 + (Math.random() - 0.5) * 0.01,
    lng: -121.7405 + (Math.random() - 0.5) * 0.01,
  }
}

function fallbackClassification(type: string, note: string) {
  const lower = `${type} ${note}`.toLowerCase()
  const isHighRisk = ["speed", "merge", "right", "turn", "dark", "lighting", "blocked"].some((term) =>
    lower.includes(term)
  )
  const isLowRisk = lower.includes("minor") || lower.includes("slow")

  return {
    incident_type: type,
    severity_score: isHighRisk ? 7 : isLowRisk ? 3 : 5,
    tags: [
      type.toLowerCase().replaceAll(" ", "-"),
      isHighRisk ? "infrastructure-risk" : "community-signal",
    ],
    suggested_fix: isHighRisk
      ? "Review this location for protected bike separation, turn calming, and clearer cyclist visibility."
      : "Monitor this location for repeated reports and consider signage or pavement visibility improvements.",
    confidence: "Medium",
  }
}

async function classifyWithClaude(type: string, note: string) {
  try {
    const { data, error } = await supabase.functions.invoke("claude", {
      body: {
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `You are a cyclist safety analyst. Analyze this near-miss report and return ONLY valid JSON, no markdown.

Incident type: ${type}
Note: ${note || "No additional note"}

Return exactly this JSON structure:
{
  "incident_type": "string (refined category)",
  "severity_score": number (1-10),
  "tags": ["array", "of", "relevant", "tags"],
  "suggested_fix": "one sentence infrastructure recommendation",
  "confidence": "High|Medium|Low"
}`
        }]
      },
    })

    if (error || data?.error) {
      throw new Error(error?.message || data.error.message)
    }

    const text = data.content?.[0]?.text || ""
    return JSON.parse(text.trim())
  } catch (e) {
    console.error("Claude classification failed:", e)
    return fallbackClassification(type, note)
  }
}

export default function ReportPage() {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState("")
  const [note, setNote] = useState("")
  const [location, setLocation] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [submitError, setSubmitError] = useState("")
  const [submittedReport, setSubmittedReport] = useState<{
    location: string
    severity: string
  } | null>(null)

  async function handleSubmit() {
    if (!selectedType) return
    setLoading(true)
    setSubmitError("")

    try {
      const ai = await classifyWithClaude(selectedType, note)
      setAiResult(ai)

      const coords = guessLocation(location || note)
      const severity = ai
        ? ai.severity_score >= 7 ? "High" : ai.severity_score >= 4 ? "Medium" : "Low"
        : "Medium"
      const reportLocation = location || "Davis, CA (location not specified)"

      const { data, error } = await supabase
        .from("reports")
        .insert({
          user_id: user?.id,
          type: selectedType,
          location: reportLocation,
          latitude: coords.lat,
          longitude: coords.lng,
          severity,
          note: note || null,
          ai_classification: ai,
        })
        .select("location, severity")
        .single()

      if (error) throw error

      setSubmittedReport({
        location: data.location,
        severity: data.severity,
      })
      setSubmitted(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit report."
      setSubmitError(message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="app-shell items-center p-6 pb-24">
        <div className="glass-panel max-w-md w-full rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Send className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Report submitted</h1>
          <p className="mt-3 text-gray-400">
            Your near-miss report helps make invisible danger patterns visible.
          </p>
          {submittedReport && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                Added to map
              </p>
              <p className="mt-1 font-semibold text-zinc-900">{submittedReport.location}</p>
              <p className="text-sm text-zinc-600">Severity: {submittedReport.severity}</p>
            </div>
          )}

          {aiResult && (
            <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5 text-left">
              <p className="text-sm font-bold text-orange-700 mb-3">AI Analysis</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  <span className="text-zinc-900 font-semibold">Severity score:</span> {aiResult.severity_score}/10
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-zinc-900 font-semibold">Recommended fix:</span> {aiResult.suggested_fix}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {aiResult.tags?.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <a href="/map" className="primary-action mt-6 inline-block rounded-full px-6 py-3">
            See it on the map
          </a>
        </div>
        <Navbar />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="mobile-canvas">
        <p className="eyebrow">BlindSpot</p>
        <h1 className="display-title text-4xl">Report a near miss</h1>
        <p className="muted-copy mt-3">
          Signal what happened. Help fix what repeats.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {incidentTypes.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setSelectedType(label)}
              className={`rounded-2xl p-4 text-left transition ${
                selectedType === label
                  ? "border border-orange-300 bg-orange-50 shadow-lg shadow-orange-100"
                  : "soft-card"
              }`}
            >
              <Icon className="mb-3 h-6 w-6" />
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </div>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Where did this happen? (e.g. Russell Blvd)"
          className="mt-6 w-full rounded-2xl border border-zinc-300 bg-white/70 p-4 text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional: describe what happened..."
          className="mt-4 min-h-28 w-full rounded-2xl border border-zinc-300 bg-white/70 p-4 text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
        />

        <button
          onClick={handleSubmit}
          disabled={!selectedType || loading}
          className="primary-action mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing with AI...
            </>
          ) : "Signal it"}
        </button>

        {loading && (
          <p className="mt-3 text-center text-sm text-gray-500">
            Analyzing risk...
          </p>
        )}
        {submitError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Report did not save</p>
            <p className="mt-1 text-sm text-red-600">{submitError}</p>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}
