import React from "react";
import "../styles/Header.css";
import logo from "../assets/chuddlogo.png";
import { FaUserCircle } from "react-icons/fa";

function Header({ openModal }) {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="SmartGForm Logo" className="logo" />
        <span className="title">SmartGForm</span>
      </div>
    
    </header>
  );
}

export default Header;
