import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Responses from "./pages/Responses"; // Import Responses page
import Notifications from "./pages/Notifications";
import Header from "./components/Header";
import Header1 from "./components/Header1";

function App() {
  const location = useLocation();
  
  return (
    <div>
      {location.pathname === "/" ? <Header /> : <Header1 />}  {/* ✅ Conditional Header */}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/responses" element={<Responses />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </div>
  );
}

export default App;