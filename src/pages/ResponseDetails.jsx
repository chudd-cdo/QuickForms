import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaUserCircle, FaFileAlt, FaTimes, FaDownload } from "react-icons/fa";
import api from "../api";
import "../styles/ResponseDetails.css";
import logo from "../assets/logo.jpg";
import logo1 from "../assets/logo1.png";

const ResponseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);

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

  

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(`/responses/${responseData.id}/download-pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", 
      });
  
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Response_${responseData.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
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
          <FaArrowLeft
            className="response-details-back-icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          />
          <h2 className="response-details-title">Response Details</h2>
        </div>

        <div className="response-details-header-right">
          <div className="response-details-user-info">
            <span className="response-details-user-name">{responseData.userName}</span>
            <FaUserCircle className="response-details-avatar" />
            <FaDownload
              className="download-icon"
              onClick={handleDownloadPDF}
              title="Download as PDF"
              style={{ cursor: "pointer", marginLeft: "1rem" }}
            />
          </div>
        </div>
      </header>

      <div id="pdf-content">
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
        <p className="form-title">{responseData.formName}</p>
        <p className="form-description">{responseData.formDescription}</p>
        <p className="submission-time">
          Submitted: {new Date(responseData.submission_time).toLocaleString()}
        </p>
      </div>
    </div>

    {responseData.answers.length > 0 ? (
      responseData.answers.map((answer, index) => (
        <div key={index} className="response-details-question">
          <p className="response-details-question-text">
            {answer.question_text || <em>No question text</em>}
          </p>
          <div className="response-details-answer">{renderAnswer(answer)}</div>
        </div>
      ))
    ) : (
      <p className="response-details-no-data">No answers provided.</p>
    )}
     <div className="response-details-footer" style={{ marginTop: "30px" }}>
    <p>GF Floor, South Wing, Administrative and Legislative Building</p>
    <p>City Hall Compound, Capistrano-Hayes Street</p>
    <p>Cagayan de Oro City, Philippines</p>
    <p>www.cagayandeoro.gov.ph</p>
    <p>Telephone Number: +63 88 880 9698, Email: chudd.cdeo@gmail.com</p>
  </div>
  </div>

</div>


      

      {previewFile && (
        <div className="file-modal" role="dialog" aria-modal="true">
          <div className="file-modal-content">
            <FaTimes
              className="close-icon"
              onClick={() => setPreviewFile(null)}
              aria-label="Close file preview"
            />
            {/\.(jpeg|jpg|png|gif)$/i.test(previewFile) ? (
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
