import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

axios.defaults.baseURL = "http://localhost:8000/api";

const MyForms = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get("/forms");
      setForms(response.data);
    } catch (error) {
      console.error("Error fetching forms", error);
    }
  };

  const handleCreateForm = async () => {
    try {
      const response = await axios.post("/forms", {
        name: formTitle,
        description: formDescription,
      });
      setForms([...forms, response.data]);
      setShowModal(false);
      setFormTitle("");
      setFormDescription("");
    } catch (error) {
      console.error("Error creating form", error);
    }
  };

  const handleDeleteForm = async (id) => {
    try {
      await axios.delete(`/forms/${id}`);
      setForms(forms.filter((form) => form.id !== id));
    } catch (error) {
      console.error("Error deleting form", error);
    }
  };

  return (
    <div className="chudd-myforms-container">
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
        <div className="chudd-menu-item">
          <FaSignOutAlt className="chudd-icon" />
          <span>Logout</span>
        </div>
      </div>

      <div className="chudd-main-content">
        <div className="chudd-top-bar">
          <h1>My Forms</h1>
        </div>

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

        <table className="chudd-myforms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date Created</th>
              <th>Status</th>
              <th>Responses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {forms.length === 0 ? (
    <tr>
      <td colSpan="5" style={{ textAlign: "center" }}>No forms available</td>
    </tr>
  ) : (
    forms.map((form) => (
      <tr key={form.id}>
        <td title={form.name}>{form.name}</td>
        <td>{new Date(form.created_at).toLocaleDateString()}</td>
        <td className={form.is_active ? "chudd-status-active" : "chudd-status-deactivated"}>
          {form.is_active ? "Activated" : "Deactivated"}
        </td>
        <td>{form.user_id ? form.user_id : "—"}</td> {/* Empty for now */}
        <td>
          <FaEdit className="chudd-edit-icon" onClick={() => navigate(`/edit-form/${form.id}`)} />
          <FaTrash className="chudd-delete-icon" onClick={() => handleDeleteForm(form.id)} />
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>

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
