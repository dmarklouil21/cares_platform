import React, { useEffect, useState } from "react";
import ConfirmationModal from "src/components/ConfirmationModal";
import { useNavigate } from "react-router-dom";

// ---- Inline Sample Data (Pre-cancerous Meds applications) ----
const SAMPLE_PRE_CANCEROUS_APPS = [
  {
    id: "PCM-2025-001",
    patientNo: "P-0001",
    lastName: "Dela Cruz",
    firstName: "Maria",
    middleInitial: "S.",
    dateOfBirth: "1990-05-12",
    interpretationOfResult: "HPV Positive",
    status: "Pending",
    created_at: "2025-04-12T08:30:00Z",
    release_date_of_meds: "2025-04-20",
  },
  {
    id: "PCM-2025-002",
    patientNo: "P-0002",
    lastName: "Garcia",
    firstName: "Jose",
    middleInitial: "R.",
    dateOfBirth: "1987-11-03",
    interpretationOfResult: "ASC-US",
    status: "Approved",
    created_at: "2025-04-13T10:05:00Z",
    release_date_of_meds: "2025-04-20",
  },
  {
    id: "PCM-2025-003",
    patientNo: "P-0003",
    lastName: "Ytac",
    firstName: "Kimberly",
    middleInitial: "F.",
    dateOfBirth: "1999-02-22",
    interpretationOfResult: "Negative",
    status: "Rejected",
    created_at: "2025-04-15T14:22:00Z",
    release_date_of_meds: "2025-04-20",
  },
  {
    id: "PCM-2025-004",
    patientNo: "P-0004",
    lastName: "Alreach",
    firstName: "Stayve",
    middleInitial: "",
    dateOfBirth: "2001-07-15",
    interpretationOfResult: "Unsatisfactory",
    status: "Pending",
    created_at: "2025-04-16T09:00:00Z",
    release_date_of_meds: "2025-04-20",
  },
];

