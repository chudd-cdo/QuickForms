import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles/MyFormModal.css';
import LocalStorage from "../components/localStorage";
import api from "../api"; // Import the API instance

const MyFormModal = ({ isOpen, onClose, users, forms, onSubmit }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);

  useEffect(() => {
    // Reset selections if modal is closed
    if (!isOpen) {
      setSelectedUsers([]);
      setSelectedForms([]);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const user_ids = selectedUsers.map(user => user.value);
    const form_ids = selectedForms.map(form => form.value);

    try {
      // Make the POST request to assign users and forms
      const response = await api.post('/assignments/bulk', {
        user_ids,
        form_ids
      });

      console.log('Assigned successfully:', response.data);
      onClose();  // Close the modal after success
    } catch (err) {
      console.error('Assignment error:', err.response ? err.response.data : err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose}>X</button>
        <h2>Select Users and Forms</h2>

        <div className="modal-select-container">
          <Select
            isMulti
            options={users}
            value={selectedUsers}
            onChange={setSelectedUsers}
            placeholder="Select Users"
            className="modal-select"
          />

          <Select
            isMulti
            options={forms}
            value={selectedForms}
            onChange={setSelectedForms}
            placeholder="Select Forms"
            className="modal-select"
          />
        </div>

        <button className="modal-submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default MyFormModal;
