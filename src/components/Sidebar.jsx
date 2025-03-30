import React from "react";
import { FaHome, FaWpforms, FaRegFileAlt, FaBell, FaCogs, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css"; 

import LocalStorage from "../components/localStorage";
import api from "../api";



const Sidebar = () => {
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      try {
        await api.post("/logout");
    
        LocalStorage.clearAuthData();
        delete api.defaults.headers.common["Authorization"]; // ✅ Remove token
    
        console.log("✅ Logout successful");
        navigate("/");
      } catch (error) {
        console.error("❌ Logout failed:", error.response?.data || error.message);
      }
    };
    
  return (
    <div className="sb-sidebar">
     
      <div className="sb-menu-item" onClick={() => navigate("/myforms")}>
        <FaWpforms className="sb-icon" />
        <span>My Forms</span>
      </div>
      <div className="sb-menu-item" onClick={() => navigate("/responses")}>
        <FaRegFileAlt className="sb-icon" />
        <span>Responses</span>
      </div>
      <div className="sb-menu-item" onClick={() => navigate("/notifications")}>
        <FaBell className="sb-icon" />
        <span>Notifications</span>
      </div>
      <div className="sb-menu-item" onClick={() => navigate("/profile")}>
        <FaCogs className="sb-icon" />
        <span>Settings</span>
      </div>
      <div className="sb-menu-item" onClick={handleLogout}>
        <FaSignOutAlt className="sb-icon" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;
