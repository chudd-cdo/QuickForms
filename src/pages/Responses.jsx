import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaSearch } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import "../styles/Responses.css";

const Responses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const responsesPerPage = 5;

  // Fetch responses from API
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get("/responses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response Data:", response.data);

        const formattedResponses = response.data.map((res) => ({
          avatar: res.avatar || "/default-avatar.png",
          userName: res.userName || "Unknown",
          formName: res.formName || "Untitled Form",
          status: res.status === "Active" ? "Active" : "Deactivated",
          submissionTime: res.submission_time
            ? new Date(res.submission_time).toLocaleString()
            : "N/A",
        }));

        // Preserve current page index if data length remains the same
        setResponses((prev) => 
          JSON.stringify(prev) === JSON.stringify(formattedResponses) ? prev : formattedResponses
        );
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
    
    // Real-time updates every 5 seconds
    const intervalId = setInterval(fetchResponses, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Optimized filtering
  const filteredResponses = useMemo(() => {
    return responses.filter(
      (response) =>
        response.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        response.formName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [responses, searchQuery]);

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
      cell: ({ row }) => <span className="responses-user">{row.original.userName}</span>,
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
    state: { pagination: { pageIndex, pageSize: responsesPerPage } },
    onPaginationChange: (updater) => {
      setPageIndex((prev) => {
        const newState = typeof updater === "function" ? updater(prev) : updater;
        return newState.pageIndex !== undefined ? newState.pageIndex : prev;
      });
    },
  });

  const handleCreateForm = () => {
    alert("Create new form clicked");
  };

  return (
    <div className="responses-container">
      <Sidebar />
      <div className="responses-main-content">
        <DashboardHeader />
        <div className="responses-content-wrapper">
          <div className="response-top-bar">
            <h1>User Responses</h1>
          </div>

              <div className="responses-search-bar-container">
                <div className="responses-search-bar">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="responses-search-icon" />
                </div>
              </div>


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
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

          <div className="responses-pagination">
            <button 
              onClick={() => setPageIndex(0)} 
              disabled={pageIndex === 0}
            >
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
                className={pageIndex === index ? "active-page" : ""}
              >
                {index + 1}
              </button>
            ))}

            <button 
              onClick={() => setPageIndex((prev) => Math.min(prev + 1, table.getPageCount() - 1))} 
              disabled={pageIndex >= table.getPageCount() - 1}
            >
              {">"}
            </button>
            <button 
              onClick={() => setPageIndex(table.getPageCount() - 1)} 
              disabled={pageIndex >= table.getPageCount() - 1}
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Responses;
