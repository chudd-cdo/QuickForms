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
    </header>
  );
}

export default DashboardHeader;
