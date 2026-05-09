import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import MapPage from "./pages/MapPage"
import ReportPage from "./pages/ReportPage"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App