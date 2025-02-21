import React from "react";
import "../styles/DashboardHeader.css";
import logo from "../assets/chuddlogo.png";
import { FaUserCircle } from "react-icons/fa";

function DashboardHeader() {
  return (
    <header className="dashboard-header">
      <div className="dashboard-logo-container">
        <img src={logo} alt="SmartGForm Logo" className="dashboard-logo" />
        <span className="dashboard-title">SmartGForm</span>
      </div>

      <div className="dashboard-user-profile">
        <div className="dashboard-user-info">
          <p className="dashboard-user-role">IT Intern</p>
          <span className="dashboard-user-email">itintern@smartgforms.com</span>
        </div>
        <div className="dashboard-user-avatar">
          <FaUserCircle />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
