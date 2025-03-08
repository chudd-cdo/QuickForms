import React from "react";
import { FaHome, FaWpforms, FaRegFileAlt, FaBell, FaCogs, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css"; 
import axios from "axios";
import LocalStorage from "../components/localStorage";



const Sidebar = () => {
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${LocalStorage.getToken()}`,
            },
          }
        );
    
        LocalStorage.clearAuthData(); // ✅ Clear local storage
    
        console.log("✅ Logout successful:", response.data); // 🔥 Log success message in console
        console.log("✅ Local storage after logout:", localStorage); // 🔍 Check if storage is empty
    
        navigate("/"); // Redirect to login page
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
      <div className="sb-menu-item">
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
