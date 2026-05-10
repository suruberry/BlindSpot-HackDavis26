import { useState, useRef, useEffect } from "react"
import { AlertTriangle, Loader2, MapPin, Send, Sparkles, TrendingUp } from "lucide-react"
import Navbar from "../components/Navbar"
import { supabase } from "../lib/supabase"
import type { Report } from "../lib/supabase"
import { realIncidents } from "../data/realIncidents"

type Message = {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_QUESTIONS = [
  "Which intersections should Davis prioritize first?",
  "What infrastructure fixes would reduce cyclist risk?",
  "Where are repeated near-miss patterns emerging?",
]

const questionIcons = [MapPin, AlertTriangle, TrendingUp]

type PlannerReport = Report | (typeof realIncidents)[number]
type PlannerContext = {
  totalReports: number
  topLocations: { location: string; count: number }[]
  highSeverityCount: number
  commonIncidentTypes: { type: string; count: number }[]
  recentCommunityReports: {
    type: string
    location: string
    severity: string
    note: string | null
    created_at: string
  }[]
}

function topCounts<T extends string>(items: T[], limit: number) {
  const counts = new Map<T, number>()
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1))

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function buildPlannerContext(reports: PlannerReport[]): PlannerContext {
  const topLocations = topCounts(reports.map((report) => report.location), 3)
    .map(({ label, count }) => ({ location: label, count }))

  const commonIncidentTypes = topCounts(reports.map((report) => report.type), 4)
    .map(({ label, count }) => ({ type: label, count }))

  const recentCommunityReports = reports
    .filter((report): report is Report => !("sourceType" in report))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((report) => ({
      type: report.type,
      location: report.location,
      severity: report.severity,
      note: report.note,
      created_at: report.created_at,
    }))

  return {
    totalReports: reports.length,
    topLocations,
    highSeverityCount: reports.filter((report) => report.severity === "High").length,
    commonIncidentTypes,
    recentCommunityReports,
  }
}

function formatPlannerContext(context: PlannerContext) {
  return JSON.stringify(context, null, 2)
}

function fallbackPlannerReply(question: string, context: PlannerContext) {
  const topLocations = context.topLocations.map((item) => item.location)
  const questionLower = question.toLowerCase()

  if (questionLower.includes("night")) {
    return `Claude is unavailable right now, so here is a local safety summary grounded in ${context.totalReports} BlindSpot signals.\n\nHighest nighttime concern: poor lighting and visibility appear repeatedly in the survey and safety signals.\n\nRecommended fixes:\n- Add lighting audits around high-traffic crossings.\n- Improve reflective lane markings near reported conflict zones.\n- Prioritize ${topLocations[0] ?? "Russell Blvd"} for visibility review.`
  }

  if (questionLower.includes("infrastructure") || questionLower.includes("bike lane") || questionLower.includes("improvements")) {
    return `Claude is unavailable right now, so here is a local safety summary grounded in ${context.totalReports} BlindSpot signals.\n\nPriority infrastructure fixes:\n- Protected bike separation at repeated high-risk corridors.\n- Safer right-turn design at conflict-heavy intersections.\n- Better lighting and pavement visibility.\n\nStart with: ${topLocations.join(", ") || "Russell Blvd, Covell Blvd, and Hutchison Dr"}.`
  }

  return `Claude is unavailable right now, so here is a local safety summary grounded in ${context.totalReports} BlindSpot signals.\n\nMost urgent high-risk zones:\n${topLocations.map((location, index) => `${index + 1}. ${location}`).join("\n") || "1. Russell Blvd\n2. Covell Blvd\n3. Hutchison Dr"}\n\nThere are ${context.highSeverityCount} high-severity signals. These locations should be reviewed for protected bike space, turn conflict reduction, and clearer cyclist visibility.`
}

