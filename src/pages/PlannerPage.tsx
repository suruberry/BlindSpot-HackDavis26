import { useState, useRef, useEffect } from "react"
import { AlertTriangle, Lightbulb, Loader2, MapPin, Send, Sparkles, TrendingUp } from "lucide-react"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"
import type { Report } from "../lib/supabase"
import { realIncidents } from "../data/realIncidents"

type Message = {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_QUESTIONS = [
  "Which intersections have the most high-risk incidents?",
  "What infrastructure changes would most reduce cyclist danger?",
  "Where should the city prioritize bike lane improvements?",
  "What are the most common types of near-misses in Davis?",
  "Which areas are dangerous at night?",
]

const questionIcons = [MapPin, AlertTriangle, TrendingUp, Lightbulb, Sparkles]

type PlannerReport = Report | (typeof realIncidents)[number]

function locationName(report: PlannerReport) {
  return report.location
}

function fallbackPlannerReply(question: string, reports: PlannerReport[]) {
  const highRisk = reports.filter((report) => report.severity === "High")
  const topLocations = highRisk.slice(0, 3).map(locationName)
  const questionLower = question.toLowerCase()

  if (questionLower.includes("night")) {
    return `Claude is unavailable right now, so here is a local safety summary.\n\nHighest nighttime concern: poor lighting and visibility appear repeatedly in the survey and safety signals.\n\nRecommended fixes:\n- Add lighting audits around high-traffic crossings.\n- Improve reflective lane markings near reported conflict zones.\n- Prioritize ${topLocations[0] ?? "Russell Blvd"} for visibility review.`
  }

  if (questionLower.includes("infrastructure") || questionLower.includes("bike lane") || questionLower.includes("improvements")) {
    return `Claude is unavailable right now, so here is a local safety summary.\n\nPriority infrastructure fixes:\n- Protected bike separation at repeated high-risk corridors.\n- Safer right-turn design at conflict-heavy intersections.\n- Better lighting and pavement visibility.\n\nStart with: ${topLocations.join(", ") || "Russell Blvd, Covell Blvd, and Hutchison Dr"}.`
  }

  return `Claude is unavailable right now, so here is a local safety summary.\n\nMost urgent high-risk zones:\n${topLocations.map((location, index) => `${index + 1}. ${location}`).join("\n") || "1. Russell Blvd\n2. Covell Blvd\n3. Hutchison Dr"}\n\nThese locations should be reviewed for protected bike space, turn conflict reduction, and clearer cyclist visibility.`
}

async function askClaude(messages: Message[], reports: PlannerReport[]): Promise<string> {
  const reportSummary = reports.map(r =>
    `- ${r.type} at ${r.location} (Severity: ${r.severity}; Source: ${"source" in r ? r.source : "Community Report"})${"description" in r ? `: "${r.description}"` : r.note ? `: "${r.note}"` : ""}${r.ai_classification ? ` | Infrastructure fix: ${r.ai_classification.suggested_fix}` : ""}`
  ).join("\n")

  const systemPrompt = `You are an AI urban planning assistant for the city of Davis, CA, specializing in cyclist safety infrastructure.

You have access to a blended Davis cyclist safety dataset: public crash hotspot data from the City of Davis Local Road Safety Plan/SWITRS plus live BlindSpot community near-miss reports. Here are the current ${reports.length} safety signals:

${reportSummary}

Answer questions about this data concisely and actionably. When recommending infrastructure changes, be specific about locations. Use the actual location names from the data. Format your responses with clear sections when helpful. Keep responses under 200 words.`

  try {
    const { data, error } = await supabase.functions.invoke("claude", {
      body: {
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      },
    })

    console.log("Claude response:", data)

    if (error) return fallbackPlannerReply(messages.at(-1)?.content ?? "", reports)
    if (data?.error) return fallbackPlannerReply(messages.at(-1)?.content ?? "", reports)
    return data.content?.[0]?.text || "Sorry, I couldn't process that."
  } catch (e) {
    console.error("Claude error:", e)
    return fallbackPlannerReply(messages.at(-1)?.content ?? "", reports)
  }
}

export default function PlannerPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingReports, setLoadingReports] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const combinedReports = [...realIncidents, ...reports]

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("reports").select("*")
      if (data) setReports(data)
      setLoadingReports(false)
    }
    load()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: "user", content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    const reply = await askClaude(newMessages, combinedReports)
    setMessages([...newMessages, { role: "assistant", content: reply }])
    setLoading(false)
  }

  return (
    <div className="app-shell">
      <div className="flex h-screen w-full max-w-[430px] flex-col bg-[#f5f7fb] pb-20">

        <div className="shrink-0 bg-[#063664] px-7 pb-10 pt-24 text-white">
          <div className="eyebrow-pill gap-2">
            <Sparkles className="h-4 w-4" />
            City Planner Mode
          </div>
          <h1 className="mt-6 text-4xl font-black leading-none">AI Safety Analyst</h1>
          <p className="mt-5 text-lg font-semibold text-blue-100">
            Turn safety signals into fixes.
          </p>
          {!loadingReports && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-100 animate-pulse" />
              <span className="text-sm font-black">{combinedReports.length} safety signals loaded</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-8 space-y-5">
          {messages.length === 0 && !loadingReports && (
            <div className="space-y-4">
              <p className="text-lg font-black text-slate-600">Suggested questions:</p>
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q, index) => {
                const Icon = questionIcons[index]
                return (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex w-full items-center gap-4 rounded-[1.35rem] bg-white p-5 text-left text-base font-black leading-snug text-slate-700 shadow-lg shadow-slate-200 transition hover:-translate-y-0.5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#ff4b3e]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span>{q}</span>
                </button>
              )})}

              <div className="mt-8 rounded-[1.4rem] bg-[#ff8a00] p-5 text-white shadow-xl shadow-orange-200">
                <p className="flex items-center gap-2 text-xl font-black">
                  <Sparkles className="h-6 w-6" />
                  How It Works
                </p>
                <p className="mt-2 text-sm font-semibold text-orange-50">
                  Ask about danger zones, infrastructure fixes, and patterns across public hotspots plus live reports.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#063664] text-white font-bold shadow-lg shadow-slate-200"
                  : "bg-white text-slate-800 shadow-lg shadow-slate-200"
              }`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs text-orange-600 font-semibold">Claude Analysis</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-lg shadow-slate-200">
                <div className="flex items-center gap-2 text-orange-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Analyzing {combinedReports.length} signals...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="nav-glass shrink-0 border-t-0 p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about cyclist safety in Davis..."
              className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-slate-400 focus:border-[#ff8a00]"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="primary-action flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
          <Navbar />
      </div>
    </div>
  )
}
