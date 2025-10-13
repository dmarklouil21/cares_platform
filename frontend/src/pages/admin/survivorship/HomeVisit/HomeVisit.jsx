// src/pages/survivorship/HomeVisit.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "src/api/axiosInstance";

// ⬇️ PRINT TEMPLATE
import HomeVisitPrint from "./generate/generate";

function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-base font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/70"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-400"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Notification({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 transition-all duration-500">
      <div className="bg-gray2 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
        <img
          src="/images/logo_white_notxt.png"
          alt="Rafi Logo"
          className="h-[20px]"
        />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

const HomeVisit = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [notification, setNotification] = useState("");

  const fetchData = async () => {
    try {
      const response = await api.get("/survivorship/home-visit/list/");
      setTableData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const s = statusFilter;
    const d = dateFilter || null;
    return tableData.filter((row) => {
      const matchesSearch =
        !q ||
        (row.patient?.patient_id || "").toLowerCase().includes(q) ||
        (row.patient?.full_name || "").toLowerCase().includes(q) ||
        (row.patient?.diagnosis?.[0]?.diagnosis || "")
          .toLowerCase()
          .includes(q);
      const matchesStatus =
        s === "all" || (row.status || "").toLowerCase() === s;
      const matchesDate = !d || row.created_at === d;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [tableData, searchQuery, statusFilter, dateFilter]);

  const totalRecords = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  const paginated = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const openConfirm = (id, action) => {
    setPendingAction({ id, action });
    setModalText(
      action === "accept" ? "Accept this request?" : "Reject this request?"
    );
    setModalOpen(true);
  };

  const doAction = () => {
    if (!pendingAction) return;
    const { id, action } = pendingAction;
    if (action === "accept") {
      setTableData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
      );
      setNotification(`Request ${id} has been approved.`);
    } else if (action === "reject") {
      setTableData((prev) => prev.filter((r) => r.id !== id));
      setNotification(`Request ${id} has been rejected and removed.`);
    }
    setModalOpen(false);
    setPendingAction(null);
    setTimeout(() => setNotification(""), 2500);
  };

  const cancelAction = () => {
    setModalOpen(false);
    setPendingAction(null);
  };

  const handleView = (id) => {
    navigate(`/admin/survivorship/view/${id}`);
  };

  return (
    <>
      {/* --- Print rules: only show the print template during print --- */}
      <style>{`
        :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        @media print {
          #homevisit-root { display: none !important; }
          #print-root { display: block !important; }
          @page { size: Letter; margin: 0 !important; }
          html, body { margin: 0 !important; }
        }
        @media screen {
          #print-root { display: none !important; }
        }

        /* Screen table tweak to avoid double borders in the scrollable body */
        .master-table { border-collapse: collapse; }
        .master-table, .master-table th, .master-table td, .master-table tr { border: 0 !important; }
      `}</style>

      {/* --- PRINT-ONLY CONTENT (all filtered rows, not paginated) --- */}
      <div id="print-root">
        <HomeVisitPrint rows={filteredResults} />
      </div>

      {/* --- SCREEN CONTENT --- */}
      <div id="homevisit-root">
        <ConfirmationModal
          open={modalOpen}
          text={modalText}
          onConfirm={doAction}
          onCancel={cancelAction}
        />
        <Notification message={notification} />

        <div className="h-screen w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-left w-full pl-1">
              Patient Home Visit
            </h2>
            <Link
              to="/admin/survivorship/add"
              className="bg-yellow px-5 py-1 rounded-sm text-white"
            >
              Add
            </Link>
          </div>

          <div className="flex flex-col bg-white w-full rounded-[4px] shadow-md px-5 py-3 gap-3">
            <p className="text-md font-semibold text-yellow">Manage patients that are in need of home visit</p>

            {/* Filters + Generate */}
            <div className="flex justify-between flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by patient no, patient name, or diagnosis..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
              />
              <select
                className="border border-gray-200 rounded-md p-2 bg-white"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
              </select>
              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {/* ⬇️ Generate button with cursor-pointer */}
              <button
                onClick={() => window.print()}
                className="px-7 font-bold rounded-md text-sm text-white bg-primary cursor-pointer"
                title="Print current list"
              >
                Generate
              </button>
            </div>

            {/* Table */}
            <div className="bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                <thead>
                  <tr className="bg-lightblue">
                    <th className="w-[15%] text-center text-sm py-3 !bg-lightblue">
                      Patient no
                    </th>
                    <th className="w-[20%] text-center text-sm py-3">
                      Patient Name
                    </th>
                    <th className="w-[20%] text-center text-sm py-3">
                      Diagnosis
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">Date</th>
                    <th className="w-[10%] text-center text-sm py-3">Status</th>
                    <th className="w-[20%] text-center text-sm py-3">Action</th>
                  </tr>
                </thead>
              </table>

              <div className="max-h-[240px] min-h-[240px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 master-table border-separate border-spacing-0">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[10%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginated.map((p) => (
                      <tr key={p.id}>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.patient?.patient_id}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.patient?.full_name}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.patient?.diagnosis?.[0]?.diagnosis || "N/A"}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {new Date(p.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="text-center text-sm py-3">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-md ${
                              p.status === "Approved"
                                ? "bg-green-50 text-green-600"
                                : p.status === "Completed"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="text-center text-sm py-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleView(p.id)}
                              className="text-white py-1 px-2 rounded-[5px] shadow bg-primary"
                            >
                              View
                            </button>
                            {p.status === "Pending" && (
                              <>
                                {/* <button
                                  onClick={() => openConfirm(p.id, "accept")}
                                  className="text-white py-1 px-2 rounded-[5px] shadow bg-green-500"
                                >
                                  Accept
                                </button> */}
                                <button
                                  onClick={() => openConfirm(p.id, "reject")}
                                  className="text-white py-1 px-2 rounded-[5px] shadow bg-red-500"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-4 text-gray-500"
                        >
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center py-2 gap-5">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="recordsPerPage"
                  className="text-sm text-gray-700"
                >
                  Records per page:
                </label>
                <select
                  id="recordsPerPage"
                  className="w-16 rounded-md shadow-sm"
                  value={recordsPerPage}
                  onChange={(e) => {
                    setRecordsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-700">
                  {Math.min(
                    (currentPage - 1) * recordsPerPage + 1,
                    totalRecords
                  )}{" "}
                  – {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                  {totalRecords}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-gray-600"
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="text-gray-600"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeVisit;
