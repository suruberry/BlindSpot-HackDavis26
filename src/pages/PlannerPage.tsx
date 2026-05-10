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
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="flex flex-col w-full max-w-md h-screen pb-20">

        <div className="p-6 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-400" />
            <p className="text-sm uppercase tracking-[0.3em] text-orange-400">City Planner Mode</p>
          </div>
          <h1 className="mt-2 text-3xl font-bold">AI Safety Analyst</h1>
          <p className="mt-1 text-sm text-gray-400">
            Ask questions about Davis cyclist safety data. Powered by Claude.
          </p>
          {!loadingReports && (
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">{combinedReports.length} safety signals loaded</span>
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
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left text-sm text-gray-300 hover:border-orange-500/50 hover:bg-orange-500/5 transition"
                >
                  <Sparkles className="inline h-3.5 w-3.5 text-orange-400 mr-2" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-orange-500 text-black font-medium"
                  : "bg-zinc-900 border border-zinc-800 text-gray-200"
              }`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-xs text-orange-400 font-semibold">Claude Analysis</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-orange-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Analyzing {combinedReports.length} signals...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-zinc-800 shrink-0">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about cyclist safety in Davis..."
              className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-orange-500/50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-black disabled:opacity-40 shrink-0"
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
