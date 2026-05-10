import Navbar from "../components/Navbar"
import { useState } from "react"
import { AlertTriangle, Bike, Car, Lightbulb, MapPin, Send, Loader2 } from "lucide-react"
import { supabase } from "../lib/supabase"

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

    if (error || data.error) {
      throw new Error(error?.message || data.error.message)
    }

    const text = data.content?.[0]?.text || ""
    return JSON.parse(text.trim())
  } catch (e) {
    console.error("Claude classification failed:", e)
    return null
  }
}

export default function ReportPage() {
  const [selectedType, setSelectedType] = useState("")
  const [note, setNote] = useState("")
  const [location, setLocation] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)

  async function handleSubmit() {
    if (!selectedType) return
    setLoading(true)

    const ai = await classifyWithClaude(selectedType, note)
    setAiResult(ai)

    const coords = guessLocation(location || note)
    const severity = ai
      ? ai.severity_score >= 7 ? "High" : ai.severity_score >= 4 ? "Medium" : "Low"
      : "Medium"

    await supabase.from("reports").insert({
      type: selectedType,
      location: location || "Davis, CA (location not specified)",
      latitude: coords.lat,
      longitude: coords.lng,
      severity,
      note: note || null,
      ai_classification: ai,
    })

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen pb-24 items-center justify-center bg-black p-6 text-white">
        <div className="max-w-md w-full rounded-3xl bg-zinc-900 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Send className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">Report submitted</h1>
          <p className="mt-3 text-gray-400">
            Your near-miss report helps make invisible danger patterns visible.
          </p>

          {aiResult && (
            <div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 text-left">
              <p className="text-sm font-bold text-orange-400 mb-3">🤖 AI Analysis</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  <span className="text-white font-semibold">Severity score:</span> {aiResult.severity_score}/10
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-white font-semibold">Recommended fix:</span> {aiResult.suggested_fix}
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

          <a href="/map" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black">
            See it on the map
          </a>
        </div>
        <Navbar />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 bg-black p-6 text-white">
      <div className="mx-auto max-w-md">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">BlindSpot</p>
        <h1 className="mt-3 text-4xl font-bold">Report a near miss</h1>
        <p className="mt-3 text-gray-400">
          Tap what happened. Your report gets AI-analyzed and mapped instantly.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {incidentTypes.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setSelectedType(label)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedType === label
                  ? "border-orange-400 bg-orange-500/20"
                  : "border-zinc-800 bg-zinc-900"
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
          className="mt-6 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none placeholder:text-gray-500"
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional: describe what happened..."
          className="mt-4 min-h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none placeholder:text-gray-500"
        />

        <button
          onClick={handleSubmit}
          disabled={!selectedType || loading}
          className="mt-6 w-full rounded-full bg-white px-6 py-4 font-bold text-black disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing with AI...
            </>
          ) : "Submit & Analyze"}
        </button>

        {loading && (
          <p className="mt-3 text-center text-sm text-gray-500">
            Claude is classifying your report and scoring risk level...
          </p>
        )}
      </div>
      <Navbar />
    </div>
  )
}
