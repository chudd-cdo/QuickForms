import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaUpload, FaTrash, FaUserCircle, FaUserPlus, FaPlusSquare } from "react-icons/fa";
import { IoDuplicateOutline, IoRemoveCircleSharp } from "react-icons/io5";
import { FiPlusCircle } from "react-icons/fi";
import FormHeader from "../components/FormHeader";
import "../styles/CreateForm.css";
import LocalStorage from "../components/localStorage";
import api from "../api";

const CreateForm = () => {
  const navigate = useNavigate();
  const initialTitle = "";
  const initialDescription = "";

  const [formTitle, setFormTitle] = useState(() => localStorage.getItem("formTitle") || initialTitle);
  const [formDescription, setFormDescription] = useState(() => localStorage.getItem("formDescription") || initialDescription);
  const [questions, setQuestions] = useState(() => {
    const savedQuestions = localStorage.getItem("questions");
    return savedQuestions ? JSON.parse(savedQuestions) : [{ id: "1", title: "", type: "short", options: [] }];
  });

  const [status, setStatus] = useState("Activated");
  const [formId, setFormId] = useState(null);
  const user = LocalStorage.getUserData() || {}; 

  useEffect(() => {
    localStorage.setItem("formTitle", formTitle);
    localStorage.setItem("formDescription", formDescription);
    localStorage.setItem("questions", JSON.stringify(questions));
  }, [formTitle, formDescription, questions]);

  const handlePreview = () => {
    navigate("/preview-form", { state: { form: { title: formTitle, description: formDescription, questions } } });
  };

  const typeMapping = {
    short: "short",
    paragraph: "paragraph",
    multiple: "multiple_choice",
    checkbox: "checkbox",
    dropdown: "dropdown",
    number: "number",
    file: "file",
  };

  const handlePublish = async () => {
    if (!formTitle.trim()) {
      alert("Please enter a form title before publishing.");
      return;
    }

    try {
      const userId = LocalStorage.getUserId();
      if (!userId) {
        alert("User not authenticated. Please log in again.");
        return;
      }

      const formData = {
        user_id: userId,
        name: formTitle,
        description: formDescription,
        is_active: status === "Activated",
      };

      const formResponse = await api.post("/forms", formData);
      const newFormId = formResponse.data.id;
      setFormId(newFormId);

      const questionData = new FormData();
      questions.forEach((q, index) => {
        questionData.append(`questions[${index}][form_id]`, newFormId);
        questionData.append(`questions[${index}][question_text]`, q.title);
        questionData.append(`questions[${index}][question_type]`, typeMapping[q.type] || "short");
      
        if (q.options && q.options.length > 0) {
          q.options.forEach((option, optIndex) => {
            questionData.append(`questions[${index}][options][${optIndex}]`, option);
          });
        }
      });

      await api.post("/questions", questionData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/myforms");
    } catch (error) {
      console.error("Error publishing form:", error.response?.data || error);
      alert("Error: " + JSON.stringify(error.response?.data));
    }
  };

  const handleTitleChange = (index, value) => {
    setQuestions((prevQuestions) => {
      const updated = [...prevQuestions];
      updated[index].title = value;
      return updated;
    });
  };

  const handleTypeChange = (index, value) => {
    setQuestions((prevQuestions) => {
      const updated = [...prevQuestions];
      updated[index].type = value;
      if (["short", "paragraph", "number", "file"].includes(value)) {
        updated[index].options = [];
      }
      return updated;
    });
  };

  const addOption = (questionIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex].options = [...(updated[questionIndex].options || []), `Option ${updated[questionIndex].options.length + 1}`];
      return updated;
    });
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: `${questions.length + 1}`, title: "", type: "short", options: [] }]);
  };

  const duplicateQuestion = (index) => {
    setQuestions((prev) => {
      const question = { ...prev[index], id: `${prev.length + 1}` };
      return [...prev, question];
    });
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = [...questions];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setQuestions(reordered);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex].options[optionIndex] = value;
      return updated;
    });
  };

  const handleFileUpload = async (event, questionIndex) => { 
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (e) => {
        const buffer = e.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const newOptions = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) { // Skip the header row
                const col1 = row.getCell(1).value?.toString().trim() || ""; // First column (Dynamic)
                const col2 = row.getCell(2).value?.toString().trim() || ""; // Second column (Dynamic)

                if (col2) {
                    // If col1 has a value, format as "ID - Name", otherwise just use the Name
                    newOptions.push(col1 ? `${col1} - ${col2}` : col2);
                } else if (col1) {
                    // If only col1 exists and col2 is empty, just push col1
                    newOptions.push(col1);
                }
            }
        });

        setQuestions((prev) => {
            const updated = [...prev];
            updated[questionIndex].options = newOptions; // Store formatted options
            return updated;
        });
    };
};


  return (
    <div className="create-form-container">
      <aside className="create-sidebar">
        <div className="create-user-profile">
          <div className="create-user-avatar">
            <FaUserCircle />
          </div>
          <div className="create-user-profile-info">
          <p>{user.name || "User"}</p>
          <span className="chudd-dashboard-email">{user.email || "user@smartgforms.com"}</span>
        </div>
        </div>
        <button
          className="create-create-btn"
          onClick={() => {
            localStorage.removeItem("formTitle");
            localStorage.removeItem("formDescription");
            localStorage.removeItem("questions");

            setFormTitle(initialTitle);
            setFormDescription(initialDescription);
            setQuestions([{ id: "1", title: "", type: "short", options: [] }]);
          }}
        >
          <FaPlusSquare className="plus-icon" /> Create new form
        </button>

        <nav className="create-sidebar-nav">
          <p onClick={() => navigate("/myforms")}>My Forms </p>
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
                placeholder="Enter form title"
                className="create-form-title-input"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="Enter form description"
              className="create-form-description-input"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          <div className="create-form-actions">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="create-form-dropdown">
              <option value="Activated">Activated</option>
              <option value="Deactivated">Deactivated</option>
            </select>

            <button className="create-user-icon-btn" onClick={() => {
  if (!formId) {
    alert("Publish the form before assigning users.");
    return;
  }
  setUserModalOpen(true);
}}>
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
                              placeholder="Enter question"
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
                            <option value="dropdown">Dropdown</option>
                            <option value="number">Number</option>
                            <option value="file">Upload File</option> 
                          </select>
                        </div>

                        <div className="create-answer-container">
  {question.type === "short" && (
    <input type="text" className="create-answer-input" placeholder="Short answer text" disabled />
  )}
  {question.type === "paragraph" && (
    <textarea className="create-answer-textarea" placeholder="Type your answer here"></textarea>
  )}
  {question.type === "number" && (
    <input type="number" className="create-answer-input" placeholder="Enter a number" step="1" />
  )}

  {(question.type === "multiple" || question.type === "checkbox" || question.type === "dropdown") && (
    <div>
      {/* ✅ Scrollable container for dropdown options */}
      <div className={`options-container ${question.type === "dropdown" ? "scrollable" : ""}`}>
        {question.options.map((option, oIndex) => (
          <div key={oIndex} className="option-group">
            {question.type !== "dropdown" ? (
              <input type={question.type === "multiple" ? "radio" : "checkbox"} name={`question-${question.id}`} />
            ) : null}
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
        ))}
      </div>

      <div className="option-group add-option" onClick={() => addOption(qIndex)}>
        {question.type !== "dropdown" ? (
          <input type={question.type === "multiple" ? "radio" : "checkbox"} disabled />
        ) : null}
        <span className="add-option">Add option</span>
      </div>

      {/* ✅ File upload input will ONLY appear if question.type is "dropdown" */}
      {question.type === "dropdown" && (
        <div className="file-upload">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(event) => handleFileUpload(event, qIndex)}
          />
        </div>
      )}
    </div>
  )}

  {question.type === "file" && (
    <div className="create-upload-container">
      <input
        type="file"
        className="create-upload-input"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setQuestions((prev) => {
              const updated = [...prev];
              updated[qIndex].file = file;
              return updated;
            });
          }
        }}
      />
      {question.file && <p className="upload-file-name">{question.file.name}</p>}
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
