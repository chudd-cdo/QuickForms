import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaSearch,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import "../styles/Responses.css";

const Responses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const responsesPerPage = 5;
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch responses from API
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://192.168.5.93:8000/api/responses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response Data:", response.data);

        const formattedResponses = response.data.map((res) => ({
          userName: res.userName || "Unknown",
          formName: res.formName || "Untitled Form",
          status: res.status === "Active" ? "Active" : "Deactive", // Reflect the latest status
          time: new Date(res.submission_time).toLocaleString(), // Format the timestamp
        }));

        setResponses(formattedResponses);
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchResponses();

    // Set interval for real-time updates
    const intervalId = setInterval(fetchResponses, 5000); // Fetch data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Filter responses based on search query
  const filteredResponses = responses.filter(
    (response) =>
      (response.userName && response.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (response.formName && response.formName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns = useMemo(
    () => [
      {
        header: "User Name",
        accessorKey: "userName",
        cell: ({ row }) => (
          <div>
            <FaUserCircle className="responses-user-icon" /> {row.original.userName}
          </div>
        ),
      },
      { header: "Form Name", accessorKey: "formName" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <span className={row.original.status === "Active" ? "active-status" : "inactive-status"}>
            {row.original.status}
          </span>
        ),
      },
      { header: "Submission Time", accessorKey: "time" },
    ],
    []
  );

  const table = useReactTable({
    data: filteredResponses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleCreateForm = () => {
    alert("Create new form clicked");
  };

  return (
    <div className="responses-container">
      <Sidebar />
      <div className="responses-main-content">
        <DashboardHeader />

        <div className="chudd-top-bar">
          <h1>User Responses</h1>
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
          <button className="chudd-create-form" onClick={handleCreateForm}>
            + Create new form
          </button>
        </div>

        <div className="responses-table-container">
          {loading ? (
            <p>Loading responses...</p>
          ) : (
            <table className="responses-table">
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
                {table
                  .getRowModel()
                  .rows.slice(
                    currentPage * responsesPerPage,
                    (currentPage + 1) * responsesPerPage
                  )
                  .map((row) => (
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
        </div>

        {/* Pagination */}
        <div className="responses-pagination">
          <button
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
          >
            {"<<"}
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            <FaChevronLeft />
          </button>

          {Array.from(
            { length: Math.ceil(filteredResponses.length / responsesPerPage) },
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={currentPage === index ? "active-page" : ""}
              >
                {index + 1}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredResponses.length / responsesPerPage) - 1
                )
              )
            }
            disabled={
              currentPage >=
              Math.ceil(filteredResponses.length / responsesPerPage) - 1
            }
          >
            <FaChevronRight />
          </button>
          <button
            onClick={() =>
              setCurrentPage(
                Math.ceil(filteredResponses.length / responsesPerPage) - 1
              )
            }
            disabled={
              currentPage >=
              Math.ceil(filteredResponses.length / responsesPerPage) - 1
            }
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Responses;
