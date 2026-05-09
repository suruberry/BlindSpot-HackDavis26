import Navbar from "../components/Navbar"
import { Link } from "react-router-dom"
import { AlertTriangle, Bike, Clock3, MapPin } from "lucide-react"
import { mockReports } from "../data/mockReports"

export default function Dashboard() {
  const highRiskReports = mockReports.filter(
    (report) => report.severity === "High"
  )

  return (
    <div className="min-h-screen pb-24 bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
            BlindSpot Analytics
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Infrastructure Risk Dashboard
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Community-powered near-miss intelligence helping identify
            dangerous cyclist infrastructure before accidents occur.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
                to="/map"
                className="rounded-full bg-white px-6 py-3 font-bold text-black"
            >
                View Safety Map
            </Link>

            <Link
                to="/report"
                className="rounded-full border border-orange-400 px-6 py-3 font-bold text-orange-400"
            >
                Report Near Miss
            </Link>
        </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <AlertTriangle className="mb-4 h-8 w-8 text-orange-400" />
            <p className="text-sm text-gray-400">Total Reports</p>
            <h2 className="mt-2 text-4xl font-bold">
              {mockReports.length}
            </h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <Bike className="mb-4 h-8 w-8 text-orange-400" />
            <p className="text-sm text-gray-400">High Risk Zones</p>
            <h2 className="mt-2 text-4xl font-bold">
              {highRiskReports.length}
            </h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <Clock3 className="mb-4 h-8 w-8 text-orange-400" />
            <p className="text-sm text-gray-400">Peak Risk Time</p>
            <h2 className="mt-2 text-2xl font-bold">
              5–8 PM
            </h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <MapPin className="mb-4 h-8 w-8 text-orange-400" />
            <p className="text-sm text-gray-400">Most Reported Area</p>
            <h2 className="mt-2 text-2xl font-bold">
              Hutchison Dr
            </h2>
          </div>

        </div>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold">
            Recent Near-Miss Reports
          </h2>

          <div className="mt-6 space-y-4">

            {mockReports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-zinc-800 bg-black/40 p-5"
              >
                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-xl font-semibold">
                      {report.type}
                    </h3>

                    <p className="mt-1 text-gray-400">
                      {report.location}
                    </p>
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      report.severity === "High"
                        ? "bg-red-500/20 text-red-400"
                        : report.severity === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {report.severity}
                  </div>

                </div>

                <p className="mt-4 text-sm text-gray-500">
                  {report.time}
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>
      <Navbar />
    </div>
  )
}