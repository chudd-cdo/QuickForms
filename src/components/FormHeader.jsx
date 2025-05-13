import React, { useState } from "react";
import "../styles/FormHeader.css";
import logo from "../assets/chudd.png";
import { FaEye, FaEllipsisV } from "react-icons/fa";

const FormHeader = ({ onPreview, onPublish }) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishClick = async () => {
    setIsPublishing(true);
    try {
      await onPublish(); // This assumes onPublish returns a promise
    } catch (error) {
      console.error("Publishing failed:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <header className="form-header">
      <div className="form-header-left">
        <img src={logo} alt="SmartGForm Logo" className="form-logo" />
        <input
          type="text"
          className="form-header-title"
          value="CHUDDGForm"
          readOnly
        />
      </div>

      <div className="form-header-right">
        <button className="form-preview-btn" onClick={onPreview}>
          <FaEye className="form-icon" />
          <span>Preview</span>
        </button>

        <button
          className="form-publish-btn"
          onClick={handlePublishClick}
          disabled={isPublishing}
        >
          {isPublishing ? "Publishing..." : "Publish"}
        </button>
      </div>
    </header>
  );
};

export default FormHeader;
