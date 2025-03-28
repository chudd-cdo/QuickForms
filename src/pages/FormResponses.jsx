import React, { useState, useEffect, useMemo } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import "../styles/FormResponses.css";
import { FaSearch } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import LocalStorage from "../components/localStorage";
import api from "../api";

const FormResponses = ({ forms, setForms }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const token = LocalStorage.getToken();

  useEffect(() => {
    if (!token) {
      console.error("No authentication token found");
      navigate("/");
    } else {
      fetchUserForms();
      const interval = setInterval(fetchUserForms, 5000); // Fetch every 5 seconds
      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, []);

  const fetchUserForms = async () => {
    try {
      await api.get("/sanctum/csrf-cookie");
      const response = await api.get("/my-forms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("User Forms Response:", response.data);

      const sortedForms = response.data.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );

      // Update forms state directly with new sorted data
      setForms(sortedForms);
    } catch (error) {
      console.error("API error:", error.response?.data || error.message);
      handleApiError(error);
    }
  };

  const handleApiError = (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized access. Redirecting to login...");
      LocalStorage.clearAll();
      navigate("/");
    } else {
      console.error("API error:", error);
    }
  };

  const filteredForms = useMemo(() => {
    return forms?.filter((form) =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [forms, searchQuery]);

  const handleRowClick = (formId) => {
    if (!formId) {
      console.error("Invalid form ID.");
      return;
    }
    localStorage.setItem("selectedFormId", formId);
    navigate(`/responses/${formId}`);
  };

  const columns = useMemo(
    () => [
      { header: "Name", accessorKey: "name" },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ getValue }) => (
          <span
            className={
              getValue()
                ? "form-responses-status-active"
                : "form-responses-status-deactivated"
            }
          >
            {getValue() ? "Activated" : "Deactivated"}
          </span>
        ),
      },
      {
        header: "Responses",
        accessorKey: "responses_count",
        cell: ({ getValue }) => getValue() || "0",
      },
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
    <div className="form-responses-container">
      <DashboardHeader />
      <div className="form-responses-main-content">
        <Sidebar />
        <div className="form-response-top-bar">
          <h1>Form Responses</h1>
        </div>

        <div className="form-responses-search-bar-container">
          <div className="form-responses-search-bar">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="form-responses-search-icon" />
          </div>
        </div>

        <div className="form-responses-table-container">
          {forms.length > 0 ? (
            <table className="form-responses-table">
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
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row.original.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No forms available.</p>
          )}
        </div>

        <div className="form-responses-pagination">
          <button onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
            {"<<"}
          </button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            {"<"}
          </button>
          {Array.from({ length: table.getPageCount() }, (_, index) => (
            <button
              key={index}
              onClick={() => table.setPageIndex(index)}
              className={`form-responses-page-number ${
                table.getState().pagination.pageIndex === index ? "active" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            {">"}
          </button>
          <button onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
            {" >> "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormResponses;
