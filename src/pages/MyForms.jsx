import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "../styles/MyForms.css";
import {
  FaRegFileAlt,
  FaTrash,
  FaSearch,
  FaHome,
  FaWpforms,
  FaSignOutAlt,
  FaArchive,
  FaEdit,
  FaBell,
  FaCogs,
} from "react-icons/fa";

axios.defaults.baseURL = "http://localhost:8000/api";

const MyForms = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [archivedView, setArchivedView] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get("/forms");
      setForms(response.data);
    } catch (error) {
      console.error("Error fetching forms", error);
    }
  };

  const handleCreateForm = () => {
    if (!formTitle.trim()) {
      alert("Please enter a form title.");
      return;
    }

    navigate("/create-form", { state: { formTitle, formDescription } });

    setShowModal(false);
    setFormTitle("");
    setFormDescription("");
  };

  const handleDeleteForm = async (id) => {
    try {
      await axios.delete(`/forms/${id}`);
      setForms(forms.filter((form) => form.id !== id));
    } catch (error) {
      console.error("Error deleting form", error);
    }
  };

  const handleArchiveToggle = () => {
    setArchivedView(!archivedView);
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
              <FaEdit
                className="chudd-edit-icon"
                onClick={() => navigate(`/edit-form/:id${row.original.id}`)}
              />
            )}
            {!archivedView && (
              <FaTrash
                className="chudd-delete-icon"
                onClick={() => handleDeleteForm(row.original.id)}
              />
            )}
          </div>
        ),
      },
      {
        header: "Name",
        accessorKey: "name",
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
      {
        header: "Responses",
        accessorKey: "user_id",
        cell: ({ getValue }) => getValue() || "0",
      },
    ],
    [archivedView, navigate]
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
            <FaArchive className="chudd-archive-icon" onClick={handleArchiveToggle} />
            <button className="chudd-create-form" onClick={() => setShowModal(true)}>
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

        {/* Pagination Controls placed under the table */}
        <div className="chudd-pagination">
  <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
    {"<"}
  </button>

  {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => i + 1).map((pageNumber) => (
    <button
      key={pageNumber}
      className={`chudd-page-number ${
        table.getState().pagination.pageIndex + 1 === pageNumber ? "active" : ""
      }`}
      onClick={() => table.setPageIndex(pageNumber - 1)}
    >
      {pageNumber}
    </button>
  ))}

  <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
    {">"}
  </button>
</div>

      </div>

      {showModal && (
              <div className="chudd-modal-overlay">
                <div className="chudd-modal">
                  <div className="chudd-modal-header">
                    <h2>Create new form</h2>
                    <span className="chudd-close" onClick={() => setShowModal(false)}>&times;</span>
                  </div>
                  <div className="chudd-modal-body">
                    <label>Form Name</label>
                    <input
                      type="text"
                      placeholder="Enter Form Name Here"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                    <label>Form Description</label>
                    <textarea
                      placeholder="Enter Description Here"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="chudd-modal-footer">
                    <button className="chudd-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="chudd-create" onClick={handleCreateForm}>Create</button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default MyForms;
