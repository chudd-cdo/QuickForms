import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Home from "./pages/Home";
import MyForms from "./pages/MyForms";
import Responses from "./pages/Responses";
import ResponseDetails from "./pages/ResponseDetails";
import Notifications from "./pages/Notifications";
import CreateForm from "./pages/CreateForm";
import PreviewForm from "./pages/PreviewForm";
import EditForm from "./pages/EditForm";
import EditPreview from "./pages/EditPreview";
import ProfilePage from "./pages/ProfilePage";
import HomeHeader from "./components/HomeHeader";
import EditHeader from "./components/EditHeader";
import Sidebar from "./components/Sidebar";
import { FormProvider } from "./components/FormContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LocalStorage from "./components/LocalStorage";
import FormResponses from "./pages/FormResponses";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [authToken, setAuthToken] = useState(LocalStorage.getToken());

  useEffect(() => {
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
          {["/myforms", "/responses", "/notifications", "/profile", "/form-responses"].includes(location.pathname) && <Sidebar />}

          <Routes>
            <Route path="/" element={<Home />} />
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
              path="/response-details/:id"
              element={
                <ProtectedRoute authToken={authToken}>
                  <ResponseDetails />
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
            <Route
              path="/form-responses"
              element={
                <ProtectedRoute authToken={authToken}>
                  <FormResponses forms={forms} setForms={setForms} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </FormProvider>
  );
}

// Wrap the App component with BrowserRouter and set the basename
export default function Root() {
  return (
    <BrowserRouter basename="/chuddforms">
      <App />
    </BrowserRouter>
  );
}
