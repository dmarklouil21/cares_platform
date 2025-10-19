// src/pages/treatment/AdminPreCancerous.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  adminListPreCancerousMeds,
  adminVerifyPreCancerousMeds,
  adminRejectPreCancerousMeds,
  adminDonePreCancerousMeds,
} from "src/api/precancerous";

import api from "src/api/axiosInstance";

// ⬇️ PRINT TEMPLATE
import PreCancerousPrint from "./generate/generate";

// ----- ui bits -----
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

// Lightweight inline calendar with month navigation and min-date support (YYYY-MM-DD)
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
  const [m, setM] = useState(init.getMonth()); // 0-11

  const first = new Date(y, m, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const weeks = [];
  let day = 1 - startWeekday; // start from Monday before the 1st
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
    const prevLastStr = fmt(new Date(y, m, 0)); // last day prev month
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
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[340px] flex flex-col gap-3">
        <p className="text-base font-semibold text-gray-800">
          Set release date to verify this request
        </p>
        <div className="relative">
          <label className="text-sm text-gray-700" htmlFor="releaseDate">
            Release date of meds
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="releaseDate"
              type="text"
              readOnly
              placeholder="YYYY-MM-DD"
              className="w-full border border-gray-300 rounded px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={value || ""}
              onClick={() => setOpenCal((v) => !v)}
              autoFocus
            />
            <button
              type="button"
              className="p-2 rounded border border-gray-300 hover:bg-gray-50"
              onClick={() => setOpenCal((v) => !v)}
              aria-label="Open calendar"
            >
              {/* inline calendar icon */}
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
          <span className="text-xs text-gray-500">
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
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => {
                      onChange(today);
                      setOpenCal(false);
                    }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => onChange("")}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-1.5 rounded bg-gray-200 text-gray-700"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-1.5 rounded text-white ${
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

  // data
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadList = async (status) => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (status && status !== "all") params.status = status;
      const { data } = await api.get("/rhu/pre-cancerous/list/");
      setTableData(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load → ALL (no status param)
    loadList();
  }, []);

  // flash message from Add page (show once, then clear)
  const [notification, setNotification] = useState("");
  useEffect(() => {
    const flash = location.state?.flash;
    if (flash) {
      setNotification(flash);
      // clear the route state so message doesn't reappear on refresh/back
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

  // filters & paging
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dobFilter, setDobFilter] = useState(""); // YYYY-MM-DD
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // modal & pending action
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // { id, action }

  // verify modal states
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyDate, setVerifyDate] = useState("");
  const [verifyId, setVerifyId] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ⬇️ Normalize DOB for filtering; include stable sort
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const dob = dobFilter || null;

    const normDOB = (v) => {
      if (!v) return null;
      try {
        // normalize to YYYY-MM-DD to match <input type="date" />
        return new Date(v).toISOString().split("T")[0];
      } catch {
        return v; // fallback
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

      const matchesDob = !dob || normDOB(p.patient.date_of_birth) === dob;

      return matchesSearch && matchesStatus && matchesDob;
    });

    // stable, predictable output: Last name, First name, Patient no
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
  }, [tableData, searchQuery, statusFilter, dobFilter]);

  const totalRecords = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  useEffect(
    () => setCurrentPage(1),
    [recordsPerPage, searchQuery, statusFilter, dobFilter, totalRecords]
  );

  const paginated = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // actions
  const openConfirm = (id, action) => {
    if (action === "verify") {
      setVerifyId(id);
      // Prefill with today's date (YYYY-MM-DD)
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
    navigate(`/rhu/treatment-assistance/pre-cancerous/view/${id}`);
  };

  return (
    <>
      {/* --- Print rules: only show the print template during print --- */}
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

      {/* --- PRINT-ONLY CONTENT --- */}
      <div id="print-root">
        {/* Pass ALL filtered rows (not paginated) */}
        <PreCancerousPrint rows={filteredResults} />
      </div>

      {/* --- SCREEN CONTENT --- */}
      <div id="precancerous-root">
        <ConfirmationModal
          open={modalOpen}
          text={modalText}
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

        <div className="h-screen w-full flex p-5 gap-3 flex-col justify-start items-center bg-gray">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-left w-full pl-1">
              Pre-Cancerous Medication Request
            </h2>

            <div className="flex gap-2">
              <Link
                to="/rhu/treatment-assistance/pre-cancerous/add"
                className="bg-yellow px-5 py-1 rounded-sm text-white"
              >
                Add
              </Link>
            </div>
          </div>

          <div className="flex flex-col bg-white w-full rounded-md shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">Manage Pre-Cancerous Medication Request</p>

            {/* filters */}
            <div className="flex justify-between flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by patient no, first name, or last name..."
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
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
                <option value="Done">Done</option>
              </select>

              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dobFilter}
                onChange={(e) => setDobFilter(e.target.value)}
              />

              {/* <button
                className="px-7 rounded-md text-sm bg-[#C5D7E5]"
                onClick={() => loadList(statusFilter)}
                title="Fetch from server using selected status"
              >
                Filter
              </button> */}
              <button
                onClick={() => window.print()}
                disabled={loading}
                className={`px-7 font-bold rounded-md text-sm text-white cursor-pointer ${
                  loading ? "bg-primary/60 cursor-not-allowed" : "bg-primary"
                }`}
                title={loading ? "Loading data..." : "Print current list"}
              >
                Generate
              </button>
            </div>

            {/* table header */}
            <div className="bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                <thead>
                  <tr className="bg-lightblue">
                    <th className="w-[14%] text-center text-sm py-3 !bg-lightblue">
                      Patient ID
                    </th>
                    <th className="w-[18%] text-center text-sm py-3">
                      Patient Name
                    </th>
                    <th className="w-[18%] text-center text-sm py-3">
                      Requested To
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">
                      Date Submitted
                    </th>
                    <th className="w-[11%] text-center text-sm py-3">Status</th>
                    <th className="w-[24%] text-center text-sm py-3">Action</th>
                  </tr>
                </thead>
              </table>

              {/* table body */}
              <div className="max-h-[240px] min-h-[240px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 master-table border-separate border-spacing-0">
                  <colgroup>
                    <col className="w-[14%]" />
                    <col className="w-[18%]" />
                    <col className="w-[18%]" />
                    <col className="w-[15%]" />
                    <col className="w-[11%]" />
                    <col className="w-[24%]" />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading && (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      paginated.map((p) => (
                        <tr key={p.id}>
                          <td className="text-center text-sm py-3 text-gray-800">
                            {p.patient.patient_id}
                          </td>
                          <td className="text-center text-sm py-3 text-gray-800">
                            {p.patient.full_name}
                          </td>
                          <td className="text-center text-sm py-3 text-gray-800">
                            {p.request_destination === "Rural Health Unit" ? 
                            ("RHU - ") : 
                            ("")}
                            {p.destination_name}
                          </td>
                          <td className="text-center text-sm py-3 text-gray-800">
                            {p.patient.date_of_birth
                              ? new Date(p.patient.date_of_birth).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : ""}
                          </td>
                          <td className="text-center text-sm py-3">
                            <span
                              className={`px-3 py-1 inline-flex text-xs font-semibold rounded-md ${
                                p.status === "Verified"
                                  ? "bg-green-50 text-green-600"
                                  : p.status === "Done"
                                  ? "bg-blue-50 text-blue-600"
                                  : p.status === "Rejected"
                                  ? "bg-rose-50 text-rose-600"
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
                                className="text-white py-1 px-3 rounded-[5px] shadow bg-primary"
                              >
                                View
                              </button>
                              {p.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => openConfirm(p.id, "verify")}
                                    className="text-white py-1 px-3 rounded-[5px] shadow bg-green-500"
                                  >
                                    Verify
                                  </button>
                                  <button
                                    onClick={() => openConfirm(p.id, "reject")}
                                    className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {p.status === "Verified" && (
                                <button
                                  onClick={() => openConfirm(p.id, "done")}
                                  className="text-white py-1 px-3 rounded-[5px] shadow bg-blue-600"
                                >
                                  Mark done
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!loading && paginated.length === 0 && (
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

            {/* pagination */}
            <div className="flex justify-end items-center py-2 gap-5">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="recordsPerPage"
                  className="text-sm text-gray-700"
                >
                  Records per page:
                </label>
                <select
                  id="recordsPerPage"
                  className="w-16 rounded-md shadow-sm"
                  value={recordsPerPage}
                  onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                >
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-700">
                  {Math.min(
                    (currentPage - 1) * recordsPerPage + 1,
                    totalRecords
                  )}{" "}
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
      </div>
    </>
  );
};

export default PreCancerous;
