import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrash, FaUserCircle, FaUserPlus, FaPlusSquare } from "react-icons/fa";
import { IoDuplicateOutline, IoRemoveCircleSharp } from "react-icons/io5";
import { FiPlusCircle } from "react-icons/fi";
import FormHeader from "../components/FormHeader";

const CreateForm = () => {
  const navigate = useNavigate();
  const initialTitle = "Untitled Form";
  const initialDescription = "";

  // Load state from localStorage
  const [formTitle, setFormTitle] = useState(() => localStorage.getItem("formTitle") || initialTitle);
  const [formDescription, setFormDescription] = useState(() => localStorage.getItem("formDescription") || initialDescription);
  const [questions, setQuestions] = useState(() => {
    const savedQuestions = localStorage.getItem("questions");
    return savedQuestions ? JSON.parse(savedQuestions) : [{ id: "1", title: "Question Title", type: "short", options: [] }];
  });
  const [status, setStatus] = useState("Activated");

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem("formTitle", formTitle);
    localStorage.setItem("formDescription", formDescription);
    localStorage.setItem("questions", JSON.stringify(questions));
  }, [formTitle, formDescription, questions]);

  const handlePreview = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      questions,
    };
    navigate("/preview-form", { state: { form: formData } });
  };
  
  

  // Type Mapping for Backend
  const typeMapping = {
    short: "text",
    paragraph: "text",
    multiple: "multiple_choice",
    checkbox: "checkbox",
    dropdown: "dropdown",
  };
  
  

  // Publish Form
  const handlePublish = async () => {
    if (!formTitle.trim()) {
      alert("Please enter a form title before publishing.");
      return;
    }

    const newForm = {
      name: formTitle,
      description: formDescription,
      is_active: status === "Activated", // Set is_active based on status
    };
    

    try {
      const formResponse = await axios.post("http://localhost:8000/api/forms", newForm);
      const formId = formResponse.data.id;

      if (questions.length > 0) {
        const formattedQuestions = questions.map((q) => ({
          form_id: formId,
          question_text: q.title,
          question_type: typeMapping[q.type] || "text", // Ensure valid type
          options: q.options.length > 0 ? q.options : null, // Ensure valid JSON structure
        }));
        

        await axios.post("http://localhost:8000/api/questions", { questions: formattedQuestions });
      }

      navigate("/myforms");
    } catch (error) {
      console.error("Error publishing form:", error.response?.data || error);
    }
  };
  const handleTitleChange = (index, value) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index].title = value;
      return updatedQuestions;
    });
  };
  const addOption = (questionIndex) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      
      // Ensure the question has an 'options' array
      if (!updatedQuestions[questionIndex].options) {
        updatedQuestions[questionIndex].options = [];
      }
  
      // Add a new option
      updatedQuestions[questionIndex].options.push(`Option ${updatedQuestions[questionIndex].options.length + 1}`);
      
      return updatedQuestions;
    });
  };
    

  // Add Question
  const addQuestion = () => {
    setQuestions([...questions, { id: `${questions.length + 1}`, title: "New Question", type: "short", options: [] }]);
  };
  

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex].options[optionIndex] = value;
      return updatedQuestions;
    });
  };
  
  // Drag and Drop Handling
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedQuestions = [...questions];
    const [movedItem] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedItem);
    setQuestions(reorderedQuestions);
  };
  const deleteQuestion = (questionId) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((question) => question.id !== questionId)
    );
  };
  
  

  const handleTypeChange = (index, newType) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = newType;
  
    // Ensure multiple-choice and checkbox types have options
    if (newType === "multiple" || newType === "checkbox") {
      if (!updatedQuestions[index].options || updatedQuestions[index].options.length === 0) {
        updatedQuestions[index].options = ["Option 1"]; // Default option
      }
    } else {
      updatedQuestions[index].options = []; // Clear options for non-multiple choice types
    }
  
    setQuestions(updatedQuestions);
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
      <FormHeader onPreview={handlePreview} onPublish={handlePublish} />


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