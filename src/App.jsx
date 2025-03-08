import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import MyForms from "./pages/MyForms";
import Responses from "./pages/Responses";
import Notifications from "./pages/Notifications";
import CreateForm from "./pages/CreateForm";
import PreviewForm from "./pages/PreviewForm";
import EditForm from "./pages/EditForm";
import EditPreview from "./pages/EditPreview";
import HomeHeader from "./components/HomeHeader";
import EditHeader from "./components/EditHeader";
import Sidebar from "./components/Sidebar";
import { FormProvider } from "./components/FormContext";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute

function App() {
  const location = useLocation();
  const [forms, setForms] = useState([]); // Store created forms

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
          {["/myforms", "/responses", "/notifications"].includes(location.pathname) && <Sidebar />}

          <Routes>
            <Route path="/" element={<Home />} />

            {/* Protected Routes */}
            <Route
              path="/myforms"
              element={
                <ProtectedRoute>
                  <MyForms forms={forms} setForms={setForms} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/responses"
              element={
                <ProtectedRoute>
                  <Responses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-form"
              element={
                <ProtectedRoute>
                  <CreateForm onPublish={handlePublishForm} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-form/:id"
              element={
                <ProtectedRoute>
                  <EditForm forms={forms} setForms={setForms} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preview-form"
              element={
                <ProtectedRoute>
                  <PreviewForm forms={forms} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-preview/:formId"
              element={
                <ProtectedRoute>
                  <EditPreview />
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
