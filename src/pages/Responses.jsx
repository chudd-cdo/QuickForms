import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const responsesPerPage = 5;
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(() => {
    return Number(localStorage.getItem("responsesPageIndex")) || 0;
  });

  // Fetch responses from API
  useEffect(() => {
    // Retrieve stored page index if available
    const storedPageIndex = localStorage.getItem("responsesPageIndex");
    if (storedPageIndex) {
      setPageIndex(Number(storedPageIndex));
    }
  
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get("/responses", {
          headers: { Authorization: `Bearer ${token}` },
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
  
        setResponses((prevResponses) => {
          if (JSON.stringify(prevResponses) !== JSON.stringify(formattedResponses)) {
            return formattedResponses;
          }
          return prevResponses;
        });
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchResponses();
  
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

  const handleRowClick = useCallback(
    (row) => {
      localStorage.setItem("responsesPageIndex", pageIndex); // ✅ Save current page
      console.log("Navigating to:", row.original.id);
      if (row.original.id) {
        navigate(`/response-details/${row.original.id}`);
      } else {
        console.warn("Invalid ID for navigation:", row.original.id);
      }
    },
    [navigate, pageIndex]
  );
  

  const columns = [
    {
      accessorKey: "avatar",
      header: " ",
      cell: ({ row }) => (
        <div className="responses-avatar-container">
          <img src={row.original.avatar} alt="User Avatar" className="responses-avatar" />
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
            row.original.status === "Active" ? "responses-status-active" : "responses-status-deactivated"
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
    manualPagination: false,
    onPaginationChange: (updater) => {
      setPageIndex((prev) => {
        const newPageIndex = typeof updater === "function" ? updater(prev).pageIndex : updater.pageIndex;
        
        if (newPageIndex !== undefined) {
          localStorage.setItem("responsesPageIndex", newPageIndex); // ✅ Corrected
          return newPageIndex;
        }
        
        return prev;
      });
    },
  });
  

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
                      <tr 
                        key={row.id} 
                        onClick={() => handleRowClick(row)}
                        style={{ cursor: "pointer" }} 
                      >
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

export default Responses;
