import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import "../styles/Responses.css";
import Select from "react-select";

const Responses = () => {
  const [responses, setResponses] = useState([]);
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);

  // ✅ Store & Retrieve `pageIndex` Properly
  const [pageIndex, setPageIndex] = useState(() => {
    return Number(localStorage.getItem("formResponsesPageIndex")) || 0;
  });

  useEffect(() => {
    localStorage.setItem("formResponsesPageIndex", pageIndex);
  }, [pageIndex]);

  const formsPerPage = 5; // Adjust this for page size

  // Fetch responses from API
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const formId = localStorage.getItem("selectedFormId");

        const params = formId ? { form_id: formId } : {}; // Fetch all if no form is selected

        const response = await api.get(`/responses`, {
          headers: { Authorization: `Bearer ${token}` },
          params, // Send form_id only if it exists
        });

        console.log("API Response Data:", response.data);

        const formattedResponses = response.data.map((res) => ({
          id: res.id || null,
          avatar: res.avatar || "/default-avatar.png",
          userName: res.userName || "Unknown",
          formName: res.formName || "Untitled Form",
          status: res.status === "Active" ? "Active" : "Deactivated",
          submissionTime: res.submission_time
            ? new Date(res.submission_time).toLocaleString()
            : "N/A",
        }));

        setResponses(formattedResponses);
      } catch (error) {
        console.error("Error fetching responses:", error);
      }
    };

    fetchResponses();

    const intervalId = setInterval(fetchResponses, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Filter responses when user or form is selected
  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      const matchesUser =
        selectedUsers.length === 0 ||
        selectedUsers.some((user) => user.value === response.userName);

      const matchesForm =
        selectedForms.length === 0 ||
        selectedForms.some((form) => form.value === response.formName);

      return matchesUser && matchesForm;
    });
  }, [responses, selectedUsers, selectedForms]);

  const handleRowClick = useCallback(
    (row) => {
      const responseId = row.original.id;
      if (!responseId || responseId === "null" || responseId === "undefined") {
        console.warn("Invalid ID for navigation:", responseId);
        return;
      }

      console.log("Navigating to:", responseId);
      navigate(`/response-details/${responseId}`);
    },
    [navigate]
  );

  const columns = [
    {
      accessorKey: "avatar",
      header: " ",
      cell: ({ row }) => (
        <div className="responses-avatar-container">
          <img
            src={row.original.avatar}
            alt="User Avatar"
            className="responses-avatar"
          />
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "User Name",
      cell: ({ row }) => (
        <span className="responses-user">{row.original.userName}</span>
      ),
    },
    {
      accessorKey: "formName",
      header: "Form Name",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "Active"
              ? "responses-status-active"
              : "responses-status-deactivated"
          }
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "submissionTime",
      header: "Submission Time",
    },
  ];

  const table = useReactTable({
    data: filteredResponses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination: { pageIndex, pageSize: formsPerPage } },
    manualPagination: false,
  });

  const uniqueUsers = useMemo(() => {
    const userSet = new Set(responses.map((response) => response.userName));
    return Array.from(userSet);
  }, [responses]);

  const uniqueForms = useMemo(() => {
    const formSet = new Set(responses.map((response) => response.formName));
    return Array.from(formSet);
  }, [responses]);

  const userOptions = uniqueUsers.map((user) => ({ value: user, label: user }));
  const formOptions = uniqueForms.map((form) => ({ value: form, label: form }));

  return (
    <div className="responses-container">
      <Sidebar />
      <div className="responses-main-content">
        <DashboardHeader />
        <div className="responses-content-wrapper">
          <div className="response-top-bar">
            <h1>User Responses</h1>
          </div>

          <div className="responses-filters">
            <Select
              isMulti
              options={userOptions}
              value={selectedUsers}
              onChange={setSelectedUsers}
              placeholder="Filter by User"
              className="multi-select-dropdown"
            />

            <Select
              isMulti
              options={formOptions}
              value={selectedForms}
              onChange={setSelectedForms}
              placeholder="Filter by Form"
              className="multi-select-dropdown"
            />
          </div>

          {/* Table */}
          <div className="responses-table-wrapper">
            <div className="responses-table-container">
              <table className="responses-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>{header.column.columnDef.header}</th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRowClick(row);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="no-data-message">
                        No matching results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination UI */}
          <div className="form-responses-pagination">
            <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
              {"<<"}
            </button>

            <button
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
            >
              {"<"}
            </button>

            {Array.from({ length: table.getPageCount() }, (_, index) => (
              <button
                key={index}
                onClick={() => setPageIndex(index)}
                className={`form-responses-page-number ${
                  pageIndex === index ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setPageIndex((prev) => Math.min(prev + 1, table.getPageCount() - 1))
              }
              disabled={pageIndex >= table.getPageCount() - 1}
            >
              {">"}
            </button>

            <button onClick={() => setPageIndex(table.getPageCount() - 1)} disabled={pageIndex >= table.getPageCount() - 1}>
              {">>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Responses;
