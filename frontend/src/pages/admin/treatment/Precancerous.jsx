// src/pages/treatment/AdminPreCancerous.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// ----- inline sample data -----
const SAMPLE_PATIENTS = [
  {
    patient_id: "P-0001",
    first_name: "Maria",
    last_name: "Dela Cruz",
    middle_initial: "S.",
    date_of_birth: "1990-05-12",
    status: "pending",
    interpretation_of_result: "HPV Positive",
  },
  {
    patient_id: "P-0002",
    first_name: "Jose",
    last_name: "Garcia",
    middle_initial: "R.",
    date_of_birth: "1987-11-03",
    status: "pending",
    interpretation_of_result: "ASC-US",
  },
  {
    patient_id: "P-0003",
    first_name: "Kimberly",
    last_name: "Ytac",
    middle_initial: "F.",
    date_of_birth: "1999-02-22",
    status: "verified",
    interpretation_of_result: "Negative",
  },
  {
    patient_id: "P-0004",
    first_name: "Stayve",
    last_name: "Alreach",
    middle_initial: "",
    date_of_birth: "2001-07-15",
    status: "rejected",
    interpretation_of_result: "Unsatisfactory",
  },
];

// ----- ui bits -----
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

const PreCancerous = () => {
  const navigate = useNavigate();

  // data
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    setTableData(SAMPLE_PATIENTS);
  }, []);

  // filters & paging
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dobFilter, setDobFilter] = useState(""); // YYYY-MM-DD
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // modal & toast
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // { id, action }
  const [notification, setNotification] = useState("");

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const dob = dobFilter || null;
    return tableData.filter((p) => {
      const matchesSearch =
        !q ||
        p.patient_id.toLowerCase().includes(q) ||
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesDob = !dob || p.date_of_birth === dob;
      return matchesSearch && matchesStatus && matchesDob;
    });
  }, [tableData, searchQuery, statusFilter, dobFilter]);

  const totalRecords = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  useEffect(
    () => setCurrentPage(1),
    [recordsPerPage, searchQuery, statusFilter, dobFilter, totalRecords]
  );

  const paginated = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // actions
  const openConfirm = (id, action) => {
    const verb = action === "verify" ? "Verify" : "Reject";
    setModalText(`${verb} this patient?`);
    setPendingAction({ id, action });
    setModalOpen(true);
  };

  const doAction = () => {
    if (!pendingAction) return;
    const { id, action } = pendingAction;
    setTableData((prev) =>
      prev.map((p) =>
        p.patient_id === id
          ? { ...p, status: action === "verify" ? "verified" : "rejected" }
          : p
      )
    );
    setModalOpen(false);
    setPendingAction(null);
    setNotification(
      `Patient ${id} ${
        action === "verify" ? "verified" : "rejected"
      } successfully`
    );
    setTimeout(() => setNotification(""), 3000);
  };

  const cancelAction = () => {
    setModalOpen(false);
    setPendingAction(null);
  };

  const handleView = (id) => {
    const patient = tableData.find((p) => p.patient_id === id);
    // pass current object so the details reflects latest status
    navigate(`/Admin/treatment/view/AdminprecancerousView/${id}`, {
      state: { patient },
    });
  };

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={doAction}
        onCancel={cancelAction}
      />
      <Notification message={notification} />

      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Admin</h1>
        </div>

        <div className="w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Pre-cancerous Patients
          </h2>

          <div className="flex flex-col bg-white w-full rounded-[4px] shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">Patient List</p>

            {/* filters */}
            <div className="flex justify-between flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by patient no, first name, or last name..."
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
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>

              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dobFilter}
                onChange={(e) => setDobFilter(e.target.value)}
              />

              <button className="px-7 rounded-md text-sm bg-[#C5D7E5]">
                Filter
              </button>
            </div>

            {/* table header */}
            <div className="bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                <thead>
                  <tr className="bg-lightblue">
                    <th className="w-[15%] text-center text-sm py-3 !bg-lightblue">
                      Patient no
                    </th>
                    <th className="w-[20%] text-center text-sm py-3">
                      First name
                    </th>
                    <th className="w-[20%] text-center text-sm py-3">
                      Last name
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">
                      Date of birth
                    </th>
                    <th className="w-[10%] text-center text-sm py-3">Status</th>
                    <th className="w-[20%] text-center text-sm py-3">Action</th>
                  </tr>
                </thead>
              </table>

              {/* table body */}
              <div className="max-h-[240px] min-h-[240px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
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
                      <tr key={p.patient_id}>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.patient_id}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.first_name}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.last_name}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {new Date(p.date_of_birth).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="text-center text-sm py-3">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-md ${
                              p.status === "verified"
                                ? "bg-green-50 text-green-600"
                                : p.status === "rejected"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="text-center text-sm py-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleView(p.patient_id)}
                              className="text-white py-1 px-3 rounded-[5px] shadow bg-primary"
                            >
                              View
                            </button>
                            <button
                              onClick={() =>
                                openConfirm(p.patient_id, "verify")
                              }
                              className="text-white py-1 px-3 rounded-[5px] shadow bg-green-500"
                              disabled={p.status === "verified"}
                              title={
                                p.status === "verified"
                                  ? "Already verified"
                                  : ""
                              }
                            >
                              Verify
                            </button>
                            <button
                              onClick={() =>
                                openConfirm(p.patient_id, "reject")
                              }
                              className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500"
                              disabled={p.status === "rejected"}
                              title={
                                p.status === "rejected"
                                  ? "Already rejected"
                                  : ""
                              }
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
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

            {/* pagination */}
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
                  onChange={(e) => setRecordsPerPage(Number(e.target.value))}
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

export default PreCancerous;
