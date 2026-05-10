import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import MapPage from "./pages/MapPage"
import ReportPage from "./pages/ReportPage"
import PlannerPage from "./pages/PlannerPage"
import SurveyPage from "./pages/SurveyPage"
import InsightsPage from "./pages/InsightsPage"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App