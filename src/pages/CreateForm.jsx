import React, { useState } from "react";
import "../styles/CreateForm.css";
import { FaPlus, FaTrash, FaUserCircle } from "react-icons/fa";
import FormHeader from "../components/FormHeader"; // ✅ Import FormHeader

const CreateForm = () => {
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState([{ id: 1, title: "Question Title", type: "short" }]);

  const addQuestion = () => {
    setQuestions([...questions, { id: questions.length + 1, title: "New Question", type: "short" }]);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleTitleChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].title = value;
    setQuestions(updatedQuestions);
  };

  return (
    <div className="create-form-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            <FaUserCircle />
          </div>
          <div className="user-profile-info">
            <p>IT Intern</p>
            <span>itintern@smartgforms.com</span>
          </div>
        </div>

        <button className="create-btn">+ Create new form</button>
        <nav>
          <p>Dashboard</p>
          <p>My Forms</p>
          <p>Responses</p>
          <p>Notifications</p>
          <p>Settings</p>
          <p className="logout">Logout</p>
        </nav>
      </aside>

      {/* Main Form Section */}
      <div className="form-content">
        {/* ✅ Use FormHeader component */}
        <FormHeader formTitle={formTitle} setFormTitle={setFormTitle} />

        <div className="form-settings">
          <strong>Form Title:</strong>
          <input
            type="text"
            className="form-description"
            placeholder="Form Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
        </div>

        {questions.map((question, index) => (
          <div key={question.id} className="question-card">
            <p className="question-label">Question Title:</p>
            <input
              type="text"
              className="question-input"
              value={question.title}
              onChange={(e) => handleTitleChange(index, e.target.value)}
            />
            <select className="question-type" value={question.type}>
              <option value="short">Short Answer</option>
              <option value="multiple">Multiple Choice</option>
            </select>
            <div className="question-actions">
              <FaTrash className="icon delete" onClick={() => deleteQuestion(question.id)} />
            </div>
          </div>
        ))}

        <button className="add-question-btn" onClick={addQuestion}>
          <FaPlus className="icon" /> Add Question
        </button>
      </div>
    </div>
  );
};

export default CreateForm;
