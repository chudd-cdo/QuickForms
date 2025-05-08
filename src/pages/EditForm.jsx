import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/EditForm.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrash, FaUserCircle, FaUserPlus, FaPlusSquare } from "react-icons/fa";
import { IoDuplicateOutline, IoRemoveCircleSharp } from "react-icons/io5";
import { FiPlusCircle } from "react-icons/fi";
import EditHeader from "../components/EditHeader";
import AssignUserModal from "../components/AssignUserModal";
import LocalStorage from "../components/localStorage";
import api from "../api";
import ExcelJS from "exceljs";


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
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);

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
  
        const response = await api.get(`/forms/${formId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        if (!response.data) {
          console.error("No data received from API");
          return;
        }
  
        const { name, description, is_active, questions } = response.data;
  
        const savedPreview = LocalStorage.getFormPreview(formId);
        if (savedPreview && (!questions || questions.length === 0)) {
          console.log("Using saved preview data");
          setFormTitle(savedPreview.title || "Untitled Form");
          setFormDescription(savedPreview.description || "");
          setQuestions(savedPreview.questions || []);
          setStatus(savedPreview.status || "Deactivated");
  
          console.log(" Loaded (from preview) form data:", JSON.stringify({
            id: formId,
            name: savedPreview.title,
            description: savedPreview.description,
            is_active: savedPreview.status === "Activated",
            questions: savedPreview.questions,
          }, null, 2));
          return;
        }
  
        const mappedQuestions = questions.map((q) => ({
          id: q.id,
          question_text: q.question_text || "Untitled Question",
          question_type: q.question_type ?? "short",
          options: ["multiple_choice", "dropdown", "checkbox"].includes(q.question_type) && q.options
            ? Array.isArray(q.options)
              ? q.options
              : q.options.split(',').map(opt => opt.trim())
            : [],
          required: q.required || false,
        }));
  
        setFormTitle(name || "Untitled Form");
        setFormDescription(description || "");
        setStatus(is_active ? "Activated" : "Deactivated");
        setQuestions(mappedQuestions);
  
        console.log("📥 Loaded form data:", JSON.stringify({
          id: formId,
          name,
          description,
          is_active,
          questions: mappedQuestions,
        }, null, 2));
  
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
  
    console.log("Preparing updated form data...");
  
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
        required: q.required ?? false,
      })),
      deleted_questions: deletedQuestionIds,
    };
  
    console.log("Updated form payload to send:", JSON.stringify(updatedForm, null, 2));
  
    try {
      const response = await api.put(
        `/forms/${formId}`,
        updatedForm,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );
  
      console.log("Form updated successfully. Server response:", response.data);
  
      setDeletedQuestionIds([]);
  
      const previewData = {
        title: updatedForm.name,
        description: updatedForm.description,
        status: status,
        questions: updatedForm.questions,
      };
  
      localStorage.setItem(`previewForm-${formId}`, JSON.stringify(previewData));
      console.log(`Stored preview data in localStorage with key: previewForm-${formId}`);
  
      navigate("/myforms", {
        state: {
          updatedForm: {
            ...updatedForm,
            updated_at: response.data.updated_at,
          },
        },
      });
      console.log("Navigated to /myforms with updated form.");
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
        id: null, // New questions will have a null ID
        question_text: "New Question",
        question_type: "short",
        options: [],
        required: false,
      },
    ]);
  };
  const addOption = (qIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...(q.options || []), `Option ${q.options.length + 1}`] }
          : q
      )
    );
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
    setDeletedQuestionIds((prev) => [...prev, id]); // Track deleted question IDs
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
        i === index
          ? {
              ...q,
              question_type: value,
              options: value === "multiple_choice" || value === "checkbox" ? ["Option 1"] : [],
              file: value === "file" ? null : q.file, // Ensure file is reset for other types
            }
          : q
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

  const handleRequiredChange = (index, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index].required = value;
      return updated;
    });
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
                  <Draggable
                  key={question.id || `temp-${qIndex}`} // Use a fallback key if question.id is null
                  draggableId={`draggable-${question.id || `temp-${qIndex}`}`} // Ensure draggableId is unique
                  index={qIndex}
                >
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
                            <option value="file">Upload File</option>
                            </select>
                        </div>

                        <div className="edit-answer-container">
  {/* ✅ Text, Short Answer, and Paragraph Fields */}
  {["text", "short"].includes(question.question_type?.trim()) ? (
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

  {/* ✅ Multiple Choice & Checkbox Options */}
  {["multiple_choice", "checkbox"].includes(question.question_type) && (
    <div>
      {question.options.length > 0 ? (
        question.options.map((option, oIndex) => (
          <div key={oIndex} className="option-group">
            <input
              type={question.question_type === "multiple_choice" ? "radio" : "checkbox"}
              name={`question-${question.id}`}
            />
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

      {/* ✅ Add Option Button (Only for Multiple Choice & Checkbox) */}
      <div className="option-group add-option" onClick={() => addOption(qIndex)}>
        <input type={question.question_type === "multiple_choice" ? "radio" : "checkbox"} disabled />
        <span>Add option</span>
      </div>
    </div>
  )}

  {/* ✅ File Upload Input */}
  {question.question_type === "file" && (
    <div className="create-upload-container">
      <input
        type="file"
        className="create-upload-input"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setQuestions((prev) => {
              const updated = [...prev];
              updated[qIndex].file = file; // ✅ Store file
              return updated;
            });
          }
        }}
      />
      {question.file && <p className="upload-file-name">{question.file.name}</p>}
    </div>
  )}

  {/* ✅ Dropdown Options with Search Bar Inside the Options Container */}
{question.question_type === "dropdown" && (
  <div className="dropdown-container">
    <div className={`dropdown-options ${question.options.length > 10 ? "scrollable" : ""}`}>
      
      {/* ✅ Search Bar inside the dropdown options container */}
      <div className="dropdown-search-container">
        <input
          type="text"
          className="dropdown-search"
          placeholder="Search option..."
          value={question.searchTerm || ""}
          onChange={(e) => {
            const updatedQuestions = [...questions];
            updatedQuestions[qIndex].searchTerm = e.target.value;
            setQuestions(updatedQuestions);
          }}
        />
      </div>

      {/* ✅ Display options normally but apply filter without changing the actual index */}
      {question.options.length > 0 ? (
        question.options.map((option, oIndex) => {
          const isVisible =
            !question.searchTerm ||
            option.toLowerCase().includes(question.searchTerm.toLowerCase());

          return (
            <div key={oIndex} className="option-group" style={{ display: isVisible ? "flex" : "none" }}>
              <input
                type="text"
                className="dropdown-input"
                value={option}
                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
              />
              <IoRemoveCircleSharp
                className="delete-icon"
                onClick={() => {
                  const updatedQuestions = [...questions];
                  updatedQuestions[qIndex].options.splice(oIndex, 1);
                  setQuestions(updatedQuestions);
                }}
              />
            </div>
          );
        })
      ) : (
        <p>No options available.</p>
      )}
    </div>

    



      {/* ✅ Add Option Button (Only for Dropdown) */}
      <div className="option-group add-option" onClick={() => addOption(qIndex)}>
        <span className="add-option">Add option</span>
      </div>

      {/* ✅ File Upload Input (Dropdown-Specific) */}
      <div className="file-upload">
        <input type="file" accept=".xlsx, .xls" onChange={(event) => handleFileUpload(event, qIndex)} />
      </div>
    </div>
  )}

  {/* ✅ Number Input */}
  {question.question_type === "number" && <input type="number" className="input-field" />}
</div>

{/* ✅ Question Actions (Duplicate, Delete, Required Toggle) */}
<div className="create-question-actions">
  <IoDuplicateOutline className="create-icon duplicate-icon" onClick={() => duplicateQuestion(qIndex)} />
  <FaTrash className="create-icon create-delete" onClick={() => deleteQuestion(question.id)} />
  <label className="create-required-toggle">
  Required
  <input
    type="checkbox"
    className="toggle-input"
    checked={question.required || false} // Reflect the current state
    onChange={(e) => handleRequiredChange(qIndex, e.target.checked)}
    />
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
