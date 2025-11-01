import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Info, CheckCircle, X, Trash2 } from "lucide-react";

import GeneratePrintTemplate from "./generate/generate";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";
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

  // Date filters
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  // Fetch data function
  const fetchData = async () => {
    try {
      const response = await api.get("/patient/list/?status=pending");
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching pre-enrollment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [tableData, recordsPerPage]);

  const filteredResults = tableData.filter((record) => {
    const matchesSearch =
      !searchQuery ||
      record.patient_id?.toString().includes(searchQuery) ||
      record.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    if (!record.created_at) return false;
    const recordDate = new Date(record.created_at);
    if (isNaN(recordDate)) return false;

    const recordDay = recordDate.getDate();
    const recordMonth = recordDate.getMonth() + 1;
    const recordYear = recordDate.getFullYear();

    const matchesDay = !dayFilter || recordDay === parseInt(dayFilter);
    const matchesMonth = !monthFilter || recordMonth === parseInt(monthFilter);
    const matchesYear = !yearFilter || recordYear === parseInt(yearFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDay &&
      matchesMonth &&
      matchesYear
    );
  });

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
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

  const handleViewClick = (patient_id) => {
    navigate(`/admin/patient/view/pre-enrollment/${patient_id}`);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    validated: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    Default: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <style>
        {`
          @media print {
            #preenrollment-root { display: none !important; }
            #print-root { display: block !important; }
          }
          @media screen {
            #print-root { display: none !important; }
          }
          .preenroll-table { border-collapse: collapse; }
          .preenroll-table, .preenroll-table th, .preenroll-table td, .preenroll-table tr {
            border: 0 !important;
          }
        `}
      </style>

      {/* PRINT CONTENT */}
      <div id="print-root">
        <GeneratePrintTemplate rows={filteredResults} />
      </div>

      {/* SCREEN CONTENT */}
      <div id="preenrollment-root">
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

        <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-gray-800">
              Pre-Enrollment
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-yellow-600">
                Manage Pre-Enrollment Requests
              </h3>
            </div>

            {/* Filters Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search by beneficiary ID or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-sm"
                />

                <select
                  className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                </select>

                {/* Date Filters */}
                <select
                  className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                >
                  <option value="">All Days</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <select
                  className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  <option value="">All Months</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("en", { month: "long" })}
                    </option>
                  ))}
                </select>

                <select
                  className="border border-gray-300 py-2 px-3 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="">All Years</option>
                  {Array.from(
                    new Set(
                      tableData.map((p) =>
                        new Date(p.created_at || p.date_submitted).getFullYear()
                      )
                    )
                  )
                    .filter((y) => !isNaN(y))
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDayFilter("");
                    setMonthFilter("");
                    setYearFilter("");
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="px-6 py-4">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-lightblue px-4 py-3">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                    <div className="col-span-2 text-center">Beneficiary ID</div>
                    <div className="col-span-3 text-center">Name</div>
                    <div className="col-span-2 text-center">Date Submitted</div>
                    <div className="col-span-1 text-center">LGU</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="max-h-96 overflow-auto">
                  {paginatedData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No records found matching your filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {paginatedData.map((item) => (
                        <div
                          key={item.patient_id}
                          className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm"
                        >
                          <div 
                            className="col-span-2 text-center text-blue-500 cursor-pointer font-medium"
                            onClick={() => handleViewClick(item.patient_id)}
                          >
                            {item.patient_id}
                          </div>
                          <div className="col-span-3 text-center text-gray-800">
                            {item.full_name}
                          </div>
                          <div className="col-span-2 text-center text-gray-800">
                            {new Date(item.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="col-span-1 text-center text-gray-800">
                            {item.city}
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                statusColors[item.status] || statusColors.Default
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <div className="col-span-2 flex justify-center gap-2">
                            {/* <button
                              onClick={() => handleViewClick(item.patient_id)}
                              className="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
                            >
                              View
                            </button> */}
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleActionClick(item.patient_id, "validate")
                                  }
                                  className="bg-primary cursor-pointer text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                >
                                  <CheckCircle className="w-3.5 h-3.5"/>
                                </button>
                                <button
                                  onClick={() =>
                                    handleActionClick(item.patient_id, "reject")
                                  }
                                  className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                >
                                  <X className="w-3.5 h-3.5"/>
                                </button>
                              </>
                            )}
                            {item.status !== "pending" && (
                              <button
                                onClick={() =>
                                  handleActionClick(item.patient_id, "delete")
                                }
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 px-2">
                <div className="text-sm text-gray-600">
                  Showing {paginatedData.length} of {totalRecords} records
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                      Records per page:
                    </label>
                    <select
                      id="recordsPerPage"
                      className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={recordsPerPage}
                      onChange={handleRecordsPerPageChange}
                    >
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)}{" "}
                      – {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                      {totalRecords}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreEnrollmentList;