import React from "react";
import "../styles/FormHeader.css";
import logo from "../assets/chuddlogo.png";
import { FaEye, FaEllipsisV } from "react-icons/fa";

const FormHeader = ({ isEditing, formTitle, setFormTitle, onSave, onPublish }) => {
    return (
        <header className="form-header">
            <div className="form-header-left">
                <img src={logo} alt="SmartGForm Logo" className="form-logo" />
                <input
                    type="text"
                    className="form-header-title"
                    value={isEditing ? formTitle : "SmartGForm"}
                    onChange={isEditing ? (e) => setFormTitle(e.target.value) : undefined}
                    readOnly={!isEditing}
                />
            </div>

            <div className="form-header-right">
                <button className="form-preview-btn">
                    <FaEye className="form-icon" /> Preview
                </button>
                <button
                    className={isEditing ? "form-save-btn" : "form-publish-btn"}
                    onClick={isEditing ? onSave : onPublish}
                >
                    {isEditing ? "Publish" : "Save"}
                </button>
                <FaEllipsisV className="form-icon form-more-options" />
            </div>
        </header>
    );
};

export default FormHeader;
