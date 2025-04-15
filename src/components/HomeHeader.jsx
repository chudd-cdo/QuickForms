import React from "react";
import "../styles/HomeHeader.css";
import logo from "../assets/chudd.png";
import { FaUserCircle } from "react-icons/fa";

function HomeHeader({ openModal }) {
  return (
    <header className="home-header">
      <div className="home-logo-container">
        <img src={logo} alt="SmartGForm Logo" className="home-logo" />
        <span className="home-title">CHUDDGForm</span>
      </div>
      <nav className="home-nav">
        <div className="home-auth-container">
          <span className="home-nav-link" onClick={() => openModal(true)}>Log In</span>
          <span className="home-divider">/</span>
          <span className="home-nav-link" onClick={() => openModal(false)}>Sign Up</span>
        </div>
        <FaUserCircle className="home-user-icon" />
      </nav>
    </header>
  );
}

export default HomeHeader;