async function askClaude(messages: Message[], reports: PlannerReport[]): Promise<string> {
  const plannerContext = buildPlannerContext(reports)
  const reportSummary = reports.map(r =>
    `- ${r.type} at ${r.location} (Severity: ${r.severity}; Source: ${"source" in r ? r.source : "Community Report"})${"description" in r ? `: "${r.description}"` : r.note ? `: "${r.note}"` : ""}${r.ai_classification ? ` | Infrastructure fix: ${r.ai_classification.suggested_fix}` : ""}`
  ).join("\n")

  const systemPrompt = `You are an AI urban planning assistant for the city of Davis, CA, specializing in cyclist safety infrastructure.

You have access to a blended Davis cyclist safety dataset: public crash hotspot data from the City of Davis Local Road Safety Plan/SWITRS plus live BlindSpot community near-miss reports.

Use this compact BlindSpot data context first. Treat it as the highest-priority summary of the current app data:

${formatPlannerContext(plannerContext)}

Detailed signal list:

${reportSummary}

Answer questions about this data concisely and actionably. When recommending infrastructure changes, be specific about locations. Use the actual location names, top repeated locations, high severity count, common incident types, and recent community reports from the compact context. Format your responses with clear sections when helpful. Keep responses under 200 words.`

  try {
    const { data, error } = await supabase.functions.invoke("claude", {
      body: {
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      },
    })

    console.log("Claude response:", data)

    if (error) return fallbackPlannerReply(messages.at(-1)?.content ?? "", plannerContext)
    if (data?.error) return fallbackPlannerReply(messages.at(-1)?.content ?? "", plannerContext)
    return data.content?.[0]?.text || "Sorry, I couldn't process that."
  } catch (e) {
    console.error("Claude error:", e)
    return fallbackPlannerReply(messages.at(-1)?.content ?? "", plannerContext)
  }
}

function DataContextCard({
  context,
  compact = false,
}: {
  context: PlannerContext
  compact?: boolean
}) {
  const topLocations = context.topLocations.length
    ? context.topLocations.map((item) => `${item.location} (${item.count})`).join(", ")
    : "No repeated locations yet"
  const commonTypes = context.commonIncidentTypes.length
    ? context.commonIncidentTypes.map((item) => `${item.type} (${item.count})`).join(", ")
    : "No incident types yet"
  const latestCommunity = context.recentCommunityReports[0]

  return (
    <section className="rounded-[1.35rem] border border-sky-100 bg-white p-5 shadow-lg shadow-slate-200">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#ff8a00]" />
        <p className="text-xs font-black uppercase tracking-wide text-[#ff8a00]">
          Data context used
        </p>
      </div>

      <div className={`mt-4 grid ${compact ? "grid-cols-2" : "grid-cols-3"} gap-3`}>
        <div className="rounded-2xl bg-slate-100 p-3">
          <p className="text-2xl font-black text-[#063664]">{context.totalReports}</p>
          <p className="text-xs font-bold text-slate-500">signals</p>
        </div>
        <div className="rounded-2xl bg-red-50 p-3">
          <p className="text-2xl font-black text-red-500">{context.highSeverityCount}</p>
          <p className="text-xs font-bold text-red-500">high risk</p>
        </div>
        {!compact && (
          <div className="rounded-2xl bg-orange-50 p-3">
            <p className="text-2xl font-black text-[#ff8a00]">{context.recentCommunityReports.length}</p>
            <p className="text-xs font-bold text-orange-500">recent live</p>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="font-black text-[#063664]">Top intersections</p>
            <p className="mt-1 font-semibold text-slate-600">{topLocations}</p>
          </div>
          <div>
            <p className="font-black text-[#063664]">Common incident types</p>
            <p className="mt-1 font-semibold text-slate-600">{commonTypes}</p>
          </div>
          {latestCommunity && (
            <div>
              <p className="font-black text-[#063664]">Latest community report</p>
              <p className="mt-1 font-semibold text-slate-600">
                {latestCommunity.type} at {latestCommunity.location}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default function PlannerPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingReports, setLoadingReports] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const combinedReports = [...realIncidents, ...reports]
  const plannerContext = buildPlannerContext(combinedReports)

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
              <DataContextCard context={plannerContext} />
              <p className="text-lg font-black text-slate-600">Suggested questions:</p>
              {SUGGESTED_QUESTIONS.map((q, index) => {
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

          {messages.length > 0 && !loadingReports && (
            <DataContextCard context={plannerContext} compact />
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
