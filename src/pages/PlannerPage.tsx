import { useState, useRef, useEffect } from "react"
import { Building2, Send, Loader2, Sparkles } from "lucide-react"
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

type PlannerReport = Report | (typeof realIncidents)[number]

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

    if (error) return `Error: ${error.message}`
    if (data.error) return `Error: ${data.error.message}`
    return data.content?.[0]?.text || "Sorry, I couldn't process that."
  } catch (e) {
    console.error("Claude error:", e)
    return "Network error — check console for details."
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
      <div className="flex h-screen w-full max-w-[430px] flex-col pb-20">

        <div className="glass-panel m-4 mb-0 shrink-0 rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-500" />
            <p className="eyebrow">City Planner Mode</p>
          </div>
          <h1 className="mt-2 text-3xl font-black">AI Safety Analyst</h1>
          <p className="muted-copy mt-1 text-sm">
            Turn safety signals into fixes.
          </p>
          {!loadingReports && (
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600">{combinedReports.length} safety signals loaded</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loadingReports && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">Suggested questions:</p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="soft-card w-full rounded-2xl p-4 text-left text-sm text-gray-300 transition hover:border-zinc-400 hover:bg-white/5"
                >
                  <Sparkles className="inline h-3.5 w-3.5 text-orange-500 mr-2" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "primary-action font-medium"
                  : "soft-card text-gray-200"
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
              <div className="soft-card rounded-2xl px-4 py-3">
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
              className="flex-1 rounded-2xl border border-zinc-300 bg-white/70 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
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
