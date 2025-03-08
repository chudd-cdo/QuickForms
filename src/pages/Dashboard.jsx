/*import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import {
  FaTrash,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
  FaPencilAlt,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [recentForms, setRecentForms] = useState([
    { id: 1, name: "CHUDD Survey" },
    { id: 2, name: "CHUDD Survey 1" },
  ]);
  const [showRecentForms, setShowRecentForms] = useState(false);
  const [showFullScroll, setShowFullScroll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [user, setUser] = useState({ name: "", email: "" });

  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Check for token and user info
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/");
    } else if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({ name: parsedUser.name, email: parsedUser.email });
    }
  }, [navigate]);

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
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to create a form.");
      navigate("/");
      return;
    }
    navigate("/create-form");
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
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You are not authorized. Please log in again.");
      navigate("/");
      return;
    }
    navigate(`/myform/${id}`);
  };

  const handleTrash = () => {
    setRecentForms([]);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Component *//*}
      <Sidebar />

      <div className="dashboard-sidebar">
        <h2 className="dashboard-h2">Home</h2>
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

      {/* Main Content *//*}
      <div className="dashboard-main-content">
        <div className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <FaSearch className="search-icon" />
          </div>
          <div className="user-profile">
            <div className="user-profile-info">
              <p>{user.name || "User"}</p>
              <span>{user.email || "user@smartgforms.com"}</span>
            </div>
            <div className="user-avatar">👤</div>
          </div>
        </div>
        <div className="banner">
          <h2>SMARTER WAY TO CREATE FORMS</h2>
          <h3>SMARTGFORMS</h3>
        </div>

        {/* Recent Forms Scrollable Section *//*}
        <div className="recent-forms-section">
          <h3>Available Form</h3>
          <div className="carousel-container">
            {showFullScroll && (
              <FaChevronLeft className="scroll-btn left" onClick={scrollLeft} />
            )}
            <div
              className={`forms-carousel ${showFullScroll ? "scrollable" : ""}`}
              ref={scrollRef}
            >
              {recentForms.map((form) => (
                <div key={form.id} className="form-card">
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
              ))}
            </div>
            {showFullScroll && (
              <FaChevronRight
                className="scroll-btn right"
                onClick={scrollRight}
              />
            )}
          </div>
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

export default Dashboard;
*/
