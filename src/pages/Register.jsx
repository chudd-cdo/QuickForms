import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaCalendar, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6; // Example: Ensure password is at least 6 characters
  };

  const API_URL = import.meta.env.VITE_API_URL;

const handleRegister = async (e) => {
  e.preventDefault();
  setErrorMessage(""); // Clear previous errors

  // Client-side validation
  if (!name || !email || !password || !dob) {
    setErrorMessage("All fields are required.");
    return;
  }

  if (!validateEmail(email)) {
    setErrorMessage("Please enter a valid email address.");
    return;
  }

  if (!validatePassword(password)) {
    setErrorMessage("Password must be at least 6 characters long.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, dob }),
    });

    const data = await response.json();

    if (response.ok && data?.success) {
      alert("Registration successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } else {
      setErrorMessage(data?.message || "Registration failed. Try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    setErrorMessage("Something went wrong. Please try again later.");
  }
};


  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Create New Account</h2>
        <p className="sub-text">
          Already Registered? <a href="/login">Log in here.</a>
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display errors */}

        <form onSubmit={handleRegister}>
          <div className="form-grid">
            {/* Name Input */}
            <div className="input-group">
              <label>NAME</label>
              <div className="input-container">
                <FaUser className="icon" />
                <span className="separator">|</span>
                <input type="text" placeholder="It Intern" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            {/* Email Input */}
            <div className="input-group">
              <label>EMAIL</label>
              <div className="input-container">
                <FaEnvelope className="icon" />
                <span className="separator">|</span>
                <input type="email" placeholder="itintern@smartgforms.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label>PASSWORD</label>
              <div className="input-container">
                <FaLock className="icon" />
                <span className="separator">|</span>
                <input type={showPassword ? "text" : "password"} placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <span className="toggle-password" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Date of Birth Input */}
            <div className="input-group">
              <label>DATE OF BIRTH</label>
              <div className="input-container">
                <FaCalendar className="icon" />
                <span className="separator">|</span>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
              </div>
            </div>
          </div>

          <button type="submit" className="register-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
