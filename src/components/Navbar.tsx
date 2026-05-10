import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Map, AlertTriangle, Building2, BarChart2 } from "lucide-react"

const tabs = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/map", icon: Map, label: "Map" },
  { to: "/report", icon: AlertTriangle, label: "Report" },
  { to: "/planner", icon: Building2, label: "Planner" },
  { to: "/insights", icon: BarChart2, label: "Insights" },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[2000] flex justify-center bg-black border-t border-zinc-800">
      <div className="flex w-full max-w-md justify-around py-3">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-4 transition ${
                active ? "text-orange-400" : "text-zinc-500"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}