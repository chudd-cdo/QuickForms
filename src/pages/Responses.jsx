import React, { useState, useRef } from "react";
import { useNavigate, BrowserRouter as Router } from "react-router-dom";
import "../styles/Responses.css";
import {
  FaRegFileAlt,
  FaTrash,
  FaSearch,
  FaHome,
  FaWpforms,
  FaBell,
  FaCogs,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
  FaPencilAlt,
  FaEye,
  FaTimes,
} from "react-icons/fa";

const Responses = () => {
  const [recentForms, setRecentForms] = useState([
    { id: 1, name: "CHUDD Survey" },
    { id: 2, name: "CHUDD Survey 1" },
  ]);
  const [showRecentForms, setShowRecentForms] = useState(false);
  const [showFullScroll, setShowFullScroll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const handleCreateNewForm = () => {
    const newForm = {
      id: Date.now(),
      name: `Untitled Form ${recentForms.length + 1}`,
    };
    setRecentForms([...recentForms, newForm]);
  };

  const handleRenameForm = (id) => {
    const newName = prompt("Enter new form name:");
    if (newName) {
      setRecentForms(
        recentForms.map((form) =>
          form.id === id ? { ...form, name: newName } : form
        )
      );
    }
  };

  const handleDeleteForm = (id) => {
    setRecentForms(recentForms.filter((form) => form.id !== id));
  };

  const handleOpenForm = (id) => {
    alert(`Opening form ID: ${id}`);
  };

  const handleTrash = () => {
    setRecentForms([]);
  };

  return (
    <div className="responses-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="menu-item" onClick={() => navigate("/dashboard")}>
          <FaHome className="icon" />
          <span>Dashboard</span>
        </div>
        <div className="menu-item">
          <FaWpforms className="icon" />
          <span>My Forms</span>
        </div>
        <div className="menu-item" onClick={() => navigate("/responses")}>
          <FaRegFileAlt className="icon" />
          <span>Responses</span>
        </div>
        <div className="menu-item">
          <FaBell className="icon" />
          <span>Notifications</span>
        </div>
        <div className="menu-item">
          <FaCogs className="icon" />
          <span>Settings</span>
        </div>
        <div className="menu-item">
          <FaSignOutAlt className="icon" />
          <span>Logout</span>
        </div>
      </div>

      {/* Responses Sidebar */}
      <div className="responses-sidebar">
        <h2>Responses</h2>
        <button className="create-form" onClick={handleCreateNewForm}>
          + Create new form
        </button>
        <div className="recent-forms">
          <h3>Recent Forms</h3>
          <div className={`forms-list ${showRecentForms ? "scrollable" : ""}`}>
            {recentForms.length > 0 ? (
              recentForms.map((form) => (
                <div key={form.id} className="form-item">
                  📄 {form.name}
                  <FaEllipsisV
                    className="options-icon"
                    onClick={() =>
                      setMenuOpen(menuOpen === form.id ? null : form.id)
                    }
                  />
                  {menuOpen === form.id && (
                    <div className="dropdown-menu">
                      <div onClick={() => handleRenameForm(form.id)}>
                        <FaPencilAlt /> Rename
                      </div>
                      <div onClick={() => handleOpenForm(form.id)}>
                        <FaEye /> Open/Edit
                      </div>
                      <div onClick={() => handleDeleteForm(form.id)}>
                        <FaTimes /> Delete
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No forms available</p>
            )}
          </div>
          <a
            href="#"
            className="see-all"
            onClick={(event) => {
              event.preventDefault();
              setShowRecentForms(!showRecentForms);
            }}
          >
            {showRecentForms ? "Show Less" : "See All"}
          </a>
        </div>
        <div className="trash-section" onClick={handleTrash}>
          <FaTrash className="trash-icon" />
          <span>Trash</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <FaSearch className="search-icon" />
          </div>
          <div className="user-profile">
            <div className="user-profile-info">
              <p>IT Intern</p>
              <span>itintern@smartgforms.com</span>
            </div>
            <div className="user-avatar">👤</div>
          </div>
        </div>
        <div className="banner">
          <h2>SMARTER WAY TO CREATE FORMS</h2>
          <h3>SMARTGFORMS</h3>
        </div>

        {/* Recent Forms Scrollable Section */}
        <div className="recent-forms-section">
          <h3>Users Forms Responses</h3>
          
          
          <a
            href="#"
            className="see-all"
            onClick={(event) => {
              event.preventDefault();
              setShowFullScroll(!showFullScroll);
            }}
          >
            {showFullScroll ? "Show Less" : "See All"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Responses;

