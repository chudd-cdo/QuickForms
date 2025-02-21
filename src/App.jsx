import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Responses from "./pages/Responses";
import Notifications from "./pages/Notifications";
import CreateForm from "./pages/CreateForm"; // ✅ Import CreateForm
import HomeHeader from "./components/HomeHeader";
import DashboardHeader from "./components/DashboardHeader";
import FormHeader from "./components/FormHeader"; // ✅ Import FormHeader

function App() {
  const location = useLocation();

  return (
    <div>
      {/* ✅ Conditional Header */}
      {location.pathname === "/" ? (
        <HomeHeader />
      ) : location.pathname === "/create-form" ? (
        <FormHeader /> // ✅ Show FormHeader only on /create-form
      ) : (
        <DashboardHeader />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/responses" element={<Responses />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/create-form" element={<CreateForm />} /> {/* ✅ Route for CreateForm */}
      </Routes>
    </div>
  );
}

export default App;
