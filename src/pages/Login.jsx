import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import Header from "../components/Header1"; // Import the Header
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message before attempting login

    // Simulate login success if both fields are filled
    if (email && password) {
      // Optionally store the token in localStorage if you want to persist the login session
      localStorage.setItem("token", "fake-token");
      navigate("/dashboard"); // Redirect to dashboard if login is successful
    } else {
      setErrorMessage("Please fill in both email and password.");
    }
  };

  return (
    <div>
      <Header /> {/* Add Header component here */}
      <div className="login-container">
        <div className="login-box">
          <h2>Log In</h2>
          <p className="sub-text">Sign in to continue.</p>

          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}

          <form onSubmit={handleLogin}>
            <label>NAME</label>
            <div className="input-container">
              <FaUser className="icon" />
              <span className="separator">|</span>
              <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <label>PASSWORD</label>
            <div className="input-container">
              <FaLock className="icon" />
              <span className="separator">|</span>
              <input 
                type="password" 
                placeholder="******" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="login-button">Log in</button>
          </form>

          <p className="forgot-password">Forgot Password?</p>
          <p className="register-link">
            Don't have an account? <a href="/register">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
