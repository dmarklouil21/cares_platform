import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Printer, CheckCircle, X, Trash2 } from "lucide-react";
import {
  adminListPreCancerousMeds,
  adminVerifyPreCancerousMeds,
  adminRejectPreCancerousMeds,
  adminDonePreCancerousMeds,
} from "src/api/precancerous";

import RemarksModal from "src/components/Modal/RemarksModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal"; // Using your new DateModal

import PreCancerousPrint from "./generate/generate";
import api from "src/api/axiosInstance";

const PreCancerous = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data
  const [modalDesc, setModalDesc] = useState("Confirm before proceeding");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Release Date Verification State
  const [verifyId, setVerifyId] = useState(null);
  const [releaseDateModalOpen, setReleaseDateModalOpen] = useState(false);
  const [releaseDate, setReleaseDate] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Notification State
  const [notification, setNotification] = useState("");

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // Action Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  // --- Data Loading ---
  const loadList = async (status) => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (status && status !== "all") params.status = status;
      const data = await adminListPreCancerousMeds(params);
      setTableData(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  // --- Notification Handling ---
  useEffect(() => {
    const flash = location.state?.flash;
    if (flash) {
      setNotification(flash);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  // --- Filters: Week Logic ---
  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay() || 7; // Sunday=7
    const adjustedDate = date.getDate() + firstDayOfWeek - 1;
    return Math.ceil(adjustedDate / 7);
  };

  useEffect(() => {
    if (monthFilter && yearFilter && tableData.length > 0) {
      const weeksWithData = new Set();
      tableData.forEach((record) => {
        const recordDate = new Date(record.created_at || record.date_submitted);
        const recordMonth = recordDate.getMonth() + 1;
        const recordYear = recordDate.getFullYear();

        if (
          recordMonth === parseInt(monthFilter) &&
          recordYear === parseInt(yearFilter)
        ) {
          const weekNum = getWeekOfMonth(recordDate);
          weeksWithData.add(weekNum);
        }
      });
      setAvailableWeeks(Array.from(weeksWithData).sort((a, b) => a - b));
    } else {
      setAvailableWeeks([]);
      setWeekFilter("");
    }
  }, [monthFilter, yearFilter, tableData]);

  // --- Filtering Logic ---
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const normDate = (v) => (v ? new Date(v) : null);

    const rows = tableData.filter((p) => {
      const matchesSearch =
        !q ||
        String(p.patient.patient_id || "").toLowerCase().includes(q) ||
        (p.patient.first_name || "").toLowerCase().includes(q) ||
        (p.patient.last_name || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      const recordDateObj = normDate(p.created_at || p.date_submitted);
      if (!recordDateObj) return false;

      const recordYear = recordDateObj.getFullYear();
      const recordMonth = recordDateObj.getMonth() + 1;
      const recordDay = recordDateObj.getDate();

      const matchesDay = !dayFilter || recordDay === parseInt(dayFilter);
      const matchesMonth =
        !monthFilter || recordMonth === parseInt(monthFilter);
      const matchesYear =
        !yearFilter || recordYear === parseInt(yearFilter);

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
      return String(a.patient.patient_id || "").localeCompare(
        String(b.patient.patient_id || "")
      );
    });
  }, [
    tableData,
    searchQuery,
    statusFilter,
    dayFilter,
    monthFilter,
    yearFilter,
  ]);

  // --- Pagination ---
  const totalRecords = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));

  useEffect(
    () => setCurrentPage(1),
    [recordsPerPage, searchQuery, statusFilter, totalRecords]
  );

  const paginated = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // --- Action Handlers ---
  const openConfirm = (id, action) => {
    if (action === "verify") {
      setVerifyId(id);
      // Reset date to today or empty when opening modal
      const today = new Date().toISOString().split('T')[0];
      setReleaseDate(today);
      setReleaseDateModalOpen(true);
      return;
    }
    
    let text = "Confirm this action?";
    if (action === "reject") text = "Reject this patient?";
    if (action === "delete") text = "Delete this record?";
    if (action === "done") text = "Mark this request as Done?";
    
    setModalText(text);
    setPendingAction({ id, action });
    setModalOpen(true);
  };

  const handleVerifyConfirm = async () => {
    if (!releaseDate) {
      alert("Please select a date before proceeding.");
      return;
    }

    setReleaseDateModalOpen(false);
    try {
      setVerifyLoading(true);
      // API call to verify
      // await adminVerifyPreCancerousMeds(verifyId, {
      //   release_date_of_meds: releaseDate,
      // });
      let payload = {
        status: "Approved",
        release_date_of_meds: releaseDate,
      };

      // Stop here for now
      await api.patch(`/precancerous/update/${verifyId}/`, payload);

      setNotification(`Request Approved successfully`);
      await loadList(statusFilter); // Refresh list
      setVerifyId(null);
    } catch (e) {
      console.error(e);
      setNotification("Verification failed. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const doAction = async () => {
    if (!pendingAction) return;
    const { id, action } = pendingAction;
    try {
      if (action === "reject") {
        await adminRejectPreCancerousMeds(id);
      } else if (action === "done") {
        await adminDonePreCancerousMeds(id);
      } else if (action === "delete") {
        await api.delete(`/precancerous/delete/${id}/`);
      }
      
      const msg =
        action === "reject"
          ? "Rejected"
          : action === "done"
          ? "marked as Done"
          : "updated";
          
      setNotification(`Request ${id} ${msg} successfully`);
      await loadList(statusFilter);
    } catch (e) {
      setNotification("Action failed. Please try again.");
    } finally {
      setModalOpen(false);
      setPendingAction(null);
    }
  };

  const handleView = (id) => {
    navigate(`/admin/treatment-assistance/view/${id}`);
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Verified: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Done: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Default: "bg-gray-100 text-gray-700",
  };

  const handlePrintReport = () => {
    const originalTitle = document.title;
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    document.title = `Pre_Cancerous_Request_Report - ${formattedDate}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <>
      <style>{`
        :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          #precancerous-root { display: none !important; }
          #print-root { display: block !important; }
          @page { size: Letter; margin: 0 !important; }
          html, body { margin: 0 !important; }
        }
        @media screen {
          #print-root { display: none !important; }
        }
      `}</style>

      {/* PRINT CONTENT */}
      <div id="print-root">
        <PreCancerousPrint rows={filteredResults} />
      </div>

      {/* SCREEN CONTENT */}
      <div id="precancerous-root">
        <ConfirmationModal
          open={modalOpen}
          title={modalText}
          desc={modalDesc}
          onConfirm={doAction}
          onCancel={() => setModalOpen(false)}
        />

        {/* Using New DateModal for Verification Date */}
        <DateModal
          open={releaseDateModalOpen}
          title="Set Medicine Release Date"
          value={releaseDate}
          onChange={setReleaseDate}
          onConfirm={handleVerifyConfirm}
          onCancel={() => setReleaseDateModalOpen(false)}
        />

        <Notification message={notification} />
        
        <RemarksModal
          open={remarksModalOpen}
          title="Remarks"
          placeholder="Enter your remarks here..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          onCancel={() => setRemarksModalOpen(false)}
          confirmText="Confirm"
        />

        {(loading || verifyLoading) && <SystemLoader />}

        <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-[16px] md:text-xl font-bold text-gray-800">
              Pre-Cancerous Medication Request
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintReport}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  loading
                    ? "bg-primary/60 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90"
                }`}
                title={loading ? "Loading data..." : "Print current list"}
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <Link
                to="/admin/treatment-assistance/add-pre-cancerous"
                className="bg-yellow hover:bg-yellow/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
              >
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
                  placeholder="Search by patient ID or name..."
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
                  value={weekFilter}
                  onChange={(e) => setWeekFilter(e.target.value)}
                  disabled={!monthFilter}
                >
                  <option value="">All Weeks</option>
                  {availableWeeks.map((week) => (
                    <option key={week} value={week}>
                      Week {week}
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
                  title="Clear Filters"
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer rounded-md text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="px-6 py-4">
              <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                {/* Table Header */}
                <div className="bg-lightblue px-4 py-3 w-[500px] md:w-[100%]">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                    <div className="col-span-2 text-center">Patient ID</div>
                    <div className="col-span-3 text-center">Patient Name</div>
                    <div className="col-span-2 text-center">Requested To</div>
                    <div className="col-span-2 text-center">Date Submitted</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-center">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="max-h-96 overflow-auto w-[500px] md:w-[100%]">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading records...
                    </div>
                  ) : paginated.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No records found matching your filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {paginated.map((p) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-[12px] md:text-[14px]"
                        >
                          <div
                            className="col-span-2 text-center text-blue-500 cursor-pointer font-medium"
                            onClick={() => handleView(p.id)}
                          >
                            {p.patient.patient_id}
                          </div>
                          <div className="col-span-3 text-center text-gray-800">
                            {p.patient.full_name}
                          </div>
                          <div className="col-span-2 text-center text-gray-800">
                            {p.request_destination === "Rural Health Unit"
                              ? "RHU - "
                              : ""}
                            {p.destination_name}
                          </div>
                          <div className="col-span-2 text-center text-gray-800">
                            {p.created_at
                              ? new Date(p.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
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
                          <div className="col-span-1 flex justify-center gap-2">
                            {p.status === "Pending" ? (
                              <>
                                <button
                                  onClick={() => openConfirm(p.id, "verify")}
                                  className="bg-primary cursor-pointer text-white py-1.5 px-2 rounded transition-colors"
                                  title="Verify"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setRemarksModalOpen(true)}
                                  className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : p.status === "Rejected" ||
                              p.status === "Completed" ? (
                              <button
                                onClick={() => openConfirm(p.id, "delete")}
                                title="Delete"
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => openConfirm(p.id, "delete")}
                                title="Cancel"
                                className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
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
                <div className="text-sm text-gray-600 text-[12px] md:text-sm">
                  Showing {paginated.length} of {totalRecords} records
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="recordsPerPage"
                      className="text-sm text-gray-700 text-[12px] md:text-sm"
                    >
                      Records per page:
                    </label>
                    <select
                      id="recordsPerPage"
                      className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent text-[12px] md:text-sm"
                      value={recordsPerPage}
                      onChange={(e) =>
                        setRecordsPerPage(Number(e.target.value))
                      }
                    >
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] md:text-sm">
                    <span>
                      {Math.min(
                        (currentPage - 1) * recordsPerPage + 1,
                        totalRecords
                      )}{" "}
                      – {Math.min(currentPage * recordsPerPage, totalRecords)}{" "}
                      of {totalRecords}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
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

export default PreCancerous;