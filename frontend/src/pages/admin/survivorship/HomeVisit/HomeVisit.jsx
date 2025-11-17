// src/pages/survivorship/HomeVisit.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Printer, Info, CheckCircle, X, Trash2 } from "lucide-react";

import api from "src/api/axiosInstance";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";

import HomeVisitPrint from "./generate/generate";

const HomeVisit = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState(
    "Please confirm before proceeding"
  );
  const [pendingAction, setPendingAction] = useState(null);

  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [notificationMessage, setNotificationMessage] = useState(
    location.state?.message || ""
  );

  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // ✅ Automatically update available weeks when month/year changes
  useEffect(() => {
    if (monthFilter && yearFilter && tableData.length > 0) {
      const weeksWithData = new Set();

      tableData.forEach((record) => {
        const recordDate = new Date(record.created_at);
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

      // Sort and set available weeks (Week 1–4)
      const sortedWeeks = Array.from(weeksWithData).sort((a, b) => a - b);
      setAvailableWeeks(sortedWeeks);
    } else {
      setAvailableWeeks([]);
      setWeekFilter("");
    }
  }, [monthFilter, yearFilter, tableData]);

  // ✅ Function to get Week of Month (Week 1–4)
  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay() || 7; // Sunday=7
    const adjustedDate = date.getDate() + firstDayOfWeek - 1;
    return Math.ceil(adjustedDate / 7);
  };

  const fetchData = async () => {
    try {
      const response = await api.get("/survivorship/home-visit/list/");
      setTableData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (notificationType && notificationMessage) {
      setNotification(notificationMessage);
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => setNotification(""), 3000);
    }
  }, [notificationType, notificationMessage, navigate, location.pathname]);

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return tableData.filter((row) => {
      const dateValue = row.created_at || row.date_submitted;
      if (!dateValue) return false;

      const createdDate = new Date(dateValue);
      if (isNaN(createdDate)) return false;

      const createdYear = createdDate.getFullYear();
      const createdMonth = createdDate.getMonth() + 1;
      const createdDay = createdDate.getDate();

      const matchesSearch =
        !q ||
        (row.patient?.patient_id || "").toLowerCase().includes(q) ||
        (row.patient?.full_name || "").toLowerCase().includes(q) ||
        (row.patient?.diagnosis?.[0]?.diagnosis || "")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (row.status || "").toLowerCase() === statusFilter;

      const matchesDate =
        !dateFilter ||
        new Date(dateValue).toISOString().slice(0, 10) === dateFilter;

      const matchesDay = !dayFilter || createdDay === Number(dayFilter);
      const matchesMonth = !monthFilter || createdMonth === Number(monthFilter);
      const matchesYear = !yearFilter || createdYear === Number(yearFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate &&
        matchesDay &&
        matchesMonth &&
        matchesYear
      );
    });
  }, [
    tableData,
    searchQuery,
    statusFilter,
    dateFilter,
    dayFilter,
    monthFilter,
    yearFilter,
  ]);

  const totalRecords = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  const paginated = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const openConfirm = (id, action) => {
    setPendingAction({ id, action });
    setModalText(
      action === "cancel"
        ? "Cancel this application?"
        : "Delete this application?"
    );
    setModalOpen(true);
  };

  const doAction = async () => {
    if (!pendingAction) return;
    const { id, action } = pendingAction;
    if (action === "accept") {
      setTableData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
      );
      setNotification(`Request ${id} has been approved.`);
    } else if (action === "cancel" || action === "delete") {
      await api.delete(`/survivorship/home-visit/delete/${id}/`);

      navigate("/admin/survivorship", {
        state: {
          type: "success",
          message: `${action}d Successfully.`,
        },
      });
      fetchData();
      setNotificationType("success");
      setNotificationMessage(`Application has been ${action}d successfully.`);
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

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Completed: "bg-green-100 text-green-700",
    Processing: "bg-blue-100 text-blue-700",
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
    const newTitle = `Patient_Home_Visit_Report - ${formattedDate}`;

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
        :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        @media print {
          #homevisit-root { display: none !important; }
          #print-root { display: block !important; }
          @page { size: Letter; margin: 0 !important; }
          html, body { margin: 0 !important; }
        }
        @media screen {
          #print-root { display: none !important; }
        }

        .master-table { border-collapse: collapse; }
        .master-table, .master-table th, .master-table td, .master-table tr { border: 0 !important; }
      `}</style>

      {/* PRINT CONTENT */}
      <div id="print-root">
        <HomeVisitPrint rows={filteredResults} />
      </div>

      {/* SCREEN CONTENT */}
      <div id="homevisit-root">
        <ConfirmationModal
          open={modalOpen}
          title={modalText}
          desc={modalDesc}
          onConfirm={doAction}
          onCancel={cancelAction}
        />

        <Notification message={notification} type={notificationType} />

        <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-[18px] md:text-xl font-bold text-gray-800">
              Patient Home Visit
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
                title="Print current list"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <Link
                to="/admin/survivorship/add"
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
                Manage patients that are in need of home visit
              </h3>
            </div>

            {/* Filters Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search by patient ID, name, or diagnosis..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-sm"
                />

                <select
                  className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
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
                    setDateFilter("");
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
              <div className="bg-white border border-gray-200 rounded-lg overflow-auto">
                {/* Table Header */}
                <div className="bg-lightblue px-4 py-3 w-[500px] md:w-[100%]">
                  <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                    <div className="col-span-2 text-center">Patient ID</div>
                    <div className="col-span-3 text-center">Patient Name</div>
                    <div className="col-span-2 text-center">Diagnosis</div>
                    <div className="col-span-2 text-center">Date</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-center">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="max-h-96 overflow-auto w-[500px] md:w-[100%]">
                  {paginated.length === 0 ? (
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
                            <div className="flex items-center justify-center gap-1">
                              {p.patient?.patient_id}
                              {p.has_patient_response && (
                                <span
                                  title={
                                    p.has_patient_response
                                      ? p.response_description
                                      : "No additional information"
                                  }
                                  className="cursor-pointer flex items-center"
                                >
                                  <Info
                                    size={14}
                                    className={
                                      p.has_patient_response
                                        ? "text-yellow"
                                        : "text-gray-300"
                                    }
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-span-3 text-center text-gray-800">
                            {p.patient?.full_name}
                          </div>
                          <div className="col-span-2 text-center text-gray-800">
                            {p.patient?.diagnosis?.[0]?.diagnosis || "N/A"}
                          </div>
                          <div className="col-span-2 text-center text-gray-800">
                            {new Date(p.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                statusColors[p.status] || statusColors.Default
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-center gap-2">
                            {p.status === "Pending" ? (
                              <button
                                onClick={() => openConfirm(p.id, "cancel")}
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            ) : p.status === "Completed" ? (
                              <button
                                onClick={() => openConfirm(p.id, "delete")}
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => openConfirm(p.id, "cancel")}
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                title="Cancel"
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

export default HomeVisit;
