import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import "../styles/AuthModal.css";

function AuthModal({ isLogin, closeModal, setIsLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // Needed for signup
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";
    const bodyData = isLogin ? { email, password } : { name, email, password };

    const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } else {
      alert(`${isLogin ? "Login" : "Registration"} failed`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={closeModal}>&times;</span>
        <h2>{isLogin ? "Log In" : "Sign Up"}</h2>
        <p className="sub-text">{isLogin ? "Sign in to continue." : "Create an account to get started."}</p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-container">
              <FaUser className="icon" />
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="input-container">
            <FaEnvelope className="icon" />
            <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-container">
            <FaLock className="icon" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-button">{isLogin ? "Log In" : "Sign Up"}</button>
        </form>

        {isLogin ? (
          <p className="switch-text">
            Don't have an account? <span onClick={() => setIsLogin(false)}>Register</span>
          </p>
        ) : (
          <p className="switch-text">
            Already have an account? <span onClick={() => setIsLogin(true)}>Log In</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
