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

import PreCancerousPrint from "./generate/generate";
import api from "src/api/axiosInstance";

// Lightweight inline calendar with month navigation and min-date support
function MiniCalendar({ selected, min, onSelect }) {
  const parse = (s) => (s ? new Date(s + "T00:00:00") : null);
  const fmt = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const today = new Date();
  const sel = parse(selected);
  const minStr = min || null;

  const init = sel || today;
  const [y, setY] = useState(init.getFullYear());
  const [m, setM] = useState(init.getMonth());

  const first = new Date(y, m, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const weeks = [];
  let day = 1 - startWeekday;
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let d = 0; d < 7; d++, day++) {
      const inMonth = day >= 1 && day <= daysInMonth;
      const dateObj = new Date(y, m, Math.max(1, Math.min(day, daysInMonth)));
      const dateStr = fmt(new Date(y, m, day));
      const isPastMin = minStr ? dateStr < minStr : false;
      row.push({
        inMonth,
        dateStr,
        dateObj,
        disabled: !inMonth || isPastMin,
      });
    }
    weeks.push(row);
  }

  const canGoPrev = (() => {
    if (!minStr) return true;
    const prevLastStr = fmt(new Date(y, m, 0));
    return prevLastStr >= minStr;
  })();

  const goPrev = () => {
    if (!canGoPrev) return;
    const nm = m - 1;
    if (nm < 0) {
      setY(y - 1);
      setM(11);
    } else setM(nm);
  };

  const goNext = () => {
    const nm = m + 1;
    if (nm > 11) {
      setY(y + 1);
      setM(0);
    } else setM(nm);
  };

  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-[220px] select-none text-[12px]">
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          className={`px-1.5 py-0.5 rounded border ${
            canGoPrev ? "hover:bg-gray-50" : "opacity-40 cursor-not-allowed"
          }`}
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="text-xs font-semibold">
          {new Date(y, m, 1).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          type="button"
          className="px-1.5 py-0.5 rounded border hover:bg-gray-50"
          onClick={goNext}
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-[2px] text-[10px] text-gray-600 mb-1">
        {weekday.map((w) => (
          <div key={w} className="text-center">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[2px]">
        {weeks.flat().map((cell, idx) => {
          const fmt2 = (d) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
          };
          const isToday = fmt2(new Date()) === cell.dateStr;
          const isSelected = selected && selected === cell.dateStr;
          const base =
            "text-[11px] rounded w-7 h-7 flex items-center justify-center";
          const tone = !cell.inMonth
            ? "text-gray-300"
            : cell.disabled
            ? "text-gray-400"
            : "text-gray-800 hover:bg-primary/10";
          const badge = isSelected
            ? "bg-primary text-white hover:bg-primary"
            : isToday
            ? "ring-1 ring-primary/60"
            : "";
          return (
            <button
              key={idx}
              type="button"
              className={`${base} ${tone} ${badge}`}
              onClick={() => !cell.disabled && onSelect(cell.dateStr)}
              disabled={cell.disabled}
            >
              {cell.dateObj.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VerifyModal({ open, onClose, onConfirm, value, onChange, loading }) {
  if (!open) return null;
  const today = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();
  const [openCal, setOpenCal] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Set Release Date
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Set the release date to verify this medication request.
        </p>
        <div className="relative">
          <label
            className="text-sm text-gray-700 font-medium"
            htmlFor="releaseDate"
          >
            Release Date
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="releaseDate"
              type="text"
              readOnly
              placeholder="YYYY-MM-DD"
              className="w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={value || ""}
              onClick={() => setOpenCal((v) => !v)}
              autoFocus
            />
            <button
              type="button"
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              onClick={() => setOpenCal((v) => !v)}
              aria-label="Open calendar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 7H4v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9ZM5 7h14a1 1 0 0 1 1 1v1H4V8a1 1 0 0 1 1-1Z" />
              </svg>
            </button>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            Pick a date from the calendar. Past dates are disabled.
          </span>

          {openCal && (
            <div className="absolute right-0 mt-2 z-50">
              <div className="bg-white border border-gray-200 shadow-lg rounded-md p-3">
                <MiniCalendar
                  selected={value}
                  min={today}
                  onSelect={(d) => {
                    onChange(d);
                    setOpenCal(false);
                  }}
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                    onClick={() => {
                      onChange(today);
                      setOpenCal(false);
                    }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                    onClick={() => onChange("")}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
              value
                ? "bg-primary hover:bg-primary/80"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={onConfirm}
            disabled={!value || loading}
          >
            {loading ? "Verifying..." : "Confirm Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

const PreCancerous = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data
  const [modalDesc, setModalDesc] = useState("Confirm before proceeding");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Notification
  const [notification, setNotification] = useState("");
  useEffect(() => {
    const flash = location.state?.flash;
    if (flash) {
      setNotification(flash);
      navigate(location.pathname, { replace: true, state: {} });
      const t = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(t);
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  // Verify Modal
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyDate, setVerifyDate] = useState("");
  const [verifyId, setVerifyId] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const normDate = (v) => {
      if (!v) return null;
      try {
        return new Date(v);
      } catch {
        return null;
      }
    };

    const rows = tableData.filter((p) => {
      const matchesSearch =
        !q ||
        String(p.patient.patient_id || "")
          .toLowerCase()
          .includes(q) ||
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
      const matchesYear = !yearFilter || recordYear === parseInt(yearFilter);

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
  }, [
    tableData,
    searchQuery,
    statusFilter,
    dayFilter,
    monthFilter,
    yearFilter,
  ]);

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

  // Actions
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
    if (action === "reject") text = "Reject this patient?";
    if (action === "delete") text = "Delete this record?";
    if (action === "done") text = "Mark this request as Done?";
    setModalText(text);
    setPendingAction({ id, action });
    setModalOpen(true);
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
      await loadList(statusFilter);
      const msg =
        action === "reject"
          ? "Rejected"
          : action === "done"
          ? "marked as Done"
          : "updated";
      setNotification(`Request ${id} ${msg} successfully`);
    } catch (e) {
      setNotification("Action failed. Please try again.");
    } finally {
      setModalOpen(false);
      setPendingAction(null);
    }
  };

  const confirmVerify = async () => {
    if (!verifyId || !verifyDate) return;
    try {
      setVerifyLoading(true);
      await adminVerifyPreCancerousMeds(verifyId, {
        release_date_of_meds: verifyDate,
      });
      await loadList(statusFilter);
      setNotification(`Request ${verifyId} Verified successfully`);
    } catch (e) {
      setNotification(
        "Verification failed. Please ensure release date is set and try again."
      );
    } finally {
      setVerifyLoading(false);
      setVerifyOpen(false);
      setVerifyId(null);
      setVerifyDate("");
    }
  };

  const cancelAction = () => {
    setModalOpen(false);
    setPendingAction(null);
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
    const newTitle = `Pre_Cancerous_Request_Report - ${formattedDate}`;

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
          #precancerous-root { display: none !important; }
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
        <PreCancerousPrint rows={filteredResults} />
      </div>

      {/* SCREEN CONTENT */}
      <div id="precancerous-root">
        <ConfirmationModal
          open={modalOpen}
          title={modalText}
          desc={modalDesc}
          onConfirm={doAction}
          onCancel={cancelAction}
        />

        <VerifyModal
          open={verifyOpen}
          onClose={() => {
            if (!verifyLoading) {
              setVerifyOpen(false);
              setVerifyId(null);
              setVerifyDate("");
            }
          }}
          onConfirm={confirmVerify}
          value={verifyDate}
          onChange={setVerifyDate}
          loading={verifyLoading}
        />

        <Notification message={notification} />
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

        {loading && <SystemLoader />}

        <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-gray-800">
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
                    <div className="col-span-2 text-center">Patient ID</div>
                    <div className="col-span-3 text-center">Patient Name</div>
                    <div className="col-span-2 text-center">Requested To</div>
                    <div className="col-span-2 text-center">Date Submitted</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-center">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="max-h-96 overflow-auto">
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
                          className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm"
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
                            {p.patient.date_of_birth
                              ? new Date(
                                  p.patient.date_of_birth
                                ).toLocaleDateString("en-US", {
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
                                  className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                >
                                  {/* Delete */}
                                  <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                            ) : (
                              <button
                                onClick={() => openConfirm(p.id, "delete")}
                                className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                              >
                                {/* Delete */}
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
                <div className="text-sm text-gray-600">
                  Showing {paginated.length} of {totalRecords} records
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="recordsPerPage"
                      className="text-sm text-gray-700"
                    >
                      Records per page:
                    </label>
                    <select
                      id="recordsPerPage"
                      className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  <div className="flex items-center gap-2">
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
