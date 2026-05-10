import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "./lib/auth"
import Dashboard from "./pages/Dashboard"
import MapPage from "./pages/MapPage"
import ReportPage from "./pages/ReportPage"
import PlannerPage from "./pages/PlannerPage"
import SurveyPage from "./pages/SurveyPage"
import InsightsPage from "./pages/InsightsPage"
import LoginPage from "./pages/LoginPage"
import MyReportsPage from "./pages/MyReportsPage"

function ProtectedApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-shell items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/planner" element={<PlannerPage />} />
      <Route path="/survey" element={<SurveyPage />} />
      <Route path="/insights" element={<InsightsPage />} />
      <Route path="/my-reports" element={<MyReportsPage />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
