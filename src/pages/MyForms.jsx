import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "../styles/MyForms.css";
import { FaTrash, FaSearch, FaArchive, FaEdit } from "react-icons/fa";
import Sidebar from "../components/Sidebar";

axios.defaults.baseURL = "http://localhost:8000/api";

const MyForms = ({ forms, setForms }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [archivedView, setArchivedView] = useState(false);
  const [formId, setFormId] = useState(null);

  const token = localStorage.getItem("authToken");

useEffect(() => {
  if (!token) {
    console.error("No authentication token found");
    navigate("/");
  } else {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchForms();
  }
}, [token]);


  useEffect(() => {
    if (location.state?.updatedForm) {
      setForms((prevForms) =>
        prevForms.map((form) =>
          form.id === location.state.updatedForm.id ? location.state.updatedForm : form
        )
      );
    }
  }, [location.state, setForms]);

  const fetchForms = async () => {
    try {
      const response = await axios.get("/forms");
      setForms(response.data);
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchFormData = async () => {
    if (!formId) return;

    try {
      const response = await axios.get(`/forms/${formId}`);
      if (response.data) {
        const { name, description, is_active, questions } = response.data;
        setFormTitle(name || "Untitled Form");
        setFormDescription(description || "");
        setStatus(is_active ? "Activated" : "Deactivated");
        setQuestions(
          Array.isArray(questions)
            ? questions.map((q) => ({
                id: q.id,
                question_text: q.question_text || "Untitled Question",
                question_type: q.question_type ?? "short",
                options: parseOptions(q),
              }))
            : []
        );
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, [formId]);

  const handleApiError = (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized access. Redirecting to login...");
      navigate("/");
    } else {
      console.error("API error:", error);
    }
  };

  const parseOptions = (q) => {
    return ["multiple_choice", "dropdown", "checkbox"].includes(q.question_type)
      ? typeof q.options === "string"
        ? JSON.parse(q.options)
        : q.options || []
      : [];
  };

  const handleEdit = (id) => {
    navigate(`/edit-form/${id}`, { state: { formId: id } });
  };
  
  const handleCreateForm = () => {
    // Clear any stored form data
    localStorage.removeItem("formTitle");
    localStorage.removeItem("formDescription");
    localStorage.removeItem("questions");
  
    // Navigate to CreateForm page
    navigate("/create-form");
  };
  

  const handleDeleteForm = async (id) => {
    try {
      await axios.delete(`/forms/${id}`);
      setForms((prevForms) => prevForms.filter((form) => form.id !== id));
    } catch (error) {
      console.error("Error deleting form", error);
    }
  };

  const filteredForms = useMemo(
    () => forms.filter((form) => form.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [forms, searchQuery]
  );

  const columns = useMemo(
    () => [
      {
        header: "",
        accessorKey: "actions",
        cell: ({ row }) => (
          <div className="chudd-action-icons">
            {archivedView ? (
              <FaArchive className="chudd-archive-icon" />
            ) : (
              <FaEdit className="chudd-edit-icon" onClick={() => handleEdit(row.original.id)} />
            )}
            {!archivedView && (
              <FaTrash className="chudd-delete-icon" onClick={() => handleDeleteForm(row.original.id)} />
            )}
          </div>
        ),
      },
      { header: "Name", accessorKey: "name" },
      { header: "Date Created", accessorKey: "created_at", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      { header: "Date Modified", accessorKey: "updated_at", cell: ({ getValue }) => new Date(getValue()).toLocaleString() },
      { header: "Status", accessorKey: "is_active", cell: ({ getValue }) => <span className={getValue() ? "chudd-status-active" : "chudd-status-deactivated"}>{getValue() ? "Activated" : "Deactivated"}</span> },
      { header: "Responses", accessorKey: "user_id", cell: ({ getValue }) => getValue() || "0" },
    ],
    [archivedView]
  );

  const table = useReactTable({
    data: filteredForms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="chudd-myforms-container">
      <Sidebar />
      <div className="chudd-main-content">
        <div className="chudd-top-bar">
          <h1>My Forms</h1>
        </div>

        <div className="chudd-search-actions-container">
          <div className="chudd-search-bar">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="chudd-search-icon" />
          </div>
          <button className="chudd-create-form" onClick={handleCreateForm}>+ Create new form</button>
        </div>

        <table className="chudd-myforms-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyForms;