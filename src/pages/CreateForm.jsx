import React, { useState } from "react";
import "../styles/CreateForm.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrash, FaUserCircle, FaUserPlus, FaPlusSquare } from "react-icons/fa";
import { IoDuplicateOutline, IoRemoveCircleSharp } from "react-icons/io5";
import { FiPlusCircle } from "react-icons/fi";
import FormHeader from "../components/FormHeader";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";



const CreateForm = ({ onPublish }) => {

  const location = useLocation();
  const navigate = useNavigate();
  const initialTitle = location.state?.formTitle || "Untitled Form";
  const initialDescription = location.state?.formDescription || "";
  const [formTitle, setFormTitle] = useState(initialTitle);
  const [formDescription, setFormDescription] = useState(initialDescription);
  const [status, setStatus] = useState("Activated"); // Default to "Activated"

  const [questions, setQuestions] = useState([
    { id: "1", title: "Question Title", type: "short", options: ["Option 1"] },
  ]);

  


  const handlePublish = async () => {
    if (!formTitle.trim()) {
      alert("Please enter a form title before publishing.");
      return;
    }
  
    const newForm = {
      name: formTitle,
      description: formDescription,
      is_active: status === "Activated",
    };
  
    try {
      await axios.post("/forms", newForm);  // Send form data to backend
      navigate("/myforms"); // Go back to MyForms after saving
    } catch (error) {
      console.error("Error publishing form:", error);
    }
  };
  
  
  

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: `${questions.length + 1}`, title: "New Question", type: "short", options: ["Option 1"] },
    ]);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = { ...questions[index], id: `${questions.length + 1}` };
    setQuestions([...questions, questionToDuplicate]);
  };

  const handleTitleChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].title = value;
    setQuestions(updatedQuestions);
  };

  const handleTypeChange = (index, newType) => {
    const updatedQuestions = [...questions];
    if (newType === "multiple" || newType === "checkbox") {
      updatedQuestions[index].options = ["Option 1"];
    }
    updatedQuestions[index].type = newType;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push(`Option ${updatedQuestions[qIndex].options.length + 1}`);
    setQuestions(updatedQuestions);
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
          <p>Dashboard</p>
          <p>My Forms</p>
          <p>Responses</p>
          <p>Notifications</p>
          <p>Settings</p>
          <p className="create-logout">Logout</p>
        </nav>
      </aside>

      <div className="create-form-content">
      <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} onPublish={handlePublish} />


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

  <button className="create-user-icon-btn">
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
                              value={question.title}
                              onChange={(e) => handleTitleChange(qIndex, e.target.value)}
                            />
                          </div>
                          <select
                            className="create-question-type"
                            value={question.type}
                            onChange={(e) => handleTypeChange(qIndex, e.target.value)}
                          >
                            <option value="short">Short Answer</option>
                            <option value="paragraph">Paragraph</option>
                            <option value="multiple">Multiple Choice</option>
                            <option value="checkbox">Checkboxes</option>
                          </select>
                        </div>

                        <div className="create-answer-container">
                          {question.type === "short" && (
                            <input type="text" className="create-answer-input" placeholder="Type your answer here" />
                          )}
                          {question.type === "paragraph" && (
                            <textarea className="create-answer-textarea" placeholder="Type your answer here"></textarea>
                          )}
                          {(question.type === "multiple" || question.type === "checkbox") && (
                            <div>
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="option-group">
                                  <input type={question.type === "multiple" ? "radio" : "checkbox"} name={`question-${question.id}`} />
                                  <input type="text" className="create-answer-input" value={option} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} />
                                  <IoRemoveCircleSharp className="create-icon-trash create-delete" onClick={() => {
                                    const updatedQuestions = [...questions];
                                    updatedQuestions[qIndex].options.splice(oIndex, 1);
                                    setQuestions(updatedQuestions);
                                  }} />
                                </div>
                              ))}
                              <div className="option-group add-option" onClick={() => addOption(qIndex)}>
                                <input type={question.type === "multiple" ? "radio" : "checkbox"} disabled />
                                <span>Add option</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="create-question-actions">
                          <IoDuplicateOutline className="create-icon duplicate-icon" onClick={() => duplicateQuestion(qIndex)} />
                          <FaTrash className="create-icon create-delete" onClick={() => deleteQuestion(question.id)} />
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
      </div>
    </div>
  );
};

export default CreateForm;
