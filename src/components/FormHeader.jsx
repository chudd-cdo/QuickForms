import React, { useState } from "react";
import { FaEye, FaSync } from "react-icons/fa";
import "../styles/CreateForm.css";

const FormHeader = ({ formTitle, setFormTitle }) => {
  return (
    <header className="form-header">
      <h1>
        <img src="/logo.png" alt="Logo" className="logo-img" />
        <input
          type="text"
          className="form-title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
        />
      </h1>
      <div className="header-icons">
        <FaSync className="icon" />
        <FaEye className="icon" />
        <button className="publish-btn">Publish</button>
      </div>
    </header>
  );
};

export default FormHeader;
