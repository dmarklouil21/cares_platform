import { useState, useEffect, act, useRef } from "react";
// Simple Modal component
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
// Notification component for showing popup messages
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
import { useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";

const PreEnrollment = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null); // {beneficiary_id, action}

  // Fetch data function so it can be reused
  const fetchData = async () => {
    try {
      const response = await api.get("/ejacc/pre-enrollment/list/");
      setTableData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching pre-enrollment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [tableData, recordsPerPage]);

  console.log("Table Data: ", tableData);
  const filteredResults =
    tableData.filter((record) => {
      const matchesSearch =
        !searchQuery ||
        record.patient_id?.toString().includes(searchQuery) ||
        record.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;

      const formattedDate = dateFilter
        ? new Date(dateFilter).toISOString().split("T")[0]
        : null;

      const matchesDate =
        !formattedDate || record.created_at === formattedDate;

      return matchesSearch && matchesStatus && matchesDate;
    }) || [];

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // reset to first page
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const totalRecords = filteredResults.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const paginatedData = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Show modal for validate/reject, call API for delete
  const handleActionClick = (patient_id, action) => {
    if (action === "validate") {
      setModalText("Confirm validation?");
      setModalAction({ patient_id, action });
      setModalOpen(true);
    } else if (action === "reject") {
      setModalText("Confirm Rejection?");
      setModalAction({ patient_id, action });
      setModalOpen(true);
    } else if (action === "delete") {
      // Delete does not need confirmation modal
      performAction(patient_id, action);
    }
  };

  // Actually perform the action after confirmation
  const performAction = async (patient_id, action) => {
    try {
      const url = `/ejacc/pre-enrollment/${action}/${patient_id}/`;
      if (action === "delete") {
        await api.delete(url);
      } else {
        await api.patch(url, {
          status: action === "validate" ? "validated" : "rejected",
        });
      }
      let actionWord =
        action === "validate"
          ? "Validated"
          : action === "reject"
          ? "Rejected"
          : action.charAt(0).toUpperCase() + action.slice(1);
      setNotification(`${actionWord} Successfully`);
      fetchData();
      setTimeout(() => setNotification(""), 3500);
    } catch (error) {
      console.error(
        `An error occurred while trying to ${action} this beneficiary`,
        error
      );
      setNotification(`Failed to ${action} beneficiary. Please try again.`);
      setTimeout(() => setNotification(""), 3500);
    }
  };

  // Modal confirm handler
  const handleModalConfirm = () => {
    if (modalAction) {
      performAction(modalAction.patient_id, modalAction.action);
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  // Modal cancel handler (just close modal, no action)
  const handleModalCancel = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleViewClick = (patient_id) => {
    navigate(`/Admin/patient/view/AdminPreenrollmentDetails/${patient_id}`);
  };

  return (
    <>
      {/* Confirmation Modal */}
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
      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Admin</h1>
        </div>
        <div className="w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Pre-Enrollment
          </h2>

          <div className="flex flex-col bg-white w-full rounded-[4px] shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">
              Pre-Enrollment Requests
            </p>

            <div className="flex justify-between flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by beneficiary ID ..."
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

            <div className="bg-white shadow">
              <div className="bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-lightblue">
                      <th className="w-[15%] text-center text-sm py-3 !bg-lightblue">
                        Beneficiary ID
                      </th>
                      <th className="w-[20%] text-center text-sm py-3 ">
                        Name
                      </th>
                      <th className="w-[15%] text-center text-sm py-3 ">
                        Submission Date
                      </th>
                      <th className="w-[15%] text-center text-sm py-3 ">LGU</th>
                      <th className="w-[8.4%] text-center text-sm py-3 ">
                        Status
                      </th>
                      <th className="w-[25%] text-center text-sm py-3 ">
                        Actions
                      </th>
                      {paginatedData.length >= 4 && (
                        <th className="!bg-lightblue w-[1.6%] p-0 m-0"></th>
                      )}
                    </tr>
                  </thead>
                </table>
                <div className="max-h-[200px] min-h-[200px] overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                    <colgroup>
                      <col className="w-[15%]" />
                      <col className="w-[20%] " />
                      <col className="w-[15%]" />
                      <col className="w-[15%]" />
                      <col className="w-[8.4%]" />
                      <col className="w-[25%]" />
                    </colgroup>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData?.map((item) => (
                        <tr key={item.patient_id}>
                          <td className="text-center text-sm py-4 text-gray-800">
                            {item.patient_id}
                          </td>
                          <td className="text-center text-sm py-4 text-gray-800">
                            {item.full_name}
                          </td>
                          <td className="text-center text-sm py-4 text-gray-800">
                            {new Date(item.created_at).toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </td>
                          <td className="text-center text-sm py-4 text-gray-800">
                            {item.city}
                          </td>
                          <td className="text-center text-sm py-4 text-gray-800">
                            <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-md bg-amber-50 text-amber-600">
                              {item.status}
                            </span>
                          </td>
                          <td className="text-center text-sm py-4 flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                handleViewClick(item.patient_id)
                              }
                              className="text-white py-1 px-3 rounded-[5px] shadow bg-primary"
                            >
                              View
                            </button>
                            {item.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleActionClick(
                                    item.patient_id,
                                    "validate"
                                  )
                                }
                                className="text-white py-1 px-3 rounded-[5px] shadow bg-green-500"
                              >
                                Validate
                              </button>
                            )}
                            {item.status === "pending" ? (
                              <button
                                onClick={() =>
                                  handleActionClick(
                                    item.patient_id,
                                    "reject"
                                  )
                                }
                                className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500"
                              >
                                Reject
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleActionClick(
                                    item.patient_id,
                                    "delete"
                                  )
                                }
                                className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {paginatedData?.length === 0 && (
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
            </div>

            {/* Footer Pagination */}
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
                  {/* 1 – 10 of {filteredData.length} */}
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

export default PreEnrollment;
