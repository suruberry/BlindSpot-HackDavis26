import Navbar from "../components/Navbar"
import { useState } from "react"
import { AlertTriangle, Bike, Car, Lightbulb, MapPin, Send } from "lucide-react"

const incidentTypes = [
  { label: "Close pass", icon: Car },
  { label: "Unsafe merge", icon: Bike },
  { label: "Poor lighting", icon: Lightbulb },
  { label: "Blocked bike lane", icon: AlertTriangle },
  { label: "Speeding vehicle", icon: Car },
  { label: "Confusing intersection", icon: MapPin },
]

export default function ReportPage() {
  const [selectedType, setSelectedType] = useState("")
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!selectedType) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen pb-24 items-center justify-center bg-black p-6 text-white">
        <div className="max-w-md rounded-3xl bg-zinc-900 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Send className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Report submitted</h1>
          <p className="mt-3 text-gray-400">
            Your near-miss report helps make invisible danger patterns visible.
          </p>
          <a
            href="/map"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black"
          >
            Back to map
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 bg-black p-6 text-white">
      <div className="mx-auto max-w-md">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
          BlindSpot
        </p>

        <h1 className="mt-3 text-4xl font-bold">Report a near miss</h1>

        <p className="mt-3 text-gray-400">
          Tap what happened. Keep it quick so cyclists can stay focused and safe.
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

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note..."
          className="mt-6 min-h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none placeholder:text-gray-500"
        />

        <button
          onClick={handleSubmit}
          disabled={!selectedType}
          className="mt-6 w-full rounded-full bg-white px-6 py-4 font-bold text-black disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          Submit report
        </button>
      </div>
      <Navbar />
    </div>
  )
}