const PreCancerStatus = () => {
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [notification, setNotification] = useState("");

  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null); // { type: "cancel", id }

  // Simulate fetch from server, but using inline sample data
  const fetchData = async () => {
    setTableData(SAMPLE_PRE_CANCEROUS_APPS);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Cancel flow (no loading modal, just top banner notification)
  const handleCancel = (id) => {
    setModalText("Are you sure you want to cancel this application?");
    setModalAction({ type: "cancel", id });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "cancel") {
      // update local status to Cancelled
      setTableData((prev) =>
        prev.map((r) =>
          r.id === modalAction.id ? { ...r, status: "Cancelled" } : r
        )
      );

      // show top-center notification only
      setNotification("Application cancelled successfully.");
      setTimeout(() => setNotification(""), 3000);
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalText("");
    setModalAction(null);
  };

  // View — navigate and pass a patient object that matches AdminprecancerousView.jsx needs
  const handleView = (id) => {
    const app = tableData.find((r) => r.id === id);
    if (!app) return;

    const patient = {
      patient_id: app.patientNo,
      first_name: app.firstName,
      last_name: app.lastName,
      middle_initial: app.middleInitial || "",
      date_of_birth: app.dateOfBirth,
      status: (app.status || "").toLowerCase(),
      interpretation_of_result: app.interpretationOfResult,
      // ✅ Pass the release date so the view can display it
      release_date_of_meds: app.release_date_of_meds,
    };

    // You can keep the :id segment or remove it if your route doesn't use params
    navigate(`/Beneficiary/applicationstatus/view/precancerous/${id}`, {
      state: { patient },
    });
  };

  // Helpers
  const getCreatedAt = (rec) => rec?.created_at || rec?.createdAt || "";

  // Filters
  const filteredData = tableData.filter((record) => {
    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      record.patientNo.toLowerCase().includes(query) ||
      record.lastName.toLowerCase().includes(query) ||
      record.firstName.toLowerCase().includes(query) ||
      record.interpretationOfResult.toLowerCase().includes(query);

    const normalizedFilter = (statusFilter || "All").toLowerCase();
    const statusMatch =
      normalizedFilter === "all" ||
      record.status.toLowerCase() === normalizedFilter;

    const recDate = getCreatedAt(record)
      ? new Date(getCreatedAt(record)).toISOString().split("T")[0]
      : "";
    const dateMatch = !dateFilter || recDate === dateFilter;

    return searchMatch && statusMatch && dateMatch;
  });

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      {/* Top-center notification (only shown when `notification` has content) */}
      {notification && (
        <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
          <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
            <img
              src="/images/logo_white_notxt.png"
              alt="Rafi Logo"
              className="h-[25px]"
            />
            <span>{notification}</span>
          </div>
        </div>
      )}

      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <div className="font-bold">Beneficiary</div>
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <img
              src="/images/Avatar.png"
              alt="User Profile"
              className="rounded-full"
            />
          </div>
        </div>

        <div className="w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Pre-cancerous Meds Applications
          </h2>

          <div className="flex flex-col bg-white rounded-[4px] w-full shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow mb-3">
              Application List
            </p>

            <div className="flex justify-between flex-wrap gap-3 mb-3">
              <input
                type="text"
                placeholder="Search by Patient No. or name..."
                className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="border border-gray-200 rounded-md p-2 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <button
                className="px-7 rounded-md text-sm bg-[#C5D7E5]"
                onClick={(e) => e.preventDefault()}
              >
                Filter
              </button>
            </div>

            <div className="bg-white shadow">
              {/* Header: 6 columns only */}
              <table className="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[18%]" />
                  <col className="w-[14%]" />
                  <col className="w-[22%]" />
                  <col className="w-[12%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr className="bg-lightblue">
                    <th className="text-center text-sm py-3 !bg-lightblue">
                      Patient No.
                    </th>
                    <th className="text-center text-sm py-3">Last Name</th>
                    <th className="text-center text-sm py-3">First Name</th>
                    <th className="text-center text-sm py-3">Interpretation</th>
                    <th className="text-center text-sm py-3">Status</th>
                    <th className="text-center text-sm py-3">Actions</th>
                  </tr>
                </thead>
              </table>

              {/* Body */}
              <div className="max-h-[277px] min-h-[277px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 border-spacing-0">
                  <colgroup>
                    <col className="w-[16%]" />
                    <col className="w-[18%]" />
                    <col className="w-[14%]" />
                    <col className="w-[22%]" />
                    <col className="w-[12%]" />
                    <col className="w-[18%]" />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-gray-500"
                        >
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((app) => (
                        <tr key={app.id}>
                          <td className="py-2 text-sm text-center text-[#333333]">
                            {app.patientNo}
                          </td>
                          <td className="py-2 text-sm text-center text-[#333333]">
                            {app.lastName}
                          </td>
                          <td className="py-2 text-sm text-center text-[#333333]">
                            {app.firstName}
                          </td>
                          <td className="py-2 text-sm text-center text-[#333333]">
                            {app.interpretationOfResult}
                          </td>
                          <td className="py-2 text-sm text-center text-[#333333]">
                            {app.status === "Pending" && (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FFEFD5] text-[#FF8C00]">
                                Pending
                              </span>
                            )}
                            {app.status === "Approved" && (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700">
                                Approved
                              </span>
                            )}
                            {app.status === "Rejected" && (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FFCDD2] text-[#D32F2F]">
                                Rejected
                              </span>
                            )}
                            {app.status === "Cancelled" && (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-700">
                                Cancelled
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                className="text-white py-1 px-3 rounded-md shadow bg-primary cursor-pointer"
                                onClick={() => handleView(app.id)}
                              >
                                View
                              </button>

                              {app.status === "Pending" && (
                                <button
                                  type="button"
                                  className="text-white py-1 px-3 rounded-md shadow bg-red-500 cursor-pointer"
                                  onClick={() => handleCancel(app.id)}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreCancerStatus;
