import React from "react";
import "../styles/EditHeader.css";
import logo from "../assets/chuddlogo.png";
import { FaEye, FaEllipsisV } from "react-icons/fa";

const EditHeader = ({ onPreview, onUpdate }) => {
  return (
    <header className="edit-header">
      <div className="edit-header-left">
        <img src={logo} alt="SmartGForm Logo" className="edit-logo" />
        <input
          type="text"
          className="edit-header-title"
          value="SmartGForm"
          readOnly
        />
      </div>

      {/* Actions: Preview, Save */}
      <div className="edit-header-right">
        <button className="edit-previewform-btn" onClick={onPreview}>
          <FaEye className="edit-icon" /> Preview
        </button>

        <button className="edit-publish-btn" onClick={onUpdate}>
          Save
        </button>

        
      </div>
    </header>
  );
};

export default EditHeader;
