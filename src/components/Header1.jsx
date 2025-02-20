import React from "react";
import "../styles/Header1.css";
import logo from "../assets/chuddlogo.png";
import { FaUserCircle } from "react-icons/fa";

function Header() {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="SmartGForm Logo" className="logo" />
        <span className="title">SmartGForm</span>
      </div>

      <div className="user-profile">
        <div className="user-profile-info">
          <p>IT Intern</p>
          <span>itintern@smartgforms.com</span>
        </div>
        <div className="user-avatar">
          <FaUserCircle />
        </div>
      </div>
    </header>
  );
}

export default Header;
