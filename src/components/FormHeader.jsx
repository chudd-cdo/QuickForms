import React from "react";
import "../styles/FormHeader.css";
import logo from "../assets/chuddlogo.png";
import { FaEye, FaEllipsisV } from "react-icons/fa";

const FormHeader = ({ onPreview, onPublish }) => {
  return (
    <header className="form-header">
      <div className="form-header-left">
        <img src={logo} alt="SmartGForm Logo" className="form-logo" />
        <input
          type="text"
          className="form-header-title"
          value="SmartGForm"
          readOnly
        />
      </div>

      {/* Actions: Preview, Publish */}
      <div className="form-header-right">
        <button className="form-preview-btn" onClick={onPreview}>
          <FaEye className="form-icon" /> 
          <span>Preview</span> 
        </button>

        <button className="form-publish-btn" onClick={onPublish}>
          <span>Publish</span>
        </button>
      </div>
    </header>
  );
};

export default FormHeader;
