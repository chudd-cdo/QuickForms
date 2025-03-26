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
  import DashboardHeader from "../components/DashboardHeader";
  import LocalStorage from "../components/localStorage"; // ✅ Token handling utility
  import api from "../api";
  



  const MyForms = ({ forms, setForms }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [archivedView, setArchivedView] = useState(false);
    const token = LocalStorage.getToken(); // ✅ Secure token retrieval

    useEffect(() => {
      console.log("Token:", token); // ✅ Debugging

      if (!token) {
        console.error("No authentication token found");
        navigate("/"); // Redirect to login if no token
      } else {
        fetchUserForms(); // ✅ Fetch only user's forms
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

    const fetchUserForms = async () => {
      try {
        setForms([]); // ✅ Clear old forms immediately to prevent flickering

        await api.get("/sanctum/csrf-cookie");
        const response = await api.get("/my-forms", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("User Forms Response:", response.data);

        const sortedForms = response.data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setForms(sortedForms); // ✅ Set new sorted forms
      } catch (error) {
        console.error("API error:", error.response?.data || error.message);
        handleApiError(error);
      }
    };

    const handleApiError = (error) => {
      if (error.response?.status === 401) {
        console.error("Unauthorized access. Redirecting to login...");
        LocalStorage.clearAll(); // ✅ Ensure old user data is cleared
        navigate("/");
      } else {
        console.error("API error:", error);
      }
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
        await api.delete(`/forms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        setForms((prevForms) => prevForms.filter((form) => form.id !== id));
      } catch (error) {
        console.error("Error deleting form", error.response?.data || error.message);
        handleApiError(error);
      }
    };
    

    const filteredForms = useMemo(() => {
      return forms
        .filter((form) =>
          form.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // ✅ Sort by latest modified
    }, [forms, searchQuery]);

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

    const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;
  const pageGroupSize = 5;

  // Calculate start and end of the visible page group
  const startPage = Math.floor(currentPage / pageGroupSize) * pageGroupSize;
  const endPage = Math.min(startPage + pageGroupSize, pageCount);

  
    return (
      <div className="chudd-header">
        <DashboardHeader />
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
              
              {/* Archive Button + Create Form Button */}
              <div className="chudd-actions">
                <button className="chudd-archive-button">
                  <FaArchive />
                </button>
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
  <button 
    onClick={() => table.firstPage()} 
    disabled={!table.getCanPreviousPage()}
  >
    {"<<"}
  </button>
  
  <button 
    onClick={() => table.previousPage()} 
    disabled={!table.getCanPreviousPage()}
  >
    {"<"}
  </button>

  {/* Page Number Buttons */}
  {Array.from({ length: table.getPageCount() }, (_, index) => (
    <button
      key={index}
      onClick={() => table.setPageIndex(index)}
      className={`chudd-page-number ${
        table.getState().pagination.pageIndex === index ? "active" : "" 
      } ${!table.getCanNextPage() && !table.getCanPreviousPage() ? "disabled" : ""}`}
    >
      {index + 1}
    </button>
  ))}

  <button 
    onClick={() => table.nextPage()} 
    disabled={!table.getCanNextPage()}
  >
    {">"}
  </button>

  <button 
    onClick={() => table.lastPage()} 
    disabled={!table.getCanNextPage()}
  >
    {">>"}
  </button>
</div>

          </div>
        </div>
      </div>
    );
  };

  export default MyForms;
