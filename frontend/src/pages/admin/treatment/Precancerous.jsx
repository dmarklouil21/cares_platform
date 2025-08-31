// src/pages/treatment/AdminPreCancerous.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminListPreCancerousMeds,
  adminVerifyPreCancerousMeds,
  adminRejectPreCancerousMeds,
} from "../../../api/precancerous";

// Server-driven list; no inline sample data

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
  const parse = (s) => (s ? new Date(s + 'T00:00:00') : null);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const sel = parse(selected);
  const minDate = parse(min);

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
      const isPastMin = minDate ? new Date(dateStr) < minDate : false;
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
    if (!minDate) return true;
    // allow prev if last day of previous month is >= min
    const prevLast = new Date(y, m, 0); // day 0 of month is last day prev month
    return prevLast >= minDate;
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

  const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-[220px] select-none text-[12px]">
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          className={`px-1.5 py-0.5 rounded border ${canGoPrev ? 'hover:bg-gray-50' : 'opacity-40 cursor-not-allowed'}`}
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="text-xs font-semibold">
          {new Date(y, m, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
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
          <div key={w} className="text-center">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[2px]">
        {weeks.flat().map((cell, idx) => {
          const isToday = fmt(today) === cell.dateStr;
          const isSelected = selected && selected === cell.dateStr;
          const base = 'text-[11px] rounded w-7 h-7 flex items-center justify-center';
          const tone = !cell.inMonth
            ? 'text-gray-300'
            : cell.disabled
            ? 'text-gray-400'
            : 'text-gray-800 hover:bg-primary/10';
          const badge = isSelected
            ? 'bg-primary text-white hover:bg-primary'
            : isToday
            ? 'ring-1 ring-primary/60'
            : '';
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
  const today = new Date().toISOString().split("T")[0];
  const [openCal, setOpenCal] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[340px] flex flex-col gap-3">
        <p className="text-base font-semibold text-gray-800">Set release date to verify this request</p>
        <div className="relative">
          <label className="text-sm text-gray-700" htmlFor="releaseDate">Release date of meds</label>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 7H4v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9ZM5 7h14a1 1 0 0 1 1 1v1H4V8a1 1 0 0 1 1-1Z" />
              </svg>
            </button>
          </div>
          <span className="text-xs text-gray-500">Pick a date from the calendar. Past dates are disabled.</span>

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
            className={`px-4 py-1.5 rounded text-white ${value ? 'bg-primary hover:bg-primary/80' : 'bg-gray-400 cursor-not-allowed'}`}
            onClick={onConfirm}
            disabled={!value || loading}
          >
            {loading ? 'Verifying...' : 'Confirm Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}

const PreCancerous = () => {
  const navigate = useNavigate();

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

  // filters & paging
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dobFilter, setDobFilter] = useState(""); // YYYY-MM-DD
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // modal & toast
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // { id, action }
  const [notification, setNotification] = useState("");

  // verify modal states
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyDate, setVerifyDate] = useState("");
  const [verifyId, setVerifyId] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const dob = dobFilter || null;
    return tableData.filter((p) => {
      const matchesSearch =
        !q ||
        (p.patient_id || "").toLowerCase().includes(q) ||
        (p.first_name || "").toLowerCase().includes(q) ||
        (p.last_name || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesDob = !dob || p.date_of_birth === dob;
      return matchesSearch && matchesStatus && matchesDob;
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
      setVerifyDate(new Date().toISOString().split("T")[0]);
      setVerifyOpen(true);
      return;
    }
    const verb = action === "reject" ? "Reject" : "Confirm";
    setModalText(`${verb} this patient?`);
    setPendingAction({ id, action });
    setModalOpen(true);
  };

  const doAction = async () => {
    if (!pendingAction) return;
    const { id, action } = pendingAction;
    try {
      if (action === "reject") {
        await adminRejectPreCancerousMeds(id);
      } else {
        // fallback: no-op
      }
      await loadList(statusFilter);
      setNotification(`Request ${id} Rejected successfully`);
    } catch (e) {
      setNotification("Action failed. Please try again.");
    } finally {
      setModalOpen(false);
      setPendingAction(null);
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const confirmVerify = async () => {
    if (!verifyId || !verifyDate) return;
    try {
      setVerifyLoading(true);
      await adminVerifyPreCancerousMeds(verifyId, { release_date_of_meds: verifyDate });
      await loadList(statusFilter);
      setNotification(`Request ${verifyId} Verified successfully`);
    } catch (e) {
      setNotification("Verification failed. Please ensure release date is set and try again.");
    } finally {
      setVerifyLoading(false);
      setVerifyOpen(false);
      setVerifyId(null);
      setVerifyDate("");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const cancelAction = () => {
    setModalOpen(false);
    setPendingAction(null);
  };

  const handleView = (id) => {
    navigate(`/Admin/treatment/view/AdminprecancerousView/${id}`);
  };

  return (
    <>
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

      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Admin</h1>
        </div>

        <div className="w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Pre-cancerous Patients
          </h2>

          <div className="flex flex-col bg-white w-full rounded-[4px] shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow">Patient List</p>

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
              </select>

              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md"
                value={dobFilter}
                onChange={(e) => setDobFilter(e.target.value)}
              />

              <button
                className="px-7 rounded-md text-sm bg-[#C5D7E5]"
                onClick={() => loadList(statusFilter)}
              >
                Filter
              </button>
            </div>

            {/* table header */}
            <div className="bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                <thead>
                  <tr className="bg-lightblue">
                    <th className="w-[15%] text-center text-sm py-3 !bg-lightblue">
                      Patient no
                    </th>
                    <th className="w-[20%] text-center text-sm py-3">
                      First name
                    </th>
                    <th className="w-[20%] text-center text-sm py-3">
                      Last name
                    </th>
                    <th className="w-[15%] text-center text-sm py-3">
                      Date of birth
                    </th>
                    <th className="w-[10%] text-center text-sm py-3">Status</th>
                    <th className="w-[20%] text-center text-sm py-3">Action</th>
                  </tr>
                </thead>
              </table>

              {/* table body */}
              <div className="max-h-[240px] min-h-[240px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[10%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading && (
                      <tr>
                        <td colSpan="6" className="text-center py-4">Loading...</td>
                      </tr>
                    )}
                    {!loading && paginated.map((p) => (
                      <tr key={p.id}>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.patient_id}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.first_name}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {p.last_name}
                        </td>
                        <td className="text-center text-sm py-3 text-gray-800">
                          {new Date(p.date_of_birth).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="text-center text-sm py-3">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-md ${
                              p.status === "Verified"
                                ? "bg-green-50 text-green-600"
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
