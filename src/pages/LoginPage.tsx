import { useState } from "react"
import { Loader2 } from "lucide-react"
import BlindSpotLogo from "../components/BlindSpotLogo"
import { useAuth } from "../lib/auth"

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  async function handleSubmit() {
    if (!email || !password || loading) return

    setLoading(true)
    setError("")
    setNotice("")

    try {
      if (isSignUp) {
        const hasSession = await signUp(email, password)
        if (!hasSession) {
          setNotice("Check your email to confirm your account, then sign in.")
        }
      } else {
        await signIn(email, password)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell items-center p-6">
      <div className="glass-panel w-full max-w-sm rounded-[2rem] p-6">
        <div className="mb-8 flex items-center gap-3">
          <BlindSpotLogo className="h-14 w-14 shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
              BlindSpot
            </p>
            <p className="text-base font-semibold text-zinc-700">
              See it. Signal it. Fix it.
            </p>
          </div>
        </div>

        <h1 className="text-4xl font-black leading-none">
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p className="muted-copy mt-3">
          {isSignUp
            ? "Join the Davis safety signal."
            : "Sign in to continue."}
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full rounded-2xl border border-zinc-300 bg-white/70 px-4 py-4 text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full rounded-2xl border border-zinc-300 bg-white/70 px-4 py-4 text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
          />
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-zinc-300 bg-white/60 p-3 text-sm text-zinc-700">
            {error}
          </p>
        )}

        {notice && (
          <p className="mt-3 rounded-xl border border-zinc-300 bg-white/60 p-3 text-sm text-zinc-700">
            {notice}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!email || !password || loading}
          className="primary-action mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : isSignUp ? "Create account" : "Sign in"}
        </button>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError("")
            setNotice("")
          }}
          className="mt-4 w-full text-center text-sm font-semibold text-zinc-500"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "No account? Sign up"}
        </button>
      </div>
    </div>
  )
}
