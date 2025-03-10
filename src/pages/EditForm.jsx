import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/EditForm.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrash, FaUserCircle, FaUserPlus, FaPlusSquare } from "react-icons/fa";
import { IoDuplicateOutline, IoRemoveCircleSharp } from "react-icons/io5";
import { FiPlusCircle } from "react-icons/fi";
import EditHeader from "../components/EditHeader";
import axios from "axios";
import AssignUserModal from "../components/AssignUserModal";
import LocalStorage from "../components/localStorage";

const EditForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const formId = id || location.state?.formId || null;

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("Deactivated");
  const [isUserModalOpen, setUserModalOpen] = useState(false);

  useEffect(() => {
    if (!formId) return;

    const fetchFormData = async () => {
      try {
        const authToken = LocalStorage.getToken();
        if (!authToken) {
          console.error("No authentication token found. Redirecting to login...");
          navigate("/login");
          return;
        }

        const response = await axios.get(`http://192.168.5.41:8000/api/forms/${formId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.data) {
          console.error("No data received from API");
          return;
        }

        const { name, description, is_active, questions } = response.data;

        const savedPreview = LocalStorage.getFormPreview(formId);
        if (savedPreview) {
          console.log("Using saved preview data");
          setFormTitle(savedPreview.title || "Untitled Form");
          setFormDescription(savedPreview.description || "");
          setQuestions(savedPreview.questions || []);
          setStatus(savedPreview.status || "Deactivated");
          return;
        }

        setFormTitle(name || "Untitled Form");
        setFormDescription(description || "");
        setStatus(is_active ? "Activated" : "Deactivated");
        setQuestions(questions.map((q) => ({
          id: q.id,
          question_text: q.question_text || "Untitled Question",
          question_type: q.question_type ?? "short",
          options: ["multiple_choice", "dropdown", "checkbox"].includes(q.question_type) && q.options
            ? (() => {
                try {
                  return Array.isArray(q.options) ? q.options.map((option) => (typeof option === "object" ? option.text : option)) : q.options.split(',').map(opt => opt.trim());
                } catch (e) {
                  return q.options.split(',').map(opt => opt.trim());
                }
              })()
            : [],
        })));

        LocalStorage.saveFormPreview(formId, {
          title: name,
          description,
          status: is_active ? "Activated" : "Deactivated",
          questions,
        });

      } catch (error) {
        console.error("Error fetching form data:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          navigate("/");
        }
      }
    };

    fetchFormData();
  }, [formId, navigate]);

  const handlePreview = () => {
    if (!formId) return;

    const formData = {
      title: formTitle,
      description: formDescription,
      status: status,
      questions: questions.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type || "short",
        options: q.options ? [...q.options] : [],
      })),
    };

    localStorage.setItem(`previewForm-${formId}`, JSON.stringify(formData));

    navigate(`/edit-preview/${formId}`);
  };

  const handleUpdate = async () => {
    if (!formTitle.trim()) {
      alert("Please enter a form title before updating.");
      return;
    }

    const token = LocalStorage.getToken();
    if (!token) {
      console.error("No authentication token found. Redirecting to login...");
      navigate("/login");
      return;
    }

    const updatedForm = {
      id: formId,
      name: formTitle,
      description: formDescription,
      is_active: status === "Activated",
      questions: questions.map((q) => ({
        id: q.id,
        question_text: q.question_text || "Untitled Question",
        question_type: q.question_type || "short",
        options: Array.isArray(q.options) ? q.options.filter((opt) => opt.trim()) : [],
      })),
    };

    try {
      const response = await axios.put(
        `http://192.168.5.41:8000/api/forms/${formId}`,
        updatedForm,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      console.log("Form updated:", response.data);

      localStorage.setItem(`previewForm-${formId}`, JSON.stringify({
        title: updatedForm.name,
        description: updatedForm.description,
        status: status,
        questions: updatedForm.questions,
      }));

      navigate("/myforms", {
        state: {
          updatedForm: {
            ...updatedForm,
            updated_at: response.data.updated_at,
          },
        },
      });
    } catch (error) {
      console.error("Error saving form:", error.response ? error.response.data : error.message);
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        LocalStorage.clearAuthData();
        navigate("/");
      }
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question_text: "New Question",
        question_type: "short",
        options: [],
      },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prevQuestions) => {
      return prevQuestions.map((q, i) =>
        i === index ? { ...q, [field]: value, options: Array.isArray(q.options) ? q.options : [] } : q
      );
    });
  };

  const handleInputChange = (questionId, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === questionId ? { ...q, answer: value } : q))
    );
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = {
      ...questions[index],
      id: Date.now().toString()
    };
    setQuestions([...questions, questionToDuplicate]);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setQuestions((prevQuestions) => {
      return prevQuestions.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((opt, oi) => (oi === oIndex ? value : opt)) } : q
      );
    });
  };

  const handleQuestionTypeChange = (index, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === index ? { ...q, question_type: value, options: value === "multiple_choice" || value === "checkbox" ? ["Option 1"] : [] } : q
      )
    );
  };

  const addOption = (qIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === qIndex ? { ...q, options: [...(q.options || []), `Option ${q.options.length + 1}`] } : q
      )
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedQuestions = [...questions];
    const [movedItem] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedItem);

    setQuestions(reorderedQuestions);
  };

  return (
    <div className="create-form-container">
      <aside className="create-sidebar">
        <div className="create-user-profile">
          <div className="create-user-avatar">
            <FaUserCircle />
          </div>
          <div className="create-user-profile-info">
            <p className="create-user-role"><strong>IT Intern</strong></p>
            <span className="create-user-email">itintern@smartgforms.com</span>
          </div>
        </div>
        <button className="create-create-btn">
          <FaPlusSquare className="plus-icon" /> Create new form
        </button>
        <nav className="create-sidebar-nav">
          <p onClick={() => navigate("/dashboard")}>Dashboard</p>
          <p onClick={() => navigate("/myforms")}>My Forms </p>
          <p>Responses</p>
          <p>Notifications</p>
          <p>Settings</p>
          <p className="create-logout">Logout</p>
        </nav>
      </aside>

      <div className="create-form-content">
        <EditHeader onPreview={handlePreview} onUpdate={handleUpdate} />

        <div className="create-form-settings">
          <div className="create-form-left">
            <div className="create-form-title-wrapper">
              <label className="create-form-label">Form Title:</label>
              <input
                type="text"
                className="create-form-title-input"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <input
              type="text"
              className="create-form-description-input"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          <div className="create-form-actions">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="create-form-dropdown"
            >
              <option value="Activated">Activated</option>
              <option value="Deactivated">Deactivated</option>
            </select>

            <button className="create-user-icon-btn" onClick={() => setUserModalOpen(true)}>
              <FaUserPlus className="create-icon" />
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {questions.map((question, qIndex) => (
                  <Draggable key={question.id} draggableId={`draggable-${question.id}`} index={qIndex}>
                    {(provided) => (
                      <div
                        className="create-question-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="create-question-row">
                          <div className="create-question-group">
                            <label className="create-question-label">Question:</label>
                            <input
                              type="text"
                              className="create-question-input"
                              value={question.question_text}
                              onChange={(e) => handleQuestionChange(qIndex, "question_text", e.target.value)}
                            />
                          </div>
                          <select
                            value={question.question_type}
                            onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                          >
                            <option value="short">Short Answer</option>
                            <option value="paragraph">Paragraph</option>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="number">Number</option>
                          </select>
                        </div>

                        <div className="edit-answer-container">
                          {question.question_type?.trim() === "text" ||
                          question.question_type?.trim() === "short" ? (
                            <input
                              type="text"
                              placeholder="Enter your answer"
                              className="input-field"
                              value={question.answer || ""}
                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                            />
                          ) : question.question_type?.trim() === "paragraph" ? (
                            <textarea
                              placeholder="Enter your answer"
                              className="edit-answer-textarea"
                              value={question.answer || ""}
                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                            ></textarea>
                          ) : null}

                          {(question.question_type === "multiple_choice" || question.question_type === "checkbox") && (
                            <div>
                              {question.options.length > 0 ? (
                                question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="option-group">
                                    <input type={question.question_type === "multiple_choice" ? "radio" : "checkbox"} name={`question-${question.id}`} />
                                    <input
                                      type="text"
                                      className="create-answer-input"
                                      value={option}
                                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                    />
                                    <IoRemoveCircleSharp
                                      className="create-icon-trash create-delete"
                                      onClick={() => {
                                        const updatedQuestions = [...questions];
                                        updatedQuestions[qIndex].options.splice(oIndex, 1);
                                        setQuestions(updatedQuestions);
                                      }}
                                    />
                                  </div>
                                ))
                              ) : (
                                <p>No options available.</p>
                              )}
                              <div className="option-group add-option" onClick={() => addOption(qIndex)}>
                                <input type={question.question_type === "multiple_choice" ? "radio" : "checkbox"} disabled />
                                <span>Add option</span>
                              </div>
                            </div>
                          )}
                          {question.question_type === "dropdown" && (
                            <div>
                              {question.options.length > 0 ? (
                                question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="option-group">
                                    <input
                                      type="text"
                                      className="create-answer-input"
                                      value={option}
                                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                    />
                                    <IoRemoveCircleSharp
                                      className="create-icon-trash create-delete"
                                      onClick={() => {
                                        const updatedQuestions = [...questions];
                                        updatedQuestions[qIndex].options.splice(oIndex, 1);
                                        setQuestions(updatedQuestions);
                                      }}
                                    />
                                  </div>
                                ))
                              ) : (
                                <p>No options available.</p>
                              )}
                              <div className="option-group add-option" onClick={() => addOption(qIndex)}>
                                <span>Add option</span>
                              </div>
                              <select className="dropdown-select">
                                {question.options.map((option, index) => (
                                  <option key={index} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {question.question_type === "number" && (
                            <input type="number" className="input-field" />
                          )}
                        </div>

                        <div className="create-question-actions">
                          <IoDuplicateOutline
                            className="create-icon duplicate-icon"
                            onClick={() => duplicateQuestion(qIndex)}
                          />
                          <FaTrash
                            className="create-icon create-delete"
                            onClick={() => deleteQuestion(question.id)}
                          />
                          <label className="create-required-toggle">
                            Required
                            <input type="checkbox" className="toggle-input" />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button className="create-add-question-btn" onClick={addQuestion}>
          <FiPlusCircle className="create-icon" /> Add Question
        </button>
        {isUserModalOpen && (
          <AssignUserModal
            isOpen={isUserModalOpen}
            onClose={() => setUserModalOpen(false)}
            formId={formId}
          />
        )}
      </div>
    </div>
  );
};

export default EditForm;
