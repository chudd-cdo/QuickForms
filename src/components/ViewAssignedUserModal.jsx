import React, { useEffect, useState } from "react";
import "../styles/ViewAssignedUserModal.css";
import api from "../api";

const ViewAssignedUserModal = ({ isOpen, onClose, formId, formTitle }) => {
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(false); // 👈 Add loading state

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        setLoading(true); // 👈 Start loading
        const response = await api.get(`/assigned-users/view/${formId}`);
        setAssignedUsers(response.data);
      } catch (error) {
        console.error("Error fetching assigned users", error);
      } finally {
        setLoading(false); // 👈 Stop loading
      }
    };

    if (isOpen) {
      fetchAssignedUsers();
    }
  }, [formId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{formTitle} - Assigned Users</h2>

        {loading ? (
          <div className="view-spinner-container">
            <div className="view-chudd-spinner"></div>
          </div>
        ) : (
          <>
            <ul>
              {assignedUsers.length > 0 ? (
                assignedUsers.map((user, idx) => (
                  <li key={idx}>
                    <strong>{user.user?.name || "Unnamed User"}</strong>
                    {user.title ? ` - ${user.title}` : ""}
                  </li>
                ))
              ) : (
                <p>No users assigned.</p>
              )}
            </ul>
            <button onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewAssignedUserModal;
