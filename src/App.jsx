import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MyForms from "./pages/MyForms";
import Responses from "./pages/Responses";
import Notifications from "./pages/Notifications";
import CreateForm from "./pages/CreateForm";
import EditForm from "./pages/EditForm";
import HomeHeader from "./components/HomeHeader";
import DashboardHeader from "./components/DashboardHeader";
import FormHeader from "./components/FormHeader";
import EditHeader from "./components/EditHeader"; 

function App() {
  const location = useLocation();
  const [forms, setForms] = useState([]); // Store created forms

  const handlePublishForm = (newForm) => {
    setForms((prevForms) => [...prevForms, newForm]);
  };

  return (
    <div>
      {location.pathname === "/" && <HomeHeader />}
      {location.pathname === "/dashboard" && <DashboardHeader />}
      {location.pathname === "/myforms" && <DashboardHeader />}
      {location.pathname === "/create-form" && <FormHeader />}
      {location.pathname.startsWith("/edit-form/") && <EditHeader />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myforms" element={<MyForms forms={forms} setForms={setForms} />} />
        <Route path="/responses" element={<Responses />} />
        <Route path="/edit-form/:id" element={<EditForm forms={forms} setForms={setForms} />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/create-form" element={<CreateForm onPublish={handlePublishForm} />} />
      </Routes>
    </div>
  );
}

export default App;
