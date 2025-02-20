import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Responses from "./pages/Responses";
import Notifications from "./pages/Notifications";
import CreateForm from "./pages/CreateForm"; // ✅ Import CreateForm
import Header from "./components/Header";
import Header1 from "./components/Header1";

function App() {
  const location = useLocation();

  return (
    <div>
      {/* ✅ Conditional Header */}
      {location.pathname === "/" ? <Header /> : <Header1 />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/responses" element={<Responses />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/create-form" element={<CreateForm />} /> {/* ✅ New Route for CreateForm */}
      </Routes>
    </div>
  );
}

export default App;
