import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { flexRender } from '@tanstack/react-table';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import "../styles/Responses.css";
import Select from "react-select";
import Papa from "papaparse";
import { debounce } from "lodash";

const Responses = () => {
  const [responses, setResponses] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState(() => {
    const saved = localStorage.getItem("selectedUsers");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedForms, setSelectedForms] = useState(() => {
    const saved = localStorage.getItem("selectedForms");
    return saved ? JSON.parse(saved) : [];
  });
  const [pageIndex, setPageIndex] = useState(
    Number(localStorage.getItem("formResponsesPageIndex")) || 0
  );

  const formsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("formResponsesPageIndex", pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    localStorage.setItem("selectedUsers", JSON.stringify(selectedUsers));
  }, [selectedUsers]);

  useEffect(() => {
    localStorage.setItem("selectedForms", JSON.stringify(selectedForms));
  }, [selectedForms]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const formId = localStorage.getItem("selectedFormId");
        const params = formId ? { form_id: formId } : {};

        const response = await api.get("/responses", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        const formatted = (response.data || []).map((res) => ({
          id: res.id || null,
          userName: res.userName || "Unknown",
          saveName: res.saveName || "Unknown",
          formName: res.formName || "Untitled Form",
          submissionTime: res.submission_time
            ? new Date(res.submission_time).toLocaleString()
            : "N/A",
        }));

        setResponses(formatted);
      } catch (err) {
        console.error("Error fetching responses:", err);
      }
    };

    fetchResponses();
    const intervalId = setInterval(fetchResponses, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const debouncedSetUsers = useMemo(
    () => debounce(setSelectedUsers, 300),
    []
  );
  const debouncedSetForms = useMemo(
    () => debounce(setSelectedForms, 300),
    []
  );

  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      const matchUser =
        selectedUsers.length === 0 ||
        selectedUsers.some((u) => u.value === r.userName || u.value === "ALL");
      const matchForm =
        selectedForms.length === 0 ||
        selectedForms.some((f) => f.value === r.formName || f.value === "ALL");
      return matchUser && matchForm;
    });
  }, [responses, selectedUsers, selectedForms]);

  const handleRowClick = useCallback(
    (row) => {
      const id = row.original?.id;
      if (!id || id === "null" || id === "undefined") return;
      navigate(`/response-details/${id}`);
    },
    [navigate]
  );

  const exportCSV = () => {
    const csv = Papa.unparse(filteredResponses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "filtered_responses.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const columns = [
    {
      accessorKey: "formName",
      header: "Form Name",
    },
    {
      accessorKey: "userName",
      header: "User",
    },
    
    {
      accessorKey: "saveName", // <- fixed
      header: "Name",
      cell: ({ row }) => (
        <span className="responses-name">{row.original.saveName}</span>
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
    return [
      { value: "ALL", label: "All Users" },
      ...Array.from(new Set(responses.map((r) => r.userName))).map((user) => ({
        value: user,
        label: user,
      })),
    ];
  }, [responses]);

  const uniqueForms = useMemo(() => {
    return [
      { value: "ALL", label: "All Forms" },
      ...Array.from(new Set(responses.map((r) => r.formName))).map((form) => ({
        value: form,
        label: form,
      })),
    ];
  }, [responses]);

  return (
    <div className="responses-container">
      <Sidebar />
      <div className="responses-main-content">
        <DashboardHeader />
        <div className="responses-content-wrapper">
          <div className="response-top-bar">
            <h1>User Responses</h1>
            <button className="export-btn" onClick={exportCSV}>
              Export CSV
            </button>
          </div>

          <div className="responses-filters">
            <Select
              isMulti
              options={uniqueUsers}
              onChange={debouncedSetUsers}
              placeholder="Filter by User"
              className="multi-select-dropdown"
              value={selectedUsers}
            />
            <Select
              isMulti
              options={uniqueForms}
              onChange={debouncedSetForms}
              placeholder="Filter by Form"
              className="multi-select-dropdown"
              value={selectedForms}
            />
          </div>

          <div className="responses-table-wrapper">
            <div className="responses-table-container responsive-table">
              <table className="responses-table">
                <thead>
                  {table.getHeaderGroups().map((group) => (
                    <tr key={group.id}>
                      {group.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={(e) => {
                          e.stopPropagation();
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
                setPageIndex((prev) =>
                  Math.min(prev + 1, table.getPageCount() - 1)
                )
              }
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
