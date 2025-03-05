import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaEyeSlash, FaEye, FaUserCircle } from "react-icons/fa";
import "../styles/EditPreview.css";

const EditPreview = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const savedForm = localStorage.getItem(`previewForm-${formId}`);
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm);
      setFormTitle(parsedForm.title || "Untitled Form");
      setFormDescription(parsedForm.description || "");
      setIsActive(parsedForm.status === "Activated");

      setQuestions([]);
      setTimeout(() => {
        setQuestions(
          parsedForm.questions.map((q) => ({
            id: q.id,
            question_text: q.question_text || "Untitled Question",
            question_type: q.question_type || "short",
            options: q.options || [],
          }))
        );
      }, 0);
    }
  }, [formId]);

  return (
    <div className="edit-preview-wrapper">
      <header className="edit-preview-header">
        <div className="edit-preview-header-left">
          <FaArrowLeft className="edit-preview-back-icon" onClick={() => navigate(-1)} />
          <h2 className="edit-preview-header-title">Preview Only</h2>
        </div>

        <div className="edit-preview-header-right">
          <div className={`edit-preview-status ${isActive ? "active" : ""}`}>
            {isActive ? <FaEye /> : <FaEyeSlash />}
            {isActive ? " Activated" : " Not yet active"}
          </div>

          <div className="edit-preview-user-info">
            <span className="edit-preview-user-role">IT Intern</span>
            <FaUserCircle className="edit-preview-avatar" />
          </div>
        </div>
      </header>

      <div className="edit-preview-content">
        <h1 className="edit-preview-title">{formTitle}</h1>
        <p className="edit-preview-description">{formDescription}</p>

        {questions.length === 0 ? (
          <p className="edit-preview-no-questions">No questions available.</p>
        ) : (
          questions.map((question, index) => (
            <div key={index} className="edit-preview-question">
              <p>{question.question_text || "Untitled Question"}</p>

              {question.question_type === "short" && (
                <input type="text" className="edit-preview-input" placeholder="Your answer" />
              )}

              {question.question_type === "paragraph" && (
                <textarea className="edit-preview-textarea" placeholder="Your answer"></textarea>
              )}

              {question.question_type === "multiple_choice" &&
                question.options?.map((option, idx) => (
                  <div key={idx}>
                    <input type="radio" name={`question-${index}`} id={`option-${index}-${idx}`} className="edit-preview-radio" />
                    <label htmlFor={`option-${index}-${idx}`} className="edit-preview-label">
                      {option}
                    </label>
                  </div>
                ))}

              {question.question_type === "checkbox" &&
                question.options?.map((option, idx) => (
                  <div key={idx}>
                    <input type="checkbox" id={`checkbox-${index}-${idx}`} className="edit-preview-checkbox" />
                    <label htmlFor={`checkbox-${index}-${idx}`} className="edit-preview-label">
                      {option}
                    </label>
                  </div>
                ))}

              {question.question_type === "number" && (
                <input type="number" className="edit-preview-input" placeholder="Enter a number" />
              )}

              {question.question_type === "dropdown" && (
                <select className="edit-preview-dropdown" defaultValue="">
                  <option value="" disabled>
                    Select an option
                  </option>
                  {question.options?.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditPreview;
