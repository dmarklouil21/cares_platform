import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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

const sampleData = [
  {
    id: "HV-101",
    patient_id: "S-10231",
    patient_name: "Lara Mendoza",
    diagnosis: "Breast CA post-op",
    date: "2025-10-05",
    status: "Pending",
  },
  {
    id: "HV-102",
    patient_id: "S-08977",
    patient_name: "Rico Balagtas",
    diagnosis: "Colon CA on chemo",
    date: "2025-10-02",
    status: "Approved",
  },
  {
    id: "HV-103",
    patient_id: "S-04566",
    patient_name: "Mika Salvador",
    diagnosis: "Thyroid nodules",
    date: "2025-09-28",
    status: "Completed",
  },
  {
    id: "HV-104",
    patient_id: "S-11002",
    patient_name: "Jomar Uy",
    diagnosis: "Cervical lymphadenopathy",
    date: "2025-10-06",
    status: "Pending",
  },
];

const HomeVisit = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState(sampleData);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [notification, setNotification] = useState("");

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const s = statusFilter;
    const d = dateFilter || null;
    return tableData.filter((row) => {
      const matchesSearch =
        !q ||
        (row.patient_id || "").toLowerCase().includes(q) ||
        (row.patient_name || "").toLowerCase().includes(q) ||
        (row.diagnosis || "").toLowerCase().includes(q);
      const matchesStatus =
        s === "all" || (row.status || "").toLowerCase() === s;
      const matchesDate = !d || row.date === d;
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
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={doAction}
        onCancel={cancelAction}
      />
      <Notification message={notification} />
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center  bg-gray">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Home visit requests
          </h2>
          <Link
            to="/admin/survivorship/add"
            className="bg-yellow px-5 py-1 rounded-sm text-white"
          >
            Add
          </Link>
        </div>

        <div className="flex flex-col bg-white w-full rounded-[4px] shadow-md px-5 py-3 gap-3">
          <p className="text-md font-semibold text-yellow">Request List</p>
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
          </div>
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
                    <tr key={p.id}>
                      <td className="text-center text-sm py-3 text-gray-800">
                        {p.patient_id}
                      </td>
                      <td className="text-center text-sm py-3 text-gray-800">
                        {p.patient_name}
                      </td>
                      <td className="text-center text-sm py-3 text-gray-800">
                        {p.diagnosis}
                      </td>
                      <td className="text-center text-sm py-3 text-gray-800">
                        {new Date(p.date).toLocaleDateString("en-US", {
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
                              <button
                                onClick={() => openConfirm(p.id, "accept")}
                                className="text-white py-1 px-2 rounded-[5px] shadow bg-green-500"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => openConfirm(p.id, "reject")}
                                className="text-white py-1 px-2 rounded-[5px] shadow bg-red-500"
                              >
                                Reject
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
          <div className="flex justify-end items-center py-2 gap-5">
            <div className="flex items-center gap-2">
              <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
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
                {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)}{" "}
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
    </>
  );
};

export default HomeVisit;
