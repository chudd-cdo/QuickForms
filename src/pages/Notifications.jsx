import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import { FaSearch } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import "../styles/Notifications.css";

const Notifications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "unread"

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get("/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response Data:", response.data);

        const formattedNotifications = response.data.map((notif) => ({
          id: notif.id,
          avatar: notif.avatar || "/default-avatar.png",
          userName: notif.userName || "Unknown",
          message: notif.message || "New notification",
          time: notif.time ? new Date(notif.time).toLocaleString() : "N/A",
          isRead: notif.isRead || false, // Assuming API returns isRead status
        }));

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((notif) =>
        notif.userName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((notif) => (activeTab === "unread" ? !notif.isRead : true));
  }, [notifications, searchQuery, activeTab]);

  return (
    <div className="notifications-container">
      <Sidebar />
      <div className="notifications-main-content">
        <DashboardHeader />
        <div className="notifications-content-wrapper">
          <div className="notifications-header">
            <h1>Notifications</h1>
          </div>

          {/* Search Bar - Placed ABOVE Tabs */}
          <div className="notifications-search-bar-container">
            <div className="notifications-search-bar">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="notifications-search-icon" />
            </div>
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
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.isRead ? "read" : "unread"}`}
                >
                  <img
                    src={notif.avatar}
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

          <div className="see-previous-notifications">
            <a href="/previous-notifications">See Previous Notifications</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
