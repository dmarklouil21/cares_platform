import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";

/* Notification (no close button) */
function Notification({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 -translate-x-1/2 z-50 transition-all duration-500">
      <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
        <img
          src="/images/logo_white_notxt.png"
          alt="Rafi Logo"
          className="h-[25px]"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}

const applicationStatus = () => {
  /* ----------------------------- Demo data ----------------------------- */
  const [items, setItems] = useState([
    {
      id: "MS-001",
      title: "Barangay Wellness Check",
      date: "2025-09-20",
      beneficiaries: "Senior citizens (50)",
      status: "pending",
      description: "Free BP & glucose screening for seniors.",
      supportNeed: "3 nurses, 2 BP sets, 1 glucometer",
    },
    {
      id: "MS-002",
      title: "School Health Drive",
      date: "2025-09-25",
      beneficiaries: "Students (120)",
      status: "approved",
      description: "Free BP & glucose screening for seniors.",
      supportNeed: "3 nurses, 2 BP sets, 1 glucometer",
    },
    {
      id: "MS-003",
      title: "Community Screening",
      date: "2025-10-01",
      beneficiaries: "General public (80)",
      status: "pending",
      description: "Free BP & glucose screening for seniors.",
      supportNeed: "3 nurses, 2 BP sets, 1 glucometer",
    },
  ]);

  /* ----------------------------- Filters ------------------------------ */
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | approved
  const [dateFilter, setDateFilter] = useState("");

  /* ----------------------------- Pagination --------------------------- */
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch =
        !q ||
        (it.id ?? "").toLowerCase().includes(q) ||
        (it.title ?? "").toLowerCase().includes(q) ||
        (it.beneficiaries ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all"
          ? true
          : (it.status ?? "").toLowerCase() === statusFilter;
      const matchesDate = !dateFilter ? true : (it.date ?? "") === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [items, searchQuery, statusFilter, dateFilter]);

  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, currentPage, recordsPerPage]);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  /* ----------------------------- View / Delete ------------------------------ */
  const navigate = useNavigate();

  const handleViewClick = (id) => {
    const record = items.find((x) => x.id === id);
    navigate("/rhu/application/view/applicationview", {
      state: record ?? { id },
    });
  };

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Notification state
  const [notif, setNotif] = useState("");

  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(""), 2500);
    return () => clearTimeout(t);
  }, [notif]);

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    // If you actually want to remove the item, uncomment the next line:
    // setItems((arr) => arr.filter((x) => x.id !== deleteTargetId));
    setNotif("Record deleted successfully.");
    setDeleteTargetId(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray relative">
      {/* Notification */}
      <Notification message={notif} />

      {/* Top bar */}
      <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
        <h1 className="text-md font-bold h-full flex items-center">RHU</h1>
      </div>

      {/* Content */}
      <div className="w-full flex-1 py-5 flex flex-col justify-start gap-5 px-5">
        <h2 className="text-xl font-bold text-left w-full pl-5">
          Mass Screening Requests
        </h2>

        <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-3">
          <p className="text-md font-semibold text-yellow">
            Manage all mass screening requests
          </p>

          {/* Filters */}
          <div className="flex justify-between flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by Mass ID, title, or beneficiaries..."
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
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 py-2 px-5 rounded-md"
            />
            <button
              className="px-7 rounded-md text-sm text-white bg-lightblue"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDateFilter("");
                setCurrentPage(1);
              }}
            >
              Clear
            </button>
          </div>

          {/* Table */}
          <div className="bg-white shadow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-lightblue">
                  <th className="w-[10%] text-center text-sm py-3 !bg-lightblue">
                    Mass ID
                  </th>
                  <th className="w-[24%] text-center text-sm py-3">Title</th>
                  <th className="w-[14%] text-center text-sm py-3">Date</th>
                  <th className="w-[18%] text-center text-sm py-3">
                    Beneficiaries
                  </th>
                  <th className="w-[12%] text-center text-sm py-3">Status</th>
                  <th className="w-[22%] text-center text-sm py-3">Actions</th>
                </tr>
              </thead>
            </table>

            <div className="max-h-[200px] min-h-[200px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 border-spacing-0">
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[24%]" />
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                  <col className="w-[12%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item) => {
                    const status = (item.status || "").toLowerCase(); // pending | approved
                    const statusClasses =
                      status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700";

                    return (
                      <tr key={item.id}>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.id || "—"}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.title || "—"}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.date || "—"}
                        </td>
                        <td className="text-center text-sm py-4 text-gray-800">
                          {item.beneficiaries || "—"}
                        </td>
                        <td className="text-center text-sm py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${statusClasses}`}
                          >
                            {status === "approved" ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="text-center text-sm py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleViewClick(item.id)}
                              className="text-white py-1 px-2 rounded-md shadow bg-primary"
                            >
                              View
                            </button>
                            {/* <button
                              onClick={() =>
                                console.log("Edit/Update", item.id)
                              }
                              className="text-white py-1 px-2 rounded-md shadow bg-yellow-500"
                            >
                              Edit
                            </button> */}
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="text-white py-1 px-2 rounded-md shadow bg-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
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

          {/* Footer Pagination */}
          <div className="flex justify-end items-center py-2 gap-5">
            <div className="flex items-center gap-2">
              <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                Record per page:
              </label>
              <select
                id="recordsPerPage"
                className="w-16 rounded-md shadow-sm"
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
              >
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-sm text-gray-700">
                {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)}{" "}
                – {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                {totalRecords}
              </span>
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="text-gray-600"
              >
                ←
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="text-gray-600"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------- Delete Confirmation Modal ----------------------- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Box */}
          <div className="relative bg-white w-[min(420px,92vw)] rounded-xl shadow-xl p-6 z-50 text-center">
            <h4 className="text-lg font-semibold mb-2">Delete this record?</h4>
            <p className="text-sm text-gray2 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 rounded-md border border-gray2 "
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default applicationStatus;
