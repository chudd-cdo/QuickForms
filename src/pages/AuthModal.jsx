import React, { useState, useEffect } from "react";
import api from "../api";
import { FaUser, FaLock, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/AuthModal.css";
import LocalStorage from "../components/LocalStorage";


function AuthModal({ isLogin, closeModal, setIsLogin }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const apiUrl = isLogin ? "/login" : "/register";
    const payload = { email, password };

    if (!isLogin) {
        payload.name = name;
        payload.dob = dob;
    }

    try {
        await api.get("/sanctum/csrf-cookie"); // ✅ CSRF Token Protection
        const response = await api.post(apiUrl, payload);

        const { token, user, profile_photo_url } = response.data;

        if (token) {
            console.log("User Data:", user); // Debugging
            LocalStorage.setAuthData(token, user); // ✅ Ensure user_id is stored
            
            if (profile_photo_url) {
                LocalStorage.saveProfilePhoto(profile_photo_url); // ✅ Save profile photo
            }

            navigate("/myforms");
        }
    } catch (error) {
        setError(error.response?.data?.message || "An error occurred");
        console.error("Auth failed:", error);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="auth-container">
      <div className="auth-box">
        <span className="close-button" onClick={closeModal}>&times;</span>
        <h2 className="auth-title">{isLogin ? "Log In" : "Create New Account"}</h2>
        <p className="auth-subtext">{isLogin ? "Sign In to continue." : "Sign up to get started!"}</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className={isLogin ? "auth-form login-form" : "auth-form register-form"}>
          {isLogin ? (
            <>
              <div className="input-group">
                <label className="input-label">EMAIL</label>
                <div className="input-container">
                  <FaEnvelope className="icon" />|
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">PASSWORD</label>
                <div className="input-container">
                  <FaLock className="icon" />|
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="register-grid">
                <div className="input-group">
                  <label className="input-label">NAME</label>
                  <div className="input-container">
                    <FaUser className="icon" />|
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">EMAIL</label>
                  <div className="input-container">
                    <FaEnvelope className="icon" />|
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">PASSWORD</label>
                  <div className="input-container">
                    <FaLock className="icon" />|
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">DATE OF BIRTH</label>
                  <div className="input-container">
                    <FaCalendarAlt className="icon" />|
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                  </div>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="switch-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(""); // Clear error on switch
            }}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default AuthModal;
