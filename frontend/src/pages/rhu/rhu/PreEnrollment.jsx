import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// ──────────────────────────────────────────────────────────────
// Simple Confirmation Modal
function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-xl font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/50"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Simple Top Notification (toast-like)
function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
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

// ──────────────────────────────────────────────────────────────
const RhuPreEnrollment = () => {
  const navigate = useNavigate();

  // Table + filters
  const [tableData, setTableData] = useState({ results: [] });
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Notifications
  const [notification, setNotification] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null); // { preenrollment_id, action }

  // ✅ Sample data only — now using preenrollment_id
  const samplePatients = [
    {
      preenrollment_id: "PE-001",
      full_name: "Juan Dela Cruz Jr.",
      date_created: "2022-01-01",
      city: "Manila",
      status: "pending",
    },
    {
      preenrollment_id: "PE-002",
      full_name: "Maria Santos",
      date_created: "2022-01-01",
      city: "Quezon City",
      status: "pending",
    },
    {
      preenrollment_id: "PE-003",
      full_name: "Pedro Gonzales Sr.",
      date_created: "2022-01-01",
      city: "Makati",
      status: "pending",
    },
    {
      preenrollment_id: "PE-004",
      full_name: "Ana Ramos",
      date_created: "2022-01-01",
      city: "Pasig",
      status: "pending",
    },
  ];

  // Load sample data
  useEffect(() => {
    setTableData({ results: samplePatients });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [tableData, recordsPerPage]);

  // ──────────────────────────────────────────────────────────────
  // Filters + pagination
  const filteredResults =
    tableData.results?.filter((record) => {
      const matchesSearch =
        !searchQuery ||
        record.preenrollment_id?.toString().includes(searchQuery) ||
        record.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;

      const formattedDate = dateFilter
        ? new Date(dateFilter).toISOString().split("T")[0]
        : null;
      const matchesDate =
        !formattedDate || record.date_created === formattedDate;

      return matchesSearch && matchesStatus && matchesDate;
    }) || [];

  const totalRecords = filteredResults.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const paginatedData = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // ──────────────────────────────────────────────────────────────
  // Helpers
  const getEnrollById = (id) =>
    tableData?.results?.find((p) => p.preenrollment_id === id);

  // VIEW: /Rhu/rhu/view/RhuPreEnrollmentView/:beneficiary_id
  // (Route param name stays as beneficiary_id in your router; we pass the preenrollment_id value)
  const handleViewClick = (preenrollment_id) => {
    if (!preenrollment_id) {
      console.warn("handleViewClick: missing preenrollment_id");
      return;
    }
    const patient = getEnrollById(preenrollment_id);
    navigate(
      `/Rhu/rhu/view/RhuPreEnrollmentView/${encodeURIComponent(
        preenrollment_id
      )}`,
      patient ? { state: { patient } } : undefined
    );
  };

  // EDIT: /Rhu/rhu/edit/RhuPreEnrollmentEdit/:beneficiary_id
  const handleEditClick = (preenrollment_id) => {
    if (!preenrollment_id) {
      console.warn("handleEditClick: missing preenrollment_id");
      return;
    }
    const patient = getEnrollById(preenrollment_id);
    navigate(
      `/Rhu/rhu/edit/RhuPreEnrollmentEdit/${encodeURIComponent(
        preenrollment_id
      )}`,
      patient ? { state: { patient } } : undefined
    );
  };

  // DELETE: open confirm modal only
  const handleActionClick = (preenrollment_id, action) => {
    if (action === "delete") {
      setModalText("Are you sure you want to delete this patient?");
      setModalAction({ preenrollment_id, action });
      setModalOpen(true);
    }
  };

  // Confirm: just show a notification (no actual data mutation)
  const handleModalConfirm = () => {
    if (modalAction?.action === "delete") {
      const p = getEnrollById(modalAction.preenrollment_id);
      setNotification(
        `Deleted ${modalAction.preenrollment_id}${
          p?.full_name ? ` - ${p.full_name}` : ""
        } (sample only)`
      );
      setTimeout(() => setNotification(""), 3000);
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  // ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Modal + Notification */}
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />

      {/* Layout */}
      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Admin</h1>
          <Link
            to="/Rhu/rhu/add/RhuPreEnrollmentAdd"
            className="bg-yellow gap-3 flex justify-center items-center px-5 py-1 rounded-sm"
          >
            <img
              src="/images/add.svg"
              alt="Add User Icon"
              className="h-[18px]"
            />
            <p className="text-white text-sm">Add</p>
          </Link>
        </div>

        <div className="w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Pre-Enrollment
          </h2>

          <div className="flex flex-col bg-white w-full rounded-[4px] shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">
              Pre-Enrollment Requests
            </p>

            {/* Filters */}
            <div className="flex justify-between flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by Pre-Enrollment ID ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
              />

              <select
                className="border border-gray-200 rounded-md p-2 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="validated">Validated</option>
                <option value="rejected">Rejected</option>
              </select>

              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              <button className="px-7 rounded-md text-sm bg-[#C5D7E5]">
                Filter
              </button>
            </div>

            {/* Table */}
            <div className="bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                <thead>
                  <tr className="bg-lightblue">
                    <th className="w-[15%] text-center text-sm py-3">
                      Pre-Enrollment ID
                    </th>
                    <th className="w-[20%] text-center text-sm py-3">Name</th>
                    <th className="w-[15%] text-center text-sm py-3">
                      Submission Date
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">LGU</th>
                    <th className="w-[10%] text-center text-sm py-3">Status</th>
                    <th className="w-[25%] text-center text-sm py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => (
                    <tr key={item.preenrollment_id}>
                      <td className="text-center py-3">
                        {item.preenrollment_id}
                      </td>
                      <td className="text-center py-3">{item.full_name}</td>
                      <td className="text-center py-3">
                        {new Date(item.date_created).toLocaleDateString()}
                      </td>
                      <td className="text-center py-3">{item.city}</td>
                      <td className="text-center py-3">{item.status}</td>
                      <td className="text-center py-3 flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewClick(item.preenrollment_id)}
                          className="text-white py-1 px-2 rounded-md shadow bg-primary"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditClick(item.preenrollment_id)}
                          className="text-white py-1 px-2 rounded-md shadow bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleActionClick(item.preenrollment_id, "delete")
                          }
                          className="text-white py-1 px-2 rounded-md shadow bg-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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

            {/* Pagination */}
            <div className="flex justify-end items-center py-2 gap-5">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="recordsPerPage"
                  className="text-sm text-gray-700"
                >
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
                  {Math.min(
                    (currentPage - 1) * recordsPerPage + 1,
                    totalRecords
                  )}{" "}
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
      </div>
    </>
  );
};

export default RhuPreEnrollment;
