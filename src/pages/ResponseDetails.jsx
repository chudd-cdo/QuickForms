import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaUserCircle, FaFileAlt, FaTimes } from "react-icons/fa";
import api from "../api";
import "../styles/ResponseDetails.css";

const ResponseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null); // State to track the file preview

  useEffect(() => {
    if (!id || id === "null") {
      console.error("Invalid response ID:", id);
      setLoading(false);
      return;
    }

    const fetchResponseDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(`/responses/details/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched Response Data:", response.data);

        setResponseData({
          id: response.data.response_id,
          formName: response.data.formName,
          formDescription: response.data.formDescription || "No description provided.",
          submission_time: response.data.submission_time,
          userName: response.data.userName || "Anonymous",
          answers: response.data.answers || [],
        });
      } catch (error) {
        console.error("Error fetching response details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponseDetails();
  }, [id]);

  if (loading) {
    return <p className="loading-message">Loading response details...</p>;
  }

  if (!responseData) {
    return <p className="error-message">No data found for this response.</p>;
  }

  return (
    <div className="response-details-wrapper">
      <header className="response-details-header">
        <div className="response-details-header-left">
          <FaArrowLeft className="response-details-back-icon" onClick={() => navigate(-1)} />
          <h2 className="response-details-title">Response Details</h2>
        </div>

        <div className="response-details-header-right">
          <div className="response-details-user-info">
            <span className="response-details-user-name">{responseData.userName}</span>
            <FaUserCircle className="response-details-avatar" />
          </div>
        </div>
      </header>

      <div className="response-details-content">
        <h1 className="response-details-form-title">{responseData.formName}</h1>
        <p className="response-details-form-description">{responseData.formDescription}</p>
        <p className="response-details-submission-time">
          Submitted: {new Date(responseData.submission_time).toLocaleString()}
        </p>

        {responseData.answers.length > 0 ? (
          responseData.answers.map((answer, index) => (
            <div key={index} className="response-details-question">
              <p className="response-details-question-text">{answer.question_text}</p>
              <div className="response-details-answer">
                {answer.file ? (
                  <div className="file-preview">
                    <FaFileAlt className="file-icon" />
                    <button
                      className="file-button"
                      onClick={() => setPreviewFile(answer.file)}
                    >
                      {answer.file.split("/").pop()} {/* Display only filename */}
                    </button>
                  </div>
                ) : answer.response ? (
                  <p className="response-details-answer-text">
                    {Array.isArray(answer.response) ? answer.response.join(", ") : String(answer.response)}
                  </p>
                ) : (
                  <p className="response-details-no-answer">No answer provided</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="response-details-no-data">No answers provided.</p>
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="file-modal">
          <div className="file-modal-content">
            <FaTimes className="close-icon" onClick={() => setPreviewFile(null)} />
            {previewFile.match(/\.(jpeg|jpg|png|gif)$/) ? (
              <img src={previewFile} alt="Preview" className="file-preview-image" />
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
  );
};

export default ResponseDetails;
