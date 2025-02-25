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
        <button className="form-previewform-btn" onClick={onPreview}>
          <FaEye className="form-icon" /> Preview
        </button>

        <button className="form-publish-btn" onClick={onPublish}>
          Publish
        </button>

        <FaEllipsisV className="form-icon form-more-options" />
      </div>
    </header>
  );
};

export default FormHeader;
