import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import "../styles/PreviewForm.css";

const PreviewForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const formData = location.state?.form;

  if (!formData) {
    return <p>No form data available. Please create a form first.</p>;
  }

  return (
    <div className="pf-container">
      <header className="pf-header">
        <div className="pf-header-left" onClick={() => navigate(-1)}>
          <FaArrowLeft className="pf-icon" />
          <h2>Preview Only</h2>
        </div>
        <div className="pf-header-right">
          <div className="pf-status">
            <FaEyeSlash /> Not yet active
          </div>
          <div className="pf-user-info">
            <div className="pf-user-role">IT Intern</div>
            <FaUserCircle className="pf-avatar" />
          </div>
        </div>
      </header>

      <div className="pf-content">
        <div className="pf-card">
          <h3 className="pf-title">{formData.title || "Untitled Form"}</h3>
          <p className="pf-description">{formData.description || "Form Description"}</p>
        </div>

        {formData.questions.map((question, index) => (
          <div key={index} className="pf-question-card">
            <p className="pf-question-title"><strong>{question.title || "Question Name"}</strong></p>

            {/* Editable answer fields */}
            {question.type === "short" && <input type="text" className="pf-input" placeholder="Short answer" />}
            {question.type === "paragraph" && <textarea className="pf-textarea" placeholder="Long answer"></textarea>}
            {question.type === "number" && <input type="number" className="pf-input" placeholder="Enter a number" />}

            {question.type === "multiple" && question.options.length > 0 && (
              question.options.map((option, oIndex) => (
                <div key={oIndex} className="pf-option">
                  <input type="radio" className="pf-radio" name={`question-${index}`} />
                  <label className="pf-label">{option}</label>
                </div>
              ))
            )}

            {question.type === "checkbox" && question.options.length > 0 && (
              question.options.map((option, oIndex) => (
                <div key={oIndex} className="pf-option">
                  <input type="checkbox" className="pf-checkbox" />
                  <label className="pf-label">{option}</label>
                </div>
              ))
            )}

            {question.type === "dropdown" && question.options.length > 0 && (
              <select className="pf-dropdown">
                <option value="">Select an option</option>
                {question.options.map((option, oIndex) => (
                  <option key={oIndex} value={option}>{option}</option>
                ))}
              </select>
            )}

            {question.required && <span className="pf-required-label">* Required Question</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewForm;
