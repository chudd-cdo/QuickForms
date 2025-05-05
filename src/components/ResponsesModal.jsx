import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaFileAlt, FaTimes } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io"; // Refresh Icon
import { GrDocumentCsv } from "react-icons/gr"; // CSV Icon
import { FaTrash } from "react-icons/fa"; // Delete Icon
import api from "../api";
import "../styles/ResponsesModal.css";
import Papa from "papaparse";
import Select from "react-select";
import ResponseDetailsModal from "./ResponseDetailsModal"; // Import the new modal

Modal.setAppElement("#root");

const ResponsesModal = ({ isOpen, onClose, formId, formTitle }) => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null); // Track selected response
  const [isResponseDetailsModalOpen, setIsResponseDetailsModalOpen] = useState(false); // Track modal state
  const [isDeleteMode, setIsDeleteMode] = useState(false); // Toggle delete mode
  const [selectedRows, setSelectedRows] = useState([]); // Track selected rows
  
  useEffect(() => {
    if (isOpen && formId) {
      fetchResponses();
    }
  }, [isOpen, formId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/forms/${formId}/response`);
      const data = res.data || {};
      setQuestions(data.questions || []);
      setResponses(data.responses || []);
    } catch (error) {
      console.error("Error fetching responses:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (response) => {
    setSelectedResponse(response); // Set the selected response
    setIsResponseDetailsModalOpen(true); // Open the modal
  };

  const closeResponseDetailsModal = () => {
    setSelectedResponse(null); // Clear the selected response
    setIsResponseDetailsModalOpen(false); // Close the modal
  };

  const columns = [
    { id: "userName", question_text: "Username" },
    ...questions,
    { id: "submission_time", question_text: "Submitted At (PH)" }
  ];

  const renderCell = (response, key) => {
    if (key === "userName") return response.userName || "Anonymous";
    const value = response.answers?.[key];
    if (!value || value === "-") return "-";

    if (typeof value === "string" && value.startsWith("http")) {
      const fileName = value.split("/").pop();
      const isImage = /\.(jpeg|jpg|png|gif)$/i.test(value);
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="file-link-button"
          onClick={(e) => {
            e.preventDefault();
            if (isImage) setPreviewFile(value);
            else window.open(value, "_blank");
          }}
        >
          <FaFileAlt style={{ marginRight: "5px" }} />
          {fileName}
        </a>
      );
    }

    return Array.isArray(value) ? value.join(", ") : value;
  };

  const filteredResponses = responses.filter((response) => {
    const responseName = response.userName?.toLowerCase();
    return (
      selectedTags.length === 0 ||
      selectedTags.some((tag) => responseName === tag.value.toLowerCase())
    );
  });

  const exportCSV = () => {
    const exportData = filteredResponses.map((response) => {
      const row = {};
      columns.forEach((q) => {
        if (q.id === "submission_time") {
          row[q.question_text] = new Date(response.submission_time).toLocaleString();
        } else if (q.id === "userName") {
          row[q.question_text] = response.userName || "Anonymous";
        } else {
          const value = response.answers?.[q.id];
          row[q.question_text] = Array.isArray(value) ? value.join(", ") : value || "-";
        }
      });
      return row;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "filtered_responses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSelected = async () => {
    if (window.confirm("Are you sure you want to delete the selected responses?")) {
      try {
        await api.post(`/responses/delete`, { ids: selectedRows }); // Send selected IDs to the backend
        setResponses((prev) => prev.filter((res) => !selectedRows.includes(res.id))); // Remove deleted rows from state
        setSelectedRows([]); // Clear selected rows
        setIsDeleteMode(false); // Exit delete mode
        alert("Selected responses deleted successfully!");
      } catch (error) {
        console.error("Error deleting responses:", error);
        alert("Failed to delete responses. Please try again.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Form Responses"
      className="responses-modal"
      overlayClassName="responses-modal-overlay"
    >
      <div className="responses-modal-header">
        <h2>{formTitle} - Responses</h2>
        <button onClick={onClose} className="responses-close-button">Close</button>
      </div>

      {loading ? (
        <div className="res-spinner-container">
          <div className="res-chudd-spinner"></div>
        </div>
      ) : (
        <>
          <div className="responses-controls">
            <Select
              isMulti
              options={Array.from(new Set(responses.map((res) => res.userName))).map((name) => ({
                value: name,
                label: name,
              }))}
              className="multi-select-dropdown"
              classNamePrefix="select"
              placeholder="Filter by username..."
              value={selectedTags}
              onChange={setSelectedTags}
            />
            <div className="icon-buttons-container">
              <button className="icon-btn" onClick={fetchResponses} title="Refresh">
                <IoMdRefresh /> {/* Refresh Icon */}
              </button>
              <button className="icon-btn" onClick={exportCSV} title="Export CSV">
                <GrDocumentCsv /> {/* Export CSV Icon */}
              </button>
              <button
  className={`icon-btn ${isDeleteMode ? "trash-active" : "trash-inactive"}`}
  onClick={() => setIsDeleteMode(!isDeleteMode)} // Toggle delete mode
  title="Delete"
>
  <FaTrash />
</button>
            </div>
          </div>

          {isDeleteMode && selectedRows.length > 0 && (
            <button
              className="delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              Delete Selected
            </button>
          )}

          <div className="responses-table-container">
            {filteredResponses.length === 0 ? (
              <p>No responses found.</p>
            ) : (
              <table className="responses-table">
                <thead>
                  <tr>
                    {isDeleteMode && <th>Select</th>}
                    {columns.map((q, i) => (
                      <th key={q.id || i}>{q.question_text}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((response, index) => (
                    <tr
                      key={index}
                      style={{ cursor: isDeleteMode ? "default" : "pointer" }}
                      onClick={() => {
                        if (!isDeleteMode) handleRowClick(response); // Only trigger row click if not in delete mode
                      }}
                    >
                      {isDeleteMode && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(response.id)}
                            onChange={(e) => {
                              e.stopPropagation(); // Prevent row click when checkbox is clicked
                              if (e.target.checked) {
                                setSelectedRows((prev) => [...prev, response.id]);
                              } else {
                                setSelectedRows((prev) => prev.filter((id) => id !== response.id));
                              }
                            }}
                          />
                        </td>
                      )}
                      {columns.map((q, i) => (
                        <td
                          key={q.id || i}
                          onClick={(e) => {
                            const value = response.answers?.[q.id];
                            if (typeof value === "string" && value.startsWith("http")) {
                              e.stopPropagation(); // Prevent row click for file/URL columns
                            }
                          }}
                        >
                          {q.id === "submission_time"
                            ? new Date(response.submission_time).toLocaleString()
                            : renderCell(response, q.id)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

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

      {/* Render ResponseDetailsModal */}
      <ResponseDetailsModal
  isOpen={isResponseDetailsModalOpen}
  onClose={closeResponseDetailsModal}
  responseId={selectedResponse?.id}
/>

    </Modal>
  );
};

export default ResponsesModal;
