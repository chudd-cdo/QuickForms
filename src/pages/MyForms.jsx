import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "../styles/MyForms.css";
import {
  FaRegFileAlt, FaTrash, FaSearch, FaHome, FaWpforms, 
  FaSignOutAlt, FaArchive, FaEdit, FaBell, FaCogs
} from "react-icons/fa";

axios.defaults.baseURL = "http://localhost:8000/api";

const MyForms = ({ forms, setForms }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [archivedView, setArchivedView] = useState(false);
  const [formId, setFormId] = useState(null);
  const [status, setStatus] = useState("Deactivated");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchForms();
  }, []);

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
      const response = await api.get("/forms"); // No need to repeat baseURL
      setForms(response.data);
    } catch (error) {
      console.error("Error fetching forms", error);
    }
  };

  useEffect(() => {
    const id = location.state?.formId; // Get formId from location state

    if (!formId) return;

    const fetchFormData = async () => {
      try {
        const response = await axios.get(`/forms/${formId}`);
        if (!response.data) {
          console.error("No data received from API");
          return;
        }

        const { name, description, is_active, questions } = response.data;

        setFormTitle(name || "Untitled Form");
        setFormDescription(description || "");
        setStatus(is_active ? "Activated" : "Deactivated");
        setQuestions(Array.isArray(questions) ? questions : []);
      } catch (error) {
        console.error("Error fetching form data:", error);
        setFormTitle("Error Loading Form");
      }
    };

    fetchFormData();
  }, [formId, location.key]);

  const handleEdit = (id) => {
    navigate(`/edit-form/${id}`, { state: { formId: id } });
  };
  

  const handleCreateForm = () => {
    localStorage.removeItem("formTitle");
    localStorage.removeItem("formDescription");
    localStorage.removeItem("questions");
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

  const handleUpdate = async () => {
    if (!formTitle.trim()) {
      alert("Please enter a form title before updating.");
      return;
    }

    const updatedForm = {
      id: formId,
      name: formTitle,
      description: formDescription,
      is_active: status === "Activated",
      questions,
    };

    try {
      await axios.put(`/forms/${formId}`, updatedForm);
      navigate("/myforms", { state: { updatedForm } });
    } catch (error) {
      console.error("Error saving form:", error);
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
      { 
        header: "Name", 
        accessorKey: "name",
        cell: ({ getValue }) => {
          const name = getValue();
          return name.length > 10 ? name.substring(0, 10) + "..." : name;
        }
      },
      { 
        header: "Date Created",
        accessorKey: "created_at",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      },
      { 
        header: "Date Modified",
        accessorKey: "updated_at",
        cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
      },
      { 
        header: "Status",
        accessorKey: "is_active",
        cell: ({ getValue }) => (
          <span className={getValue() ? "chudd-status-active" : "chudd-status-deactivated"}>
            {getValue() ? "Activated" : "Deactivated"}
          </span>
        ),
      },
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
      <div className="chudd-sidebar">
        <div className="chudd-menu-item" onClick={() => navigate("/dashboard")}>
          <FaHome className="icon" />
          <span>Dashboard</span>
        </div>
        <div className="chudd-menu-item" onClick={() => navigate("/myforms")}>
          <FaWpforms className="icon" />
          <span>My Forms</span>
        </div>
        <div className="chudd-menu-item" onClick={() => navigate("/responses")}>
          <FaRegFileAlt className="icon" />
          <span>Responses</span>
        </div>
        <div className="chudd-menu-item" onClick={() => navigate("/notifications")}>
          <FaBell className="icon" />
          <span>Notifications</span>
        </div>
        <div className="chudd-menu-item">
          <FaCogs className="icon" />
          <span>Settings</span>
        </div>
        <div className="chudd-menu-item">
          <FaSignOutAlt className="icon" />
          <span>Logout</span>
        </div>
      </div>

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
          <div className="chudd-actions">
            <FaArchive className="chudd-archive-icon" onClick={() => setArchivedView(!archivedView)} />
            <button className="chudd-create-form" onClick={handleCreateForm}>
              + Create new form
            </button>
          </div>
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

        <div className="chudd-pagination">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{"<"}</button>
          {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              className={`chudd-page-number ${table.getState().pagination.pageIndex + 1 === pageNumber ? "active" : ""}`}
              onClick={() => table.setPageIndex(pageNumber - 1)}
            >
              {pageNumber}
            </button>
          ))}
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{">"}</button>
        </div>
      </div>

     
    </div>
  );
};

export default MyForms;
