import React, { useState, useEffect, useMemo } from "react";
import api from "../api"; // ✅ Use the axios instance with auth
import "../styles/AssignUserModal.css";
import axios from "axios";

const AssignUserModal = ({ isOpen, onClose, formId }) => {
    if (!isOpen) return null; // Prevents rendering when modal is closed

    const [users, setUsers] = useState([]); // All users
    const [assignedUsers, setAssignedUsers] = useState([]); // Assigned users
    const [search, setSearch] = useState(""); // Search input

    useEffect(() => {
        if (!isOpen || !formId) return; // Prevent unnecessary API calls

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchData = async () => {
            try {
                const [usersResponse, assignedResponse] = await Promise.all([
                    api.get("/users", { signal }), // ✅ Use api instance
                    api.get(`/assigned-users/${formId}`, { signal }) // ✅ Use api instance
                ]);

                setUsers(usersResponse.data);
                setAssignedUsers(assignedResponse.data.map(item => ({
                    user_id: item.user.id,
                    name: item.user.name,
                    email: item.user.email
                })));
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.error("❌ Error fetching users:", error.response?.data || error.message);
                }
            }
        };

        fetchData();

        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);

        return () => {
            controller.abort(); // ✅ Cancels pending API requests
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, formId, onClose]);

    // Memoized filtered users list
    const filteredUsers = useMemo(() =>
        users.filter(user =>
            !assignedUsers.some(assigned => assigned.user_id === user.id) &&
            (user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()))
        ), [users, assignedUsers, search]);

    // Assign user
    const assignUser = (user) => {
        api.post("/assign-user", { user_id: user.id, form_id: formId }) // ✅ Correct API endpoint
            .then(() => {
                setAssignedUsers(prev => [...prev, { user_id: user.id, name: user.name, email: user.email }]);
            })
            .catch(error => console.error("Error assigning user:", error.response?.data || error.message));
    };

    // Unassign user
    const unassignUser = (userId) => {
        api.delete("/unassign-user", { // ✅ Correct API endpoint
            data: { user_id: userId, form_id: formId }
        })
        .then(() => {
            setAssignedUsers(prev => prev.filter(user => user.user_id !== userId));
        })
        .catch(error => console.error("Error unassigning user:", error.response?.data || error.message));
    };

    // Close modal when clicking outside
    const handleOverlayClick = (e) => {
        if (e.target.id === "modal-overlay") {
            onClose();
        }
    };

    return (
        <div id="modal-overlay" className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Assign Users</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Search Bar & Assigned User Tags */}
                <div className="search-container">
                    {assignedUsers.map(user => (
                        <div key={user.user_id} className="user-tag">
                            {user.name}
                            <button className="remove-tag-btn" onClick={() => unassignUser(user.user_id)}>×</button>
                        </div>
                    ))}
                    <input
                        type="text"
                        placeholder="Search Users"
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* User List */}
                <div className="user-list">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="user-item">
                            <div className="user-info">
                                <img src="/user-avatar.png" alt="User" className="user-avatar" />
                                <div>
                                    <p className="user-name">{user.name}</p>
                                    <p className="user-email">{user.email}</p>
                                </div>
                            </div>
                            <button className="assign-btn" onClick={() => assignUser(user)}>
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssignUserModal;
