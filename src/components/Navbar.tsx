import { Link, useLocation } from "react-router-dom"
import { Home, Map, AlertTriangle, Sparkles, Lightbulb } from "lucide-react"

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/map", icon: Map, label: "Zones" },
  { to: "/insights", icon: Lightbulb, label: "Insights" },
  { to: "/planner", icon: Sparkles, label: "Planner" },
  { to: "/report", icon: AlertTriangle, label: "Report" },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="nav-glass fixed bottom-0 left-0 right-0 z-[2000] flex justify-center">
      <div className="flex w-full max-w-[430px] justify-around px-4 py-3">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 transition ${
                active ? "text-[#ff8a00]" : "text-[#9aa4b5] hover:text-[#063664]"
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                active ? "bg-[#ff8a00] text-white shadow-lg shadow-orange-200" : ""
              }`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[11px] font-bold">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
