import { Link, useLocation } from "react-router-dom"
import { Home, Map, AlertTriangle, Building2, BarChart2 } from "lucide-react"

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/map", icon: Map, label: "Map" },
  { to: "/report", icon: AlertTriangle, label: "Report" },
  { to: "/planner", icon: Building2, label: "Planner" },
  { to: "/insights", icon: BarChart2, label: "Insights" },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="nav-glass fixed bottom-0 left-0 right-0 z-[2000] flex justify-center">
      <div className="flex w-full max-w-md justify-around px-3 py-3">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 transition ${
                active ? "bg-white/60 text-zinc-900" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[11px] font-semibold">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
