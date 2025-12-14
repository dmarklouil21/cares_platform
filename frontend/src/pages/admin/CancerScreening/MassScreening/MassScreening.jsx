import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { Printer, CheckCircle, X, Trash2 } from "lucide-react";

import {
  listAdminMassScreenings,
  setAdminMassScreeningStatus,
} from "src/api/massScreening";

import RemarksModal from "src/components/Modal/RemarksModal";
import Notification from "src/components/Notification";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";

import GeneratePrintTemplate from "./generate/generate";

const AdminMassScreening = () => {
  // Data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listAdminMassScreenings();
      const normalized = (Array.isArray(data) ? data : []).map((d) => ({
        id: d.id,
        rhuName: d.rhu_lgu,
        privateName: d.institution_name,
        date: d.date,
        venue: d.venue,
        status: d.status,
        attachments: d.attachments || [],
      }));
      setItems(normalized);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Failed to load mass screening requests.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  // Pagination
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [weekFilter, setWeekFilter] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // ✅ Function to get Week of Month (Week 1–4)
  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay() || 7; // Sunday=7
    const adjustedDate = date.getDate() + firstDayOfWeek - 1;
    return Math.ceil(adjustedDate / 7);
  };
  // ✅ Update week options dynamically per selected month and year
  useEffect(() => {
    if (monthFilter && yearFilter && items.length > 0) {
      const weeksWithData = new Set();

      items.forEach((record) => {
        const recordDate = new Date(record.date);
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

      const sortedWeeks = Array.from(weeksWithData).sort((a, b) => a - b);
      setAvailableWeeks(sortedWeeks);
    } else {
      setAvailableWeeks([]);
      setWeekFilter("");
    }
  }, [monthFilter, yearFilter, items]);

  const filteredData = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();

    return items.filter((it) => {
      const matchesStatus =
        statusFilter === "all" ? true : (it.status ?? "") === statusFilter;

      if (!it.date) return false;
      const recordDate = new Date(it.date);
      if (isNaN(recordDate)) return false;

      const recordDay = recordDate.getDate();
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();
      const recordWeek = getWeekOfMonth(recordDate); // ✅ NEW

      const matchesDay = !dayFilter || recordDay === parseInt(dayFilter);
      const matchesMonth =
        !monthFilter || recordMonth === parseInt(monthFilter);
      const matchesYear = !yearFilter || recordYear === parseInt(yearFilter);
      const matchesWeek = !weekFilter || recordWeek === parseInt(weekFilter); // ✅ NEW

      const matchesSearch =
        !s ||
        String(it.id).toLowerCase().includes(s) ||
        (it.rhuName || "").toLowerCase().includes(s) ||
        (it.privateName || "").toLowerCase().includes(s);

      return (
        matchesStatus &&
        matchesSearch &&
        matchesDay &&
        matchesMonth &&
        matchesYear &&
        matchesWeek // ✅ NEW
      );
    });
  }, [
    items,
    statusFilter,
    dayFilter,
    monthFilter,
    yearFilter,
    weekFilter, // ✅ include dependency
    searchQuery,
  ]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dayFilter, monthFilter, yearFilter]);

  // View / Actions
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewClick = (id) => {
    const record = items.find((x) => x.id === id);
    navigate("/admin/cancer-screening/view/mass-view", {
      state: { record: record ?? { id } },
    });
  };

  const [confirm, setConfirm] = useState({ open: false, action: "", id: null });
  const askConfirm = (action, id) => {
    let title = "";
    let desc = "Please confirm your action.";

    switch (action) {
      case "verify":
        title = "Verify this request?";
        desc = "Are you sure you want to verify this request?";
        break;
      case "reject":
        title = "Reject this request?";
        desc = "Are you sure you want to reject this request?";
        break;
      case "done":
        title = "Mark as done?";
        desc = "Are you sure you want to mark this request as done?";
        break;
      default:
        title = "Confirm action?";
    }

    setConfirm({ open: true, action, id, title, desc });
  };

  const closeConfirm = () => setConfirm({ open: false, action: "", id: null });

  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [notificationMessage, setNotificationMessage] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    if (notificationType && notificationMessage) {
      setNotification(notificationMessage);
      navigate(location.pathname, { replace: true, state: {} });
      const t = setTimeout(() => setNotification(""), 2000);
      return () => clearTimeout(t);
    }
  }, [notificationType, notificationMessage, navigate, location.pathname]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(""), 2500);
    return () => clearTimeout(t);
  }, [notification]);

  const doConfirm = async () => {
    const { action, id } = confirm;
    closeConfirm();
    try {
      if (!id || !action) return;
      await setAdminMassScreeningStatus(id, action);
      await loadItems();

      let msg = "";
      if (action === "verify") msg = "Request verified successfully.";
      else if (action === "reject") msg = "Request rejected.";
      else if (action === "done") msg = "Marked as done.";

      setNotificationType("success");
      setNotificationMessage(msg);
      setNotification(msg);
    } catch (e) {
      const msg = e?.response?.data?.detail || "Failed to update status.";
      setNotificationType("error");
      setNotificationMessage(msg);
      setNotification(msg);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Verified: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Done: "bg-blue-100 text-blue-700",
    Default: "bg-gray-100 text-gray-700",
  };
  const handlePrintReport = () => {
    // 1. Save original title
    const originalTitle = document.title;

    // 2. Create new title
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    // You can change this title to whatever you like
    const newTitle = `Mass_Screening_Request_Report - ${formattedDate}`;

    // 3. Set new title
    document.title = newTitle;

    // 4. Call print
    window.print();

    // 5. Restore title
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000); // 1-second delay
  };
  return (
    <>
      <style>{`
        @media print {
          #mass-root { display: none !important; }
          #print-root { display: block !important; }
        }
        @media screen {
          #print-root { display: none !important; }
        }
        .mass-table { border-collapse: collapse; }
        .mass-table, .mass-table th, .mass-table td, .mass-table tr { border: 0 !important; }
      `}</style>

      {/* PRINT CONTENT */}
      <div id="print-root">
        <GeneratePrintTemplate rows={filteredData} />
      </div>

      {/* SCREEN CONTENT */}
      <div id="mass-root">
        <Notification message={notification} type={notificationType} />

        <ConfirmationModal
          open={confirm.open}
          title={confirm.title}
          desc={confirm.desc}
          onConfirm={doConfirm}
          onCancel={closeConfirm}
        />

        <RemarksModal
          open={remarksModalOpen}
          title="Remarks"
          placeholder="Enter your remarks here..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          onCancel={() => setRemarksModalOpen(false)}
          // onConfirm={handleReject}
          confirmText="Confirm"
        />

        <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-[18px] md:text-xl font-bold text-gray-800">
              Mass Screening
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              {/* <Link
                to="/admin/cancer-screening/add/mass"
                className="bg-yellow hover:bg-yellow/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
              >
                Add New
              </Link> */}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-yellow-600">
                Manage Mass Screening Requests
              </h3>
            </div>

            {/* Filters Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search by request ID or RHU name..."
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
                  className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  <option value="">All Months</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>

                <select
                  className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="">All Years</option>
                  {Array.from(
                    new Set(
                      items
                        .map((p) => new Date(p.date).getFullYear())
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
                <button
                  onClick={() => {
                    setDayFilter("");
                    setMonthFilter("");
                    setYearFilter("");
                    setStatusFilter("all");
                    setSearchQuery("");
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
              <div className="bg-white border border-gray-200 rounded-lg overflow-auto ">
                {/* Table Header */}
                <div className="bg-lightblue px-4 py-3 w-[500px] md:w-[100%]">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                    <div className="col-span-2 text-center">Request ID</div>
                    <div className="col-span-3 text-center">
                      RHU/Private Name
                    </div>
                    <div className="col-span-2 text-center">Date</div>
                    <div className="col-span-2 text-center">Venue</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-center">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="max-h-96 overflow-auto w-[500px] md:w-[100%]">
                  {paginatedData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No records found matching your filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {paginatedData.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center  text-[12px] md:text-[14px]"
                        >
                          <div
                            className="col-span-2 text-center text-blue-500 cursor-pointer font-medium"
                            onClick={() => handleViewClick(item.id)}
                          >
                            {item.id}
                          </div>
                          <div className="col-span-3 text-center text-gray-800">
                            {item.rhuName ? item.rhuName : item.privateName}
                          </div>
                          <div className="col-span-2 text-center text-gray-800">
                            {formatDate(item.date)}
                          </div>
                          <div className="col-span-2 text-center text-gray-800">
                            {item.venue}
                            {/* {Array.isArray(item.attachments) &&
                            item.attachments.length > 0 ? (
                              <span className="text-gray-700">
                                {item.attachments.length} file(s)
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )} */}
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                statusColors[item.status] ||
                                statusColors.Default
                              }`}
                            >
                              {item.status || "—"}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-center gap-2">
                            {/* <button
                              onClick={() => handleViewClick(item.id)}
                              className="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
                            >
                              View
                            </button> */}

                            {item.status === "Pending" ? (
                              <>
                                <button
                                  onClick={() => askConfirm("verify", item.id)}
                                  className="bg-primary cursor-pointer text-white py-1.5 px-3 rounded text-xs font-medium"
                                  title="Approve"
                                >
                                  {/* Verify */}
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => askConfirm("reject", item.id)}
                                  className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
                                  title="Reject"
                                >
                                  {/* Reject */}
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : item.status === "Rejected" ||
                              item.status === "Completed" ? (
                              <button
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                onClick={() =>
                                  handleActionClick(item.id, "delete")
                                }
                                title="Delete"
                              >
                                {/* Delete */}
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                onClick={() =>
                                  handleActionClick(item.id, "delete")
                                }
                                title="Cancel"
                              >
                                {/* Cancel */}
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* {(item.status === "Verified" || item.status === "Rejected") && (
                              <button
                                onClick={() => askConfirm("done", item.id)}
                                className="bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
                              >
                                Done
                              </button>
                            )} */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 px-2 overflow-auto">
                <div className="text-[12px] md:text-sm text-gray-600">
                  Showing {paginatedData.length} of {totalRecords} records
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 overflow-auto">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="recordsPerPage"
                      className="text-[12px] md:text-sm text-gray-700"
                    >
                      Records per page:
                    </label>
                    <select
                      id="recordsPerPage"
                      className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent text-[12px] md:text-sm"
                      value={recordsPerPage}
                      onChange={handleRecordsPerPageChange}
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

export default AdminMassScreening;
