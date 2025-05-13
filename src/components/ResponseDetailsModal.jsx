import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaTimes, FaFileAlt } from "react-icons/fa";
import "../styles/ResponseDetailsModal.css";
import logo from "../assets/logo.jpg";
import logo1 from "../assets/logo1.png";
import api from "../api"; 

const ResponseDetailsModal = ({ isOpen, onClose, responseId }) => {
  const [responseData, setResponseData] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setResponseData(null);
      setPreviewFile(null);
      setLoading(true);
      return;
    }

    if (!responseId) {
      setLoading(false);
      return;
    }

    const fetchResponseDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await api.get(`/responses/details/${responseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched response data:", res.data); // ✅ Log the entire response data

        setResponseData({
          id: res.data.response_id,
          formName: res.data.formName,
          formDescription: res.data.formDescription || "No description provided.",
          submission_time: res.data.submission_time,
          userName: res.data.userName || "Anonymous",
          answers: res.data.answers || [],
        });

        // Log each question, question type, and answer
        res.data.answers.forEach((answer, index) => {
          console.log(`Question ${index + 1}:`, answer.question_text);
          console.log(`Type:`, answer.answer_type);
          console.log(`Answer:`, answer.response);
        });
      } catch (error) {
        console.error("Error fetching response details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponseDetails();
  }, [isOpen, responseId]);

  const handleEditToggle = () => {
    if (isEditing) {
      handleUpdate(); // Call handleUpdate when exiting edit mode
    } else {
      // Initialize editedAnswers with current answers
      setEditedAnswers(responseData?.answers || []);
    }
    setIsEditing(!isEditing);
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...editedAnswers];
    updatedAnswers[index].response = value;
    setEditedAnswers(updatedAnswers);
  };
  

  const handleUpdate = async () => {
    const formData = new FormData();

    editedAnswers.forEach((ans, index) => {
      formData.append(`answers[${index}][question_id]`, ans.question_id);

      if (ans.answer_type === "file" && ans.response instanceof File) {
        formData.append(`answers[${index}][file]`, ans.response);
      } else {
        formData.append(
          `answers[${index}][response]`,
          Array.isArray(ans.response) ? JSON.stringify(ans.response) : ans.response
        );
      }
    });

    try {
      const token = localStorage.getItem("authToken");
      const res = await api.post(`/responses/update/${responseId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Response updated successfully!");

      // Update the responseData state with the updated answers
      const updatedAnswers = res.data.updatedAnswers; // Use the updated answers from the backend
      setResponseData((prevData) => ({
        ...prevData,
        answers: updatedAnswers,
      }));

      setIsEditing(false);

      // Close the modal after successful update
      onClose();
    } catch (error) {
      console.error("Error updating response:", error);
      alert("Failed to update the response. Please try again.");
    }
  };

  const renderAnswer = (answer) => {
    if (answer.file) {
      const fileName = answer.file.split("/").pop();
      return (
        <div className="file-preview">
          <FaFileAlt className="file-icon" />
          <button
            className="file-button"
            onClick={() => setPreviewFile(answer.file)}
            aria-label={`Preview file ${fileName}`}
          >
            {fileName}
          </button>
        </div>
      );
    } else if (answer.response instanceof File) {
      // Handle File object
      return <p className="response-details-answer-text">{answer.response.name}</p>;
    } else if (answer.response) {
      return (
        <p className="response-details-answer-text">
          {Array.isArray(answer.response)
            ? answer.response.join(", ")
            : String(answer.response)}
        </p>
      );
    } else {
      return <p className="response-details-no-answer">No answer provided</p>;
    }
  };

  const enableEditMode = (answer, index) => {
    const options = Array.isArray(answer.options) ? answer.options : []; // Ensure options is an array

    switch (answer.answer_type) {
      case "text":
      case "short": // Handle short text input
        return (
          <input
            type="text"
            value={editedAnswers[index]?.response || ""}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="editable-answer-input"
          />
        );

      case "textarea":
      case "paragraph": // Handle paragraph input
        return (
          <textarea
            value={editedAnswers[index]?.response || ""}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="editable-answer-textarea"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={editedAnswers[index]?.response || ""}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="editable-answer-input"
          />
        );

      case "multiple_choice":
        return (
          <div className="editable-answer-radio-group">
            {options.length > 0 ? (
              options.map((option, optIndex) => (
                <label key={optIndex} className="radio-label">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={editedAnswers[index]?.response === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                  />
                  {option}
                </label>
              ))
            ) : (
              <p>No options available</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="editable-answer-checkbox-group">
            {options.length > 0 ? (
              options.map((option, optIndex) => (
                <label key={optIndex} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={`question-${index}`}
                    checked={
                      Array.isArray(editedAnswers[index]?.response) &&
                      editedAnswers[index]?.response.includes(option)
                    }
                    onChange={(e) => {
                      const updatedResponse = Array.isArray(
                        editedAnswers[index]?.response
                      )
                        ? [...editedAnswers[index].response]
                        : [];
                      if (e.target.checked) {
                        updatedResponse.push(option);
                      } else {
                        const optionIndex = updatedResponse.indexOf(option);
                        if (optionIndex > -1) {
                          updatedResponse.splice(optionIndex, 1);
                        }
                      }
                      handleAnswerChange(index, updatedResponse);
                    }}
                  />
                  {option}
                </label>
              ))
            ) : (
              <p>No options available</p>
            )}
          </div>
        );

      case "dropdown":
        return (
          <select
            value={editedAnswers[index]?.response || ""}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="editable-answer-select"
          >
            {options.length > 0 ? (
              options.map((option, optIndex) => (
                <option key={optIndex} value={option}>
                  {option}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No options available
              </option>
            )}
          </select>
        );

      case "file":
        return (
          <div className="editable-answer-file">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleAnswerChange(index, file); // Pass the actual File object
                }
              }}
              className="file-input"
            />
            {editedAnswers[index]?.response instanceof File ? (
              <p className="file-name">Selected file: {editedAnswers[index]?.response.name}</p>
            ) : (
              <p className="file-name">Current file: {editedAnswers[index]?.response}</p>
            )}
          </div>
        );

      default:
        return <p className="response-details-no-answer">Unsupported question type</p>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Response Details"
      className="response-details-modal"
      overlayClassName="response-details-modal-overlay"
      ariaHideApp={false} // ✅ use this if you removed Modal.setAppElement
    >
      <div className="response-details-container">
        <header className="response-details-header">
          <h2 className="response-details-title">Response Details</h2>
          <FaTimes
            className="close-icon"
            onClick={onClose}
            aria-label="Close modal"
          />
        </header>

        {loading ? (
          <p className="response-details-loading">Loading...</p>
        ) : (
          <div className="response-details-content">
            <div className="govt-form-header">
              <div className="govt-header-row">
                <img src={logo} alt="City Logo" className="govt-logo left-logo" />
                <div className="govt-text-header">
                  <p>Republic of the Philippines</p>
                  <p>City of Cagayan de Oro</p>
                  <p className="dept-name">
                    CITY HOUSING AND<br />URBAN DEVELOPMENT DEPARTMENT
                  </p>
                </div>
                <img src={logo1} alt="CDO Logo" className="govt-logo right-logo" />
              </div>

              <div className="form-details-text">
                <p className="form-response-title">FORM RESPONSE</p>
                <p className="form-title">{responseData?.formName || "No Form Name"}</p>
                <p className="form-description">
                  {responseData?.formDescription || "No description provided."}
                </p>
                <p className="submission-time">
                  Submitted:{" "}
                  {responseData?.submission_time
                    ? new Date(responseData.submission_time).toLocaleString()
                    : "No submission time"}
                </p>
              </div>
            </div>

            {/* Answers */}
            {responseData?.answers?.length > 0 ? (
              responseData.answers.map((answer, index) => (
                <div key={index} className="response-details-question">
                  <p className="response-details-question-text">
                    {answer.question_text || <em>No question text</em>}
                  </p>
                  <div className="response-details-answer">
                    {isEditing ? enableEditMode(answer, index) : renderAnswer(answer)}
                  </div>
                </div>
              ))
            ) : (
              <p className="response-details-no-data">No answers provided.</p>
            )}

            {/* Edit/Update Button */}
            <div className="edit-button-container">
              <button
                onClick={isEditing ? handleUpdate : handleEditToggle}
                className="edit-button"
              >
                {isEditing ? "Update" : "Edit"}
              </button>
            </div>
          </div>
        )}

        {/* File Preview Modal */}
        {previewFile && (
          <div className="file-modal" role="dialog" aria-modal="true">
            <div className="file-modal-content">
              <FaTimes
                className="close-icon"
                onClick={() => setPreviewFile(null)}
                aria-label="Close file preview"
              />
              {/\.(jpeg|jpg|png|gif)$/i.test(previewFile) ? (
                <img
                  src={previewFile}
                  alt="Preview"
                  className="file-preview-image"
                />
              ) : (
                <iframe
                  src={previewFile}
                  title="File Preview"
                  className="file-preview-frame"
                ></iframe>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ResponseDetailsModal;
