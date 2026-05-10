import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardList, Loader2, MapPin, Sparkles, Trash2 } from "lucide-react"
import Navbar from "../components/Navbar"
import { useAuth } from "../lib/auth"
import { supabase } from "../lib/supabase"
import type { Report } from "../lib/supabase"

function severityClass(severity: Report["severity"]) {
  if (severity === "High") return "bg-red-100 text-red-600"
  if (severity === "Medium") return "bg-orange-100 text-orange-600"
  return "bg-green-100 text-green-700"
}

export default function MyReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const userId = user?.id
    if (!userId) return

    async function load() {
      setLoading(true)
      setError("")

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setReports(data ?? [])
      }

      setLoading(false)
    }

    load()
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel("my-reports")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reports",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => setReports((prev) => [payload.new as Report, ...prev])
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "reports",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId = payload.old.id
          setReports((prev) => prev.filter((report) => report.id !== deletedId))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  async function deleteReport(report: Report) {
    if (!user?.id || deletingId) return

    const confirmed = window.confirm("Delete this report? This removes it from your history and the community map.")
    if (!confirmed) return

    setDeletingId(report.id)
    setError("")

    const previousReports = reports
    setReports((prev) => prev.filter((item) => item.id !== report.id))

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", report.id)
      .eq("user_id", user.id)

    if (error) {
      setReports(previousReports)
      setError(error.message)
    }

    setDeletingId(null)
  }

  return (
    <div className="app-shell">
      <div className="mobile-canvas">
        <header>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-zinc-700" />
            <p className="eyebrow">My Signals</p>
          </div>
          <h1 className="mt-3 text-4xl font-black leading-none">Your reports</h1>
          <p className="muted-copy mt-3">
            Near-misses you have signaled to help make Davis safer.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-900" />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-red-700">Could not load reports</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <section className="mt-14 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <MapPin className="h-8 w-8 text-zinc-500" />
            </div>
            <h2 className="text-2xl font-black">No reports yet</h2>
            <p className="muted-copy mx-auto mt-2 max-w-xs text-sm">
              Signal your first near-miss to help other Davis cyclists see danger sooner.
            </p>
            <Link
              to="/report"
              className="primary-action mt-6 inline-flex rounded-full px-6 py-3 text-sm"
            >
              Report a near miss
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-7 rounded-[1.75rem] border border-green-200 bg-green-50 p-5">
              <p className="font-bold text-green-700">
                You have made {reports.length} signal{reports.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-green-700/80">
                Every report helps identify danger before it becomes a crash statistic.
              </p>
            </section>

            <section className="mt-5 space-y-4">
              {reports.map((report) => (
                <article key={report.id} className="soft-card rounded-[1.75rem] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-black">{report.type}</h2>
                      <div className="mt-1 flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                        <p className="text-sm text-zinc-600">{report.location}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${severityClass(report.severity)}`}>
                      {report.severity}
                    </span>
                  </div>

                  {report.note && (
                    <p className="mt-4 rounded-2xl bg-white/70 p-3 text-sm italic text-zinc-600">
                      "{report.note}"
                    </p>
                  )}

                  {report.ai_classification && (
                    <div className="mt-4 rounded-2xl border border-zinc-200 bg-white/75 p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-orange-600">
                          AI Analysis
                        </p>
                        <span className="ml-auto text-xs font-semibold text-zinc-500">
                          {report.ai_classification.severity_score}/10
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-700">
                        {report.ai_classification.suggested_fix}
                      </p>
                      {report.ai_classification.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {report.ai_classification.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-zinc-400">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                    <button
                      onClick={() => deleteReport(report)}
                      disabled={deletingId === report.id}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                    >
                      {deletingId === report.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        <Navbar />
      </div>
    </div>
  )
}
