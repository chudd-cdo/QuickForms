import React, { useState, useEffect, useMemo } from "react"; 
import { useNavigate, useLocation } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "../styles/MyForms.css";
import { FaTrash, FaSearch, FaEdit } from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import LocalStorage from "../components/localStorage";
import api from "../api";
import Select from "react-select";
import MyFormModal from "../components/MyFormModal";
import ResponsesModal from "../components/ResponsesModal";

const MyForms = ({ forms, setForms }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResponsesModalOpen, setIsResponsesModalOpen] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const token = LocalStorage.getToken();
  const [formattedForms, setFormattedForms] = useState([]);
  const [currentFormTitle, setCurrentFormTitle] = useState("");
  const [currentFormId, setCurrentFormId] = useState(null);
  const [loading, setLoading] = useState(true);
  

  

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = response.data.map(user => ({
        label: user.name,
        value: user.id,
      }));
      setAllUsers(formatted);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
      handleApiError(error);
    }
  };

  const fetchUserForms = async () => {
    try {
      setLoading(true); // Set loading true before fetching

      setForms([]);
      await api.get("/sanctum/csrf-cookie");
      const response = await api.get("/forms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedForms = response.data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setForms(sortedForms);

      const formatted = sortedForms.map(form => ({
        label: form.name,
        value: form.id,
      }));
      setFormattedForms(formatted);
    } catch (error) {
      console.error("API error:", error.response?.data || error.message);
      handleApiError(error);
    }
    finally {
      setLoading(false); // Stop loading once done
    }
  };

  useEffect(() => {
    if (!token) {
      console.error("No authentication token found");
      navigate("/");
    } else {
      fetchUserForms();
      fetchUsers();
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

  const handleApiError = (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized access. Redirecting to login...");
      LocalStorage.clearAll();
      navigate("/");
    } else {
      console.error("API error:", error);
    }
  };

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
      await api.delete(`/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForms((prevForms) => prevForms.filter((form) => form.id !== id));
    } catch (error) {
      console.error("Error deleting form", error.response?.data || error.message);
      handleApiError(error);
    }
  };

  const handleViewResponses = (formId) => {
    const form = forms.find((f) => f.id === formId);
    setCurrentFormTitle(form?.name || "Form");
    setCurrentFormId(formId);
    setIsResponsesModalOpen(true);
  };
  

  const filteredForms = useMemo(() => {
    return forms
      .filter((form) => {
        const matchSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCreator =
          selectedCreators.length === 0 ||
          selectedCreators.some((c) => c.value === (form.user?.name || "Unknown"));
          const matchStatus =
  selectedStatuses.length === 0 ||
  selectedStatuses.some((s) => s.value === Boolean(form.is_active));

        const formMonthYear = `${new Date(form.created_at).getFullYear()}-${String(
          new Date(form.created_at).getMonth() + 1
        ).padStart(2, "0")}`;
        const matchDate =
          selectedDates.length === 0 ||
          selectedDates.some((d) => d.value === formMonthYear);
        return matchSearch && matchCreator && matchStatus && matchDate;
      })
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [forms, searchQuery, selectedCreators, selectedStatuses, selectedDates]);

  const columns = useMemo(
    () => [
      {
        header: "",
        accessorKey: "actions",
        cell: ({ row }) => (
          <div className="chudd-action-icons">
            <FaEdit className="chudd-edit-icon" onClick={() => handleEdit(row.original.id)}  style={{ fontSize: "1.2rem" , marginLeft: "10px"}} />
            <FaTrash className="chudd-delete-icon" onClick={() => handleDeleteForm(row.original.id)}   style={{ fontSize: "1rem" }}/>
          </div>
        ),
      },
      { 
        header: "Form Name", 
        accessorKey: "name",
        cell: ({ getValue }) => (
          <div className="chudd-form-name-cell">
            {getValue()}
          </div>
        )
      },
      
      {
        header: "Created By",
        accessorFn: (row) => row.user?.name || "Unknown",
      },
      {
        header: "Date Created",
        accessorKey: "created_at",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
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
        header: "Assigned Users",
        accessorFn: (row) => row.assigned_users_count || 0,
      },
      {
        header: "Total Responses",
        accessorKey: "responses_count",
        cell: ({ row }) => (
          <button
            className="chudd-responses-button"
            onClick={() => handleViewResponses(row.original.id)}
          >
            {row.original.responses_count || 0}
          </button>
        ),
      }
    ],
    []
  );

  const table = useReactTable({
    data: filteredForms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

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

            <div className="response-filter-controls">
              {/* Filters */}
              <Select
                isMulti
                options={Array.from(new Set(forms.map(f => f.user?.name || "Unknown"))).map(name => ({ label: name, value: name }))}
                onChange={setSelectedCreators}
                placeholder="Filter by Creator"
                className="filter-select-dropdown"
                value={selectedCreators}
              />
              <Select
                isMulti
                options={[
                  { label: "Activated", value: true },
                  { label: "Deactivated", value: false },
                ]}
                onChange={setSelectedStatuses}
                placeholder="Filter by Status"
                className="filter-select-dropdown"
                value={selectedStatuses}
              />
              <Select
                isMulti
                options={Array.from(new Set(forms.map(f => {
                  const date = new Date(f.created_at);
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                }))).map(dateString => ({
                  label: new Date(dateString + "-01").toLocaleString("default", { month: "long", year: "numeric" }),
                  value: dateString,
                }))}
                onChange={setSelectedDates}
                placeholder="Filter by Date (Month/Year)"
                className="filter-select-dropdown"
                value={selectedDates}
              />
            </div>

            <div className="chudd-actions">
            <button className="chudd-AssModal-button" onClick={() => setIsModalOpen(true)}>
  <MdAssignmentAdd style={{ fontSize: "1.5rem" }} />
</button>

              <button className="chudd-create-form" onClick={handleCreateForm}>
                + Create New Form
              </button>
            </div>
          </div>

          <>
  {loading ? (
    <div className="chudd-spinner"></div> // Spinner while data is loading
  ) : (
    <table className="chudd-myforms-table">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )}
</>



          {/* Pagination */}
          <div className="chudd-pagination">
            <button onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>{'<<'}</button>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{'<'}</button>
            {Array.from({ length: table.getPageCount() }, (_, index) => (
              <button
                key={index}
                onClick={() => table.setPageIndex(index)}
                className={`chudd-page-number ${table.getState().pagination.pageIndex === index ? "active" : ""}`}
              >
                {index + 1}
              </button>
            ))}
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{'>'}</button>
            <button onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>{'>>'}</button>
          </div>
        </div>
      </div>

      <MyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={allUsers}
        forms={formattedForms}
        token={token}
        onSubmit={() => {}}
      />

<ResponsesModal
  isOpen={isResponsesModalOpen}
  onClose={() => setIsResponsesModalOpen(false)}
  formId={currentFormId}
  formTitle={currentFormTitle}
/>




    </div>
  );
};

export default MyForms;
