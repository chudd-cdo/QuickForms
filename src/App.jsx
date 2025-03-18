import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Home from "./pages/Home";
import MyForms from "./pages/MyForms";
import Responses from "./pages/Responses";
import Notifications from "./pages/Notifications";
import CreateForm from "./pages/CreateForm";
import PreviewForm from "./pages/PreviewForm";
import EditForm from "./pages/EditForm";
import EditPreview from "./pages/EditPreview";
import ProfilePage from "./pages/ProfilePage"; // ✅ Import ProfilePage
import HomeHeader from "./components/HomeHeader";
import EditHeader from "./components/EditHeader";
import Sidebar from "./components/Sidebar";
import { FormProvider } from "./components/FormContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LocalStorage from "./components/localStorage"; // Utility to manage local storage

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]); // Store created forms
  const [authToken, setAuthToken] = useState(LocalStorage.getToken());

  useEffect(() => {
    // Auto-login if token exists in local storage
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    }
  }, [authToken]);

  const handlePublishForm = (newForm) => {
    setForms((prevForms) => [...prevForms, newForm]);
  };

  return (
    <FormProvider>
      <div>
        {location.pathname === "/" && <HomeHeader />}
        {location.pathname === "/myforms" && <HomeHeader />}
        {location.pathname.startsWith("/edit-form/") && <EditHeader />}

        <div className="main-layout">
          {/* Show Sidebar only for relevant pages */}
          {["/myforms", "/responses", "/notifications", "/profile"].includes(location.pathname) && <Sidebar />}

          <Routes>
            <Route path="/" element={<Home />} />

            {/* Protected Routes */}
            <Route
              path="/myforms"
              element={
                <ProtectedRoute authToken={authToken}>
                  <MyForms forms={forms} setForms={setForms} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/responses"
              element={
                <ProtectedRoute authToken={authToken}>
                  <Responses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute authToken={authToken}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-form"
              element={
                <ProtectedRoute authToken={authToken}>
                  <CreateForm onPublish={handlePublishForm} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-form/:id"
              element={
                <ProtectedRoute authToken={authToken}>
                  <EditForm forms={forms} setForms={setForms} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preview-form"
              element={
                <ProtectedRoute authToken={authToken}>
                  <PreviewForm forms={forms} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-preview/:formId"
              element={
                <ProtectedRoute authToken={authToken}>
                  <EditPreview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute authToken={authToken}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </FormProvider>
  );
}

export default App;
