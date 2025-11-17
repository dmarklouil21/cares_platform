import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Printer, Plus, Eye, CheckCircle, X, CheckCheck, Pencil, Trash2 } from "lucide-react";
import {
  adminListPreCancerousMeds,
  adminVerifyPreCancerousMeds,
  adminRejectPreCancerousMeds,
  adminDonePreCancerousMeds,
} from "src/api/precancerous";
import api from "src/api/axiosInstance";

// Import components
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";

// Import calendar components if needed
// import MiniCalendar from "src/components/MiniCalendar";
// import VerifyModal from "src/components/VerifyModal";

const PreCancerous = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data state
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Verify modal states
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyDate, setVerifyDate] = useState("");
  const [verifyId, setVerifyId] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Pagination
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadList = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/rhu/pre-cancerous/list/");
      setTableData(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      setError("Failed to load records.");
      setNotification("Failed to load records.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  // Handle flash messages
  useEffect(() => {
    const flash = location.state?.flash;
    if (flash) {
      setNotification(flash);
      setNotificationType("success");
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => setNotification(""), 3000);
    }
  }, [location.state, location.pathname, navigate]);

  // Filter data
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const rows = tableData.filter((p) => {
      const matchesSearch =
        !q ||
        String(p.patient.patient_id || "").toLowerCase().includes(q) ||
        (p.patient.first_name || "").toLowerCase().includes(q) ||
        (p.patient.last_name || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      const createdAt = new Date(p.created_at || p.date_submitted);
      const recordDay = createdAt.getDate();
      const recordMonth = createdAt.getMonth() + 1;
      const recordYear = createdAt.getFullYear();

      const matchesDay = !dayFilter || Number(dayFilter) === recordDay;
      const matchesMonth = !monthFilter || Number(monthFilter) === recordMonth;
      const matchesYear = !yearFilter || Number(yearFilter) === recordYear;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDay &&
        matchesMonth &&
        matchesYear
      );
    });

    return rows.sort((a, b) => {
      const la = (a.patient.last_name || "").toLowerCase();
      const lb = (b.patient.last_name || "").toLowerCase();
      if (la !== lb) return la.localeCompare(lb);
      const fa = (a.patient.first_name || "").toLowerCase();
      const fb = (b.patient.first_name || "").toLowerCase();
      if (fa !== fb) return fa.localeCompare(fb);
      return String(a.patient.patient_id || "").localeCompare(
        String(b.patient.patient_id || "")
      );
    });
  }, [tableData, searchQuery, statusFilter, dayFilter, monthFilter, yearFilter]);

  const totalRecords = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage, searchQuery, statusFilter, totalRecords]);

  const paginated = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Action handlers
  const openConfirm = (id, action) => {
    if (action === "verify") {
      setVerifyId(id);
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setVerifyDate(`${yyyy}-${mm}-${dd}`);
      setVerifyOpen(true);
      return;
    }
    
    let text = "Confirm this action?";
    if (action === "reject") text = "Reject this application?";
    else if (action === "delete") text = "Delete this application?";
    else if (action === "cancel") text = "Cancel this application?";
    // if (action === "done") text = "Mark this request as Done?";
    
    setModalText(text);
    setModalDesc("Please confirm before proceeding.");
    setModalAction({ id, action });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (!modalAction) return;
    const { id, action } = modalAction;
    try {
      if (action === "reject") {
        await adminRejectPreCancerousMeds(id);
      } else if (action === "done") {
        await adminDonePreCancerousMeds(id);
      }
      await loadList();
      const msg = action === "reject" ? "Rejected" : "marked as Done";
      setNotification(`Request ${id} ${msg} successfully`);
      setNotificationType("success");
      setTimeout(() => setNotification(""), 2000);
    } catch (e) {
      setNotification("Action failed. Please try again.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
    } finally {
      setModalOpen(false);
      setModalAction(null);
    }
  };

  const confirmVerify = async () => {
    if (!verifyId || !verifyDate) return;
    try {
      setVerifyLoading(true);
      await adminVerifyPreCancerousMeds(verifyId, {
        release_date_of_meds: verifyDate,
      });
      await loadList();
      setNotification(`Request ${verifyId} Verified successfully`);
      setNotificationType("success");
      setTimeout(() => setNotification(""), 2000);
    } catch (e) {
      setNotification("Verification failed. Please try again.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
    } finally {
      setVerifyLoading(false);
      setVerifyOpen(false);
      setVerifyId(null);
      setVerifyDate("");
    }
  };

  const handleView = (id) => {
    navigate(`/rhu/treatment-assistance/pre-cancerous/view/${id}`);
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Verified: "bg-green-100 text-green-700",
    Approved: "bg-green-100 text-green-700",
    Done: "bg-blue-100 text-blue-700",
    Completed: "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
    Default: "bg-gray-100 text-gray-700",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {loading && <SystemLoader />}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <Notification message={notification} type={notificationType} />

      {/* Verify Modal - You'll need to implement this component */}
      {verifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Set Release Date</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Release Date</label>
              <input
                type="date"
                value={verifyDate}
                onChange={(e) => setVerifyDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setVerifyOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
                disabled={verifyLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmVerify}
                className="px-4 py-2 bg-primary text-white rounded-md"
                disabled={!verifyDate || verifyLoading}
              >
                {verifyLoading ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-gray-800">
            Pre-Cancerous Medication Request
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white cursor-pointer rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <Link
              to="/rhu/treatment-assistance/pre-cancerous/add"
              className="bg-yellow hover:bg-yellow/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              {/* <Plus className="w-4 h-4" /> */}
              Add New
            </Link>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              Manage Pre-Cancerous Medication Request
            </h3>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search by patient no, first name, or last name..."
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
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
                <option value="Done">Done</option>
              </select>

              {/* Day Filter */}
              <select
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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

              {/* Month Filter */}
              <select
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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

              {/* Year Filter */}
              <select
                className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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
                title="Clear Filters"
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
              >
                {/* Clear Filters */}
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="px-6 py-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-lightblue px-4 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-2 text-center">Patient ID</div>
                  <div className="col-span-2 text-center">Patient Name</div>
                  <div className="col-span-2 text-center">Requested To</div>
                  <div className="col-span-2 text-center">Date Submitted</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-auto">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading...
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pre-cancerous medication requests found matching your filters.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {paginated.map((p) => (
                      <div
                        key={p.id}
                        className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm"
                      >
                        <div 
                          className="col-span-2 text-center text-blue-500 cursor-pointer font-medium"
                          onClick={() => handleView(p.id)}
                        >
                          {p.patient.patient_id}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {p.patient.full_name}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {p.request_destination === "Rural Health Unit" ? "RHU - " : ""}
                          {p.destination_name}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {formatDate(p.created_at)}
                        </div>
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[p.status] || statusColors.Default
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-center gap-2">
                          {/* <button
                            onClick={() => handleView(p.id)}
                            className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded transition-colors"
                            title="View Request"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button> */}
                          
                          {p.status === "Pending" ? (
                            <>
                              <button
                                onClick={() => openConfirm(p.id, "verify")}
                                className="bg-primary cursor-pointer text-white py-1.5 px-2 rounded transition-colors"
                                title="Verify Request"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openConfirm(p.id, "reject")}
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                                title="Reject Request"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : p.status !== "Completed" || p.status !== "Rejected" ? (
                            <button
                              onClick={() => openConfirm(p.id, "delete")}
                              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                              title="Reject Request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirm(p.id, "cancel")}
                              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                              title="Reject Request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* {p.status === "Completed" || p.status === "Rejected" && (
                            <button
                              onClick={() => openConfirm(p.id, "reject")}
                              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                              title="Reject Request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )} */}
                          
                          {p.status === "Verified" && (
                            <button
                              onClick={() => openConfirm(p.id, "done")}
                              className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white py-1.5 px-2 rounded transition-colors"
                              title="Mark as Done"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
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
              <div className="flex items-center gap-2">
                <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                  Records per page:
                </label>
                <select
                  id="recordsPerPage"
                  className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={recordsPerPage}
                  onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)} -{" "}
                  {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreCancerous;