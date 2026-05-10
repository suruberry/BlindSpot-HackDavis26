import { useState } from "react"
import { CheckCircle, ChevronRight, MapPin, Loader2 } from "lucide-react"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"

const DANGEROUS_SPOTS = [
  "Hutchison Dr near West Village",
  "Russell Blvd & Sycamore Ln",
  "Covell Blvd crossing",
  "5th St & L St",
  "Richards Blvd underpass",
  "Arboretum path at night",
  "Anderson Rd near Nugget",
  "Pole Line Rd & 2nd St",
  "G St downtown Davis",
  "La Rue Rd near ARC",
]

const INCIDENT_TYPES = [
  "Close pass by vehicle",
  "Car ran a red light",
  "Blocked bike lane",
  "Poor lighting at night",
  "Unsafe merge",
  "Dooring risk",
  "Speeding vehicle",
  "Confusing intersection",
]

type SurveyStep = "spots" | "incidents" | "would_use" | "done"

export default function SurveyPage() {
  const [step, setStep] = useState<SurveyStep>("spots")
  const [selectedSpots, setSelectedSpots] = useState<string[]>([])
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([])
  const [wouldUse, setWouldUse] = useState<string>("")
  const [why, setWhy] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function toggleSpot(spot: string) {
    setSelectedSpots(prev =>
      prev.includes(spot) ? prev.filter(s => s !== spot) : [...prev, spot]
    )
  }

  function toggleIncident(inc: string) {
    setSelectedIncidents(prev =>
      prev.includes(inc) ? prev.filter(i => i !== inc) : [...prev, inc]
    )
  }

  async function handleSubmit() {
    setSubmitting(true)
    await supabase.from("survey_responses").insert({
      dangerous_spots: selectedSpots,
      incident_types: selectedIncidents,
      would_use: wouldUse,
      why,
    })
    setSubmitting(false)
    setStep("done")
  }

  if (step === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white pb-24">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">Thank you!</h1>
          <p className="mt-3 text-gray-400">
            Your response helps us understand where Davis cyclists feel unsafe.
            This data directly shapes BlindSpot's safety map.
          </p>
          <a
            href="/"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-bold text-black"
          >
            See the dashboard
          </a>
        </div>
        <Navbar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-md p-6 pb-32">

        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {(["spots", "incidents", "would_use"] as SurveyStep[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step === s ? "bg-orange-400"
                : ["spots", "incidents", "would_use"].indexOf(step) > i
                ? "bg-orange-400/50" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {step === "spots" && (
          <>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
              BlindSpot Survey
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              Where do you feel unsafe biking in Davis?
            </h1>
            <p className="mt-2 text-gray-400">Select all that apply.</p>

            <div className="mt-6 space-y-3">
              {DANGEROUS_SPOTS.map((spot) => (
                <button
                  key={spot}
                  onClick={() => toggleSpot(spot)}
                  className={`w-full rounded-2xl border p-4 text-left transition flex items-center justify-between ${
                    selectedSpots.includes(spot)
                      ? "border-orange-400 bg-orange-500/10"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`h-4 w-4 shrink-0 ${
                      selectedSpots.includes(spot) ? "text-orange-400" : "text-zinc-500"
                    }`} />
                    <span className="text-sm font-medium">{spot}</span>
                  </div>
                  {selectedSpots.includes(spot) && (
                    <CheckCircle className="h-5 w-5 shrink-0 text-orange-400" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("incidents")}
              disabled={selectedSpots.length === 0}
              className="mt-8 w-full rounded-full bg-white py-4 font-bold text-black disabled:bg-zinc-700 disabled:text-zinc-400 flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {step === "incidents" && (
          <>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
              BlindSpot Survey
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              What have you experienced while biking?
            </h1>
            <p className="mt-2 text-gray-400">Select all that apply.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {INCIDENT_TYPES.map((inc) => (
                <button
                  key={inc}
                  onClick={() => toggleIncident(inc)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedIncidents.includes(inc)
                      ? "border-orange-400 bg-orange-500/10"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  {selectedIncidents.includes(inc) && (
                    <CheckCircle className="mb-2 h-4 w-4 text-orange-400" />
                  )}
                  <span className="text-sm font-medium">{inc}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("would_use")}
              disabled={selectedIncidents.length === 0}
              className="mt-8 w-full rounded-full bg-white py-4 font-bold text-black disabled:bg-zinc-700 disabled:text-zinc-400 flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {step === "would_use" && (
          <>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
              BlindSpot Survey
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              Would you use an app like BlindSpot?
            </h1>
            <p className="mt-2 text-gray-400">
              An app that maps near-misses and suggests safer bike routes.
            </p>

            <div className="mt-6 space-y-3">
              {[
                { value: "yes", label: "Yes, definitely", sub: "I'd use it regularly" },
                { value: "maybe", label: "Maybe", sub: "Depends on how well it works" },
                { value: "no", label: "Not really", sub: "I'm comfortable with my current routes" },
              ].map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() => setWouldUse(value)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    wouldUse === value
                      ? "border-orange-400 bg-orange-500/10"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <p className="font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-gray-400">{sub}</p>
                </button>
              ))}
            </div>

            <textarea
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Any other thoughts? (optional)"
              className="mt-6 min-h-24 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none placeholder:text-gray-500"
            />

            <button
              onClick={handleSubmit}
              disabled={!wouldUse || submitting}
              className="mt-6 w-full rounded-full bg-white py-4 font-bold text-black disabled:bg-zinc-700 disabled:text-zinc-400 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>
              ) : (
                "Submit response"
              )}
            </button>
          </>
        )}

      </div>
      <Navbar />
    </div>
  )
}
