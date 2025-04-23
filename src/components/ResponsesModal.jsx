import React, { useEffect, useState } from "react"; 
import Modal from "react-modal";
import { FaFileAlt, FaTimes } from "react-icons/fa";
import api from "../api";
import "../styles/ResponsesModal.css";
import Papa from "papaparse";
import Select from "react-select";

Modal.setAppElement("#root");

const ResponsesModal = ({ isOpen, onClose, formId, formTitle }) => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false); // 👈 added

  useEffect(() => {
    if (isOpen && formId) {
      fetchResponses();
    }
  }, [isOpen, formId]);

  const fetchResponses = async () => {
    try {
      setLoading(true); // 👈 start loading
      const res = await api.get(`/forms/${formId}/response`);
      const data = res.data || {};
      setQuestions(data.questions || []);
      setResponses(data.responses || []);
    } catch (error) {
      console.error("Error fetching responses:", error.response?.data || error.message);
    } finally {
      setLoading(false); // 👈 stop loading
    }
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

  const nameSet = new Set();
  responses.forEach((res) => {
    const name = res.userName;
    if (name) nameSet.add(name);
  });

  const tagOptions = Array.from(nameSet).map((name) => ({
    value: name,
    label: name,
  }));

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
        <div className="spinner-container">
          <div className="chudd-spinner"></div>
        </div>
      ) : (
        <>
          <div className="responses-controls">
            <Select
              isMulti
              options={tagOptions}
              className="multi-select-dropdown"
              classNamePrefix="select"
              placeholder="Filter by username..."
              value={selectedTags}
              onChange={setSelectedTags}
            />
            <button className="export-btn" onClick={exportCSV}>Export CSV</button>
          </div>

          <div className="responses-table-container">
            {filteredResponses.length === 0 ? (
              <p>No responses found.</p>
            ) : (
              <table className="responses-table">
                <thead>
                  <tr>
                    {columns.map((q, i) => (
                      <th key={q.id || i}>{q.question_text}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((response, index) => (
                    <tr key={index}>
                      {columns.map((q, i) => (
                        <td key={q.id || i}>
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
    </Modal>
  );
};

export default ResponsesModal;
