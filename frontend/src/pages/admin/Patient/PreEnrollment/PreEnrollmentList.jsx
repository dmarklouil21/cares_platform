import { useState, useEffect, act, useRef } from "react";
import GeneratePrintTemplate from "./generate/generate";
import { Printer, FileText, FileDown } from "lucide-react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";

import { useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";

const PreEnrollmentList = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [modalDesc, setModalDesc] = useState(
    "Are you sure you want to proceed with this action?"
  );

  const [dateFilter, setDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [notificationMessage, setNotificationMessage] = useState(
    location.state?.message || ""
  );

  // Fetch data function so it can be reused
  const fetchData = async () => {
    try {
      const response = await api.get("/patient/list/?status=pending");
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

  const filteredResults =
    tableData.filter((record) => {
      const matchesSearch =
        !searchQuery ||
        record.patient_id?.toString().includes(searchQuery) ||
        record.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;

      if (!record.created_at) return false;
      const recordDate = new Date(record.created_at);
      if (isNaN(recordDate)) return false;

      const recordDateString = recordDate.toISOString().split("T")[0];
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();

      const matchesDate = !dateFilter || recordDateString === dateFilter;
      const matchesMonth =
        !monthFilter || recordMonth === parseInt(monthFilter);
      const matchesYear = !yearFilter || recordYear === parseInt(yearFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate &&
        matchesMonth &&
        matchesYear
      );
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
      const url = `/patient/pre-enrollment/${action}/${patient_id}/`;
      if (action === "reject") {
        await api.delete(url);
      } else {
        const patient = tableData.find((p) => p.patient_id === patient_id);
        await api.patch(url, {
          ...patient,
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
      setNotificationType("success");
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
    navigate(`/admin/patient/view/pre-enrollment/${patient_id}`);
  };

  return (
    <>
      {/* --- Print rules: only show GeneratePrintTemplate during print --- */}
      <style>
        {`
          @media print {
            #preenrollment-root { display: none !important; }
            #print-root { display: block !important; }
          }
          @media screen {
            #print-root { display: none !important; }
          }
          /* inside a <style> tag in the component */
            .preenroll-table { border-collapse: collapse; }
            .preenroll-table, .preenroll-table th, .preenroll-table td, .preenroll-table tr {
              border: 0 !important;
          }
        `}
      </style>

      {/* --- PRINT-ONLY CONTENT --- */}
      <div id="print-root">
        <GeneratePrintTemplate rows={filteredResults} />
      </div>

      {/* --- SCREEN CONTENT --- */}
      <div
        id="preenrollment-root"
        className="h-full overflow-auto w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray"
      >
        {/* Confirmation Modal */}
        <ConfirmationModal
          open={modalOpen}
          title={modalText}
          desc={modalDesc}
          onConfirm={handleModalConfirm}
          onCancel={() => {
            setModalOpen(false);
            setModalAction(null);
            setModalText("");
          }}
        />
        <Notification message={notification} type={notificationType} />

        <h2 className="text-xl font-bold text-left w-full pl-1">
          Pre-Enrollment
        </h2>

        <div className="flex flex-col bg-white w-full rounded-md shadow-md px-5 py-5 gap-3">
          <p className="text-md font-semibold text-yellow">
            Manage Pre-Enrollment Requests
          </p>

          <div className="flex justify-between flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search by beneficiary ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 py-2 w-[360px] px-5 rounded-md"
            />
            {/* Status Filter */}
            <select
              className="border border-gray-200 rounded-md p-2 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              {/* Add others if needed */}
            </select>
            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setMonthFilter("");
                setYearFilter("");
              }}
              className="border border-gray-200 rounded-md p-2 bg-white"
            />

            {/* Month Filter */}
            <select
              className="border border-gray-200 rounded-md p-2 bg-white"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setDateFilter("");
              }}
            >
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              className="border border-gray-200 rounded-md p-2 bg-white"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setDateFilter("");
              }}
            >
              <option value="">All Years</option>
              {Array.from(
                new Set(
                  tableData
                    .map((r) => new Date(r.created_at).getFullYear())
                    .filter((y) => !isNaN(y))
                )
              )
                .sort((a, b) => b - a)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDateFilter("");
                setMonthFilter("");
                setYearFilter("");
              }}
              className="ml-2 px-3 py-2 hover:bg-lightblue bg-primary text-white cursor-pointer rounded-md text-sm"
            >
              Clear
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 font-bold cursor-pointer rounded-md text-sm text-white bg-primary"
            >
              <Printer className="w-4 h-4" />
              {/* Generate */}
            </button>
          </div>

          <div className="bg-white shadow overflow-auto">
            <table className="min-w-full divide-y preenroll-table divide-gray-200 border-separate border-spacing-0">
              <thead>
                <tr className="bg-lightblue">
                  <th className="w-[15%] text-center text-sm py-3 !bg-lightblue">
                    Beneficiary ID
                  </th>
                  <th className="w-[20%] text-center text-sm py-3 ">Name</th>
                  <th className="w-[15%] text-center text-sm py-3 ">
                    Submission Date
                  </th>
                  <th className="w-[15%] text-center text-sm py-3 ">LGU</th>
                  <th className="w-[8.4%] text-center text-sm py-3 ">Status</th>
                  <th className="w-[25%] text-center text-sm py-3 ">Actions</th>
                  {paginatedData.length >= 4 && (
                    <th className="!bg-lightblue w-[1.6%] p-0 m-0"></th>
                  )}
                </tr>
              </thead>
            </table>
            <div className="max-h-[200px] min-h-[200px] overflow-auto">
              <table className="min-w-full divide-y preenroll-table divide-gray-200 border-separate border-spacing-0">
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
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
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
                          onClick={() => handleViewClick(item.patient_id)}
                          className="text-white py-1 px-3 rounded-[5px] shadow bg-primary"
                        >
                          View
                        </button>
                        {item.status === "pending" && (
                          <button
                            onClick={() =>
                              handleActionClick(item.patient_id, "validate")
                            }
                            className="text-white py-1 px-3 rounded-[5px] shadow bg-green-500"
                          >
                            Validate
                          </button>
                        )}
                        {item.status === "pending" ? (
                          <button
                            onClick={() =>
                              handleActionClick(item.patient_id, "reject")
                            }
                            className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500"
                          >
                            Reject
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleActionClick(item.patient_id, "delete")
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
    </>
  );
};

export default PreEnrollmentList;
