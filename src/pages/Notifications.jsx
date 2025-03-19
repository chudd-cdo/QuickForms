import React, { useState, useEffect } from "react";
import api from "../api"; // Ensure this is configured for API requests
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import "../styles/Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found.");
          return;
        }
    
        const response = await api.get("/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        console.log("Fetched Notifications:", response.data);
    
        if (!response.data.notifications || !Array.isArray(response.data.notifications)) {
          throw new Error("Invalid response format");
        }
    
        // Check for missing values
        const formattedNotifications = response.data.notifications.map((notif) => ({
          id: notif.id,
          avatar: notif.avatar || "/default-avatar.png",
          userName: notif.userName || "Unknown",
          message: notif.message || "No message provided",
          time: notif.time ? new Date(notif.time).toLocaleString() : "Unknown time",
          isRead: Boolean(notif.isRead),
        }));
    
        console.log("Formatted Notifications:", formattedNotifications);
    
        setNotifications(formattedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const filteredNotifications = notifications.filter((notif) =>
    activeTab === "unread" ? !notif.isRead : true
  );

  return (
    <div className="notifications-container">
      <Sidebar />
      <div className="notifications-main-content">
        <DashboardHeader />
        <div className="notifications-content-wrapper">
          <div className="notifications-header">
            <h1>Notifications</h1>
            <button onClick={markAllAsRead} className="mark-all-read">
              Mark All as Read
            </button>
          </div>

          {/* Tabs for All and Unread Notifications */}
          <div className="notifications-tabs">
            <button
              className={`notifications-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={`notifications-tab ${activeTab === "unread" ? "active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              Unread
            </button>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {loading ? (
              <p>Loading notifications...</p>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.isRead ? "read" : "unread"}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <img
                    src={notif.avatar || "/default-avatar.png"}
                    alt="User Avatar"
                    className="notification-avatar"
                  />
                  <div className="notification-details">
                    <span className="notification-user">{notif.userName}</span>
                    <span className="notification-message">{notif.message}</span>
                  </div>
                  <span className="notification-time">{notif.time}</span>
                </div>
              ))
            ) : (
              <p className="no-notifications">No notifications found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
