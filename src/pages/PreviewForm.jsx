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
    <div className="preview-form-ui-container">
      <header className="preview-header">
        <div className="preview-header-left" onClick={() => navigate(-1)}>
          <FaArrowLeft className="preview-icon" />
          <h2>Preview Only</h2>
        </div>
        <div className="preview-header-right">
          <div className="status-indicator">
            <FaEyeSlash /> Not yet active
          </div>
          <div className="user-info-container">
            <div className="user-info">IT Intern</div>
            <FaUserCircle className="user-avatar" />
          </div>
        </div>
      </header>

      <div className="preview-form-content">
        <div className="form-card">
          <h3 className="form-title">{formData.title || "Untitled Form"}</h3>
          <p className="form-description">{formData.description || "Form Description"}</p>
        </div>

        {formData.questions.map((question, index) => (
          <div key={index} className="form-question-card">
            <p className="question-title"><strong>{question.title || "Question Name"}</strong></p>
            {question.type === "short" && <input type="text" placeholder="Short answer" disabled />}
{question.type === "paragraph" && <textarea placeholder="Long answer" disabled></textarea>}
{question.type === "multiple" &&
  question.options.map((option, oIndex) => (
    <div key={oIndex} className="option-item">
      <input type="radio" name={`question-${index}`} disabled />
      <label>{option}</label>
    </div>
  ))}
            {question.type === "checkbox" &&
  question.options.map((option, oIndex) => (
    <div key={oIndex} className="option-item">
      <input type="checkbox" disabled />
      <label>{option}</label>
    </div>
  ))}
            {question.required && <span className="required-label">* Required Question</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewForm;
