import React from "react";
import "../styles/FormHeader.css";
import logo from "../assets/chuddlogo.png";
import { FaEye, FaEllipsisV } from "react-icons/fa";

const FormHeader = ({ formTitle, setFormTitle, onPublish }) => {
  return (
    <header className="home-header">
      <div className="home-logo-container">
        <img src={logo} alt="SmartGForm Logo" className="home-logo" />
        <span className="home-title">SmartGForm</span>
      </div>

      {/* Actions: Preview, Publish */}
      <div className="form-header-right">
        <button className="form-preview-btn">
          <FaEye className="form-icon" /> Preview
        </button>
        <button className="form-publish-btn" onClick={onPublish}>Publish</button>

        <FaEllipsisV className="form-icon form-more-options" />
      </div>
    </header>
  );
};

export default FormHeader;
