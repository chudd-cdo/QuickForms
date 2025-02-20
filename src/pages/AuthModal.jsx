import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import "../styles/AuthModal.css";

function AuthModal({ isLogin, closeModal, setIsLogin }) {
  const navigate = useNavigate(); // React Router navigation hook
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard"); // Navigate to the dashboard immediately
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={closeModal}>&times;</span>
        <h2 className="modal-title">{isLogin ? "Log In" : "Create New Account"}</h2>
        <p className="modal-subtext">{isLogin ? "Sign In to continue." : "Already Registered? Log In here."}</p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-container">
              <FaUser className="icon" />
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="input-container">
            <FaEnvelope className="icon" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-container">
            <FaLock className="icon" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {!isLogin && (
            <div className="input-container">
              <FaCalendarAlt className="icon" />
              <input type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} required />
            </div>
          )}

          <button type="submit" className="auth-button">{isLogin ? "Log In" : "Sign Up"}</button>
        </form>

        <p className="switch-text">
          {isLogin ? "Forgot Password?" : ""}
        </p>

        <p className="switch-text">
          {isLogin ? "Sign Up" : "Log In"} <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Sign Up" : "Log In"}</span>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
