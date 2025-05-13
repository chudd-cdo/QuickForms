import React from "react";
import "../styles/DashboardHeader.css";
import logo from "../assets/chudd.png";
import { FaUserCircle } from "react-icons/fa";
import LocalStorage from "../components/LocalStorage"; // ✅ Ensure correct import

function DashboardHeader() {
  const user = LocalStorage.getUserData() || {}; // ✅ Get user data safely

  return (
    <header className="chudd-dashboard-header">
      <div className="chudd-dashboard-logo-container">
        <img src={logo} alt="SmartGForm Logo" className="chudd-dashboard-logo" />
        <span className="chudd-dashboard-title">CHUDDGForm</span>
      </div>

      {/* ✅ User Profile Info */}
      <div className="chudd-user-profile">
        <div className="chudd-user-profile-info">
          <p>{user.name || "User"}</p>
          <span className="chudd-dashboard-email">{user.email || "user@smartgforms.com"}</span>
        </div>
        <div className="chudd-user-avatar">
          <FaUserCircle size={32} />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
