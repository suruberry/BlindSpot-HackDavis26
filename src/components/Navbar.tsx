import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Map, TriangleAlert } from "lucide-react"

export default function Navbar() {
  const location = useLocation()

  const navItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Map",
      path: "/map",
      icon: Map,
    },
    {
      label: "Report",
      path: "/report",
      icon: TriangleAlert,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2000] border-t border-zinc-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around py-3">

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 ${
                isActive
                  ? "text-orange-400"
                  : "text-gray-500"
              }`}
            >
              <Icon className="h-6 w-6" />

              <span className="text-xs font-medium">
                {item.label}
              </span>
            </Link>
          )
        })}

      </div>
    </div>
  )
}