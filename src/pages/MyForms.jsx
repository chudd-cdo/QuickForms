import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyForms.css";
import {
  FaRegFileAlt,
  FaTrash,
  FaSearch,
  FaHome,
  FaWpforms,
  FaBell,
  FaCogs,
  FaSignOutAlt,
  FaArchive,
  FaEdit,
} from "react-icons/fa";

const MyForms = ({ forms, setForms }) => { 
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Function to truncate long names
  const truncateText = (text, maxLength = 15) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const handleCreateForm = () => {
    navigate("/create-form", {
      state: { formTitle, formDescription },
    });
  };

  return (
    <div className="chudd-myforms-container">
      {/* Sidebar */}
      <div className="chudd-sidebar">
        <div className="chudd-menu-item" onClick={() => navigate("/dashboard")}>
          <FaHome className="chudd-icon" />
          <span>Dashboard</span>
        </div>
        <div className="chudd-menu-item" onClick={() => navigate("/forms")}>
          <FaWpforms className="chudd-icon" />
          <span>My Forms</span>
        </div>
        <div className="chudd-menu-item" onClick={() => navigate("/responses")}>
          <FaRegFileAlt className="chudd-icon" />
          <span>Responses</span>
        </div>
        <div className="chudd-menu-item" onClick={() => navigate("/notifications")}>
          <FaBell className="chudd-icon" />
          <span>Notifications</span>
        </div>
        <div className="chudd-menu-item">
          <FaCogs className="chudd-icon" />
          <span>Settings</span>
        </div>
        <div className="chudd-menu-item">
          <FaSignOutAlt className="chudd-icon" />
          <span>Logout</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="chudd-main-content">
        <div className="chudd-top-bar">
          <h1>My Forms</h1>
        </div>

        {/* Search & Actions Container */}
        <div className="chudd-search-actions-container">
          <div className="chudd-search-bar">
            <input type="text" placeholder="Search" />
            <FaSearch className="chudd-search-icon" />
          </div>

          <div className="chudd-actions">
            <FaArchive className="chudd-archive-icon" />
            <button className="chudd-create-form" onClick={() => setShowModal(true)}>
              + Create new form
            </button>
          </div>
        </div>

        {/* MyForms List */}
        <table className="chudd-myforms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date Created</th>
              <th>Status</th>
              <th>Responses</th>
            </tr>
          </thead>
          <tbody>
            {forms.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>No forms available</td>
              </tr>
            ) : (
              forms.map((form) => (
                <tr key={form.id}>
                  <td>
                    <FaEdit className="chudd-edit-icon" />
                    <FaTrash className="chudd-delete-icon" />
                    <span title={form.name}>{truncateText(form.name, 15)}</span>
                  </td>
                  <td>{form.dateCreated}</td>
                  <td className={form.status === "Activated" ? "chudd-status-active" : "chudd-status-deactivated"}>
                    {form.status}
                  </td>
                  <td>{form.responses}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="chudd-modal-overlay">
          <div className="chudd-modal">
            <div className="chudd-modal-header">
              <h2>Create new form</h2>
              <span className="chudd-close" onClick={() => setShowModal(false)}>&times;</span>
            </div>
            <div className="chudd-modal-body">
              <label>Form Name</label>
              <input
                type="text"
                placeholder="Enter Form Name Here"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <label>Form Description</label>
              <textarea
                placeholder="Enter Description Here"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="chudd-modal-footer">
              <button className="chudd-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="chudd-create" onClick={handleCreateForm}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyForms;
