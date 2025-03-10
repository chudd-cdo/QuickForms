import React, { useState } from "react";
import "../styles/Home.css";
import bgImage from "../assets/b1.png";
import { FaArrowRight } from "react-icons/fa";
import AuthModal from "./AuthModal"; // Import the modal component
import Header from "../components/HomeHeader";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Function to open the login/signup modal
  const openModal = (login = true) => {
    setIsLogin(login);
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Function to redirect "Get Started Now" to another page
  const handleGetStarted = () => {
    window.location.href = "/Login"; // Change this to your target page
  };

  return (
    <div className="home-container">
      <Header openModal={openModal} />
      <div className="hero-section" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="hero-content">
          <h1 className="hero-title">
            Create your <br /> Forms now <br /> with <span className="highlight">SmartGForms!</span>
          </h1>
          <p className="hero-subtitle">THE SMARTER WAY TO CREATE FORMS.</p>
          <button className="cta-button" onClick={() => openModal(true)}>
            <span className="cta-text">Get started now</span> <FaArrowRight className="cta-icon" />
          </button>
        </div>
      </div>

      {/* Popup Modal for Login & Signup */}
      {showModal && <AuthModal isLogin={isLogin} closeModal={closeModal} setIsLogin={setIsLogin} />}
    </div>
  );
}

export default Home;
