import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import {
  listAdminMassScreenings,
  setAdminMassScreeningStatus,
} from "../../../../api/massScreening";
import Notification from "src/components/Notification"; // top toast (same as Individual)

const AdminMassScreening = () => {
  /* ----------------------------- Data ----------------------------- */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listAdminMassScreenings();
      const normalized = (Array.isArray(data) ? data : []).map((d) => ({
        id: d.id,
        rhuName: d.rhu_lgu, // from serializer
        date: d.date,
        status: d.status, // Pending | Verified | Rejected | Done
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

  /* ----------------------------- Filters ------------------------------ */
  const [searchQuery, setSearchQuery] = useState(""); // NEW: search by id or RHU name
  const [statusFilter, setStatusFilter] = useState("all"); // all | Pending | Verified | Rejected | Done
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

  /* ----------------------------- Pagination --------------------------- */
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const matchesStatus =
        statusFilter === "all" ? true : (it.status ?? "") === statusFilter;
      const matchesDate = !dateFilter ? true : (it.date ?? "") === dateFilter;
      const matchesSearch =
        !s ||
        String(it.id).toLowerCase().includes(s) ||
        (it.rhuName || "").toLowerCase().includes(s);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [items, statusFilter, dateFilter, searchQuery]);

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

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  /* ----------------------------- View / Actions ------------------------------ */
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewClick = (id) => {
    const record = items.find((x) => x.id === id);
    navigate("/admin/cancer-screening/view/mass-view", {
      state: { record: record ?? { id } },
    });
  };

  // Generic confirm modal (delete / verify / reject / done)
  const [confirm, setConfirm] = useState({ open: false, action: "", id: null });

  const askConfirm = (action, id) => setConfirm({ open: true, action, id });
  const closeConfirm = () => setConfirm({ open: false, action: "", id: null });

  // Top toast (same behavior/pattern as the Individual table)
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [notificationMessage, setNotificationMessage] = useState(
    location.state?.message || ""
  );

  // Show toast from navigation state (e.g., after "Add" success), then clear state
  useEffect(() => {
    if (notificationType && notificationMessage) {
      setNotification(notificationMessage);
      navigate(location.pathname, { replace: true, state: {} }); // clear state
      const t = setTimeout(() => setNotification(""), 2000); // auto-hide
      return () => clearTimeout(t);
    }
  }, [notificationType, notificationMessage, navigate, location.pathname]);

  // Reuse the same top toast for local actions too (verify/reject/done)
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
      await setAdminMassScreeningStatus(id, action); // action: verify | reject | done
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

  /* ------------------------------ Helpers ------------------------------ */
  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <div className="h-screen p-5 gap-3 w-full flex flex-col justify-start items-center bg-gray">
      {/* Top toast (shared) */}
      <Notification message={notification} type={notificationType} />

      <div className="flex justify-between items-center w-full">
        <h2 className="text-3xl font-bold text-left w-full">Mass Screening</h2>
        <Link
          to="/admin/cancer-screening/add/mass"
          className="bg-yellow px-5 py-1 rounded-sm text-white"
        >
          Add
        </Link>
      </div>

      <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-5">
        <p className="text-lg font-semibold text-yellow">
          Mass Screening Requests
        </p>

        {/* Filters (search on the LEFT, like Individual) */}
        <div className="flex flex-wrap  items-center justify-between">
          <input
            type="text"
            placeholder="Search by request ID or RHU name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-200 py-2 px-5 rounded-md w-[48%]"
          />

          <select
            className="border border-gray-200 rounded-md p-2 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Filter by Status</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
            <option value="Done">Done</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-md p-2 bg-white"
            aria-label="Filter by Date"
          />

          <button
            className="px-6 py-2 rounded-md text-sm text-white bg-[#C5D7E5]"
            onClick={() => setCurrentPage(1)}
          >
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-lightblue">
                <th className="w-[14%] text-left text-sm py-3 pl-4 !bg-lightblue">
                  Request ID
                </th>
                <th className="w-[26%] text-left text-sm py-3">RHU name</th>
                <th className="w-[18%] text-left text-sm py-3">Date</th>
                <th className="w-[14%] text-left text-sm py-3">Documents</th>
                <th className="w-[12%] text-left text-sm py-3">Status</th>
                <th className="w-[16%] text-center text-sm py-3">Actions</th>
              </tr>
            </thead>
          </table>

          <div className="max-h-[260px] min-h-[200px] overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 border-spacing-0">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[26%]" />
                <col className="w-[18%]" />
                <col className="w/[14%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
              </colgroup>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item) => {
                  const status = item.status || ""; // Pending | Verified | Rejected | Done
                  const badge = (() => {
                    switch (status) {
                      case "Verified":
                        return "bg-green-100 text-green-700";
                      case "Rejected":
                        return "bg-red-100 text-red-700";
                      case "Done":
                        return "bg-blue-100 text-blue-700";
                      default:
                        return "bg-yellow-100 text-yellow-700";
                    }
                  })();

                  return (
                    <tr key={item.id}>
                      <td className="text-sm py-4 text-gray-800 pl-4">
                        {item.id}
                      </td>
                      <td className="text-sm py-4 text-gray-800">
                        {item.rhuName || "—"}
                      </td>
                      <td className="text-sm py-4 text-gray-800">
                        {formatDate(item.date)}
                      </td>
                      <td className="text-sm py-4">
                        {Array.isArray(item.attachments) &&
                        item.attachments.length > 0 ? (
                          <span className="text-gray-700">
                            {item.attachments.length} file(s)
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="text-sm py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${badge}`}
                        >
                          {status || "—"}
                        </span>
                      </td>
                      <td className="text-sm py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewClick(item.id)}
                            className="text-white py-1 px-3 rounded-md shadow bg-slate-500"
                          >
                            View
                          </button>

                          {status === "Pending" && (
                            <>
                              <button
                                onClick={() => askConfirm("verify", item.id)}
                                className="text-white py-1 px-3 rounded-md shadow bg-green-600"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => askConfirm("reject", item.id)}
                                className="text-white py-1 px-3 rounded-md shadow bg-red-600"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(status === "Verified" || status === "Rejected") && (
                            <button
                              onClick={() => askConfirm("done", item.id)}
                              className="text-white py-1 px-3 rounded-md shadow bg-green-600"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
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
              {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)} –{" "}
              {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
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

      {/* ----------------------- Generic Confirmation Modal ----------------------- */}
      {confirm.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-[min(420px,92vw)] rounded-xl shadow-xl p-6 z-50 text-center">
            <h4 className="text-lg font-semibold mb-2">
              {confirm.action === "verify"
                ? "Verify this request?"
                : confirm.action === "reject"
                ? "Reject this request?"
                : "Delete this record?"}
            </h4>
            <p className="text-sm text-gray2 mb-6">
              {confirm.action === "delete"
                ? "This action cannot be undone."
                : "Please confirm your action."}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 rounded-md border border-gray2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doConfirm}
                className={`px-4 py-2 rounded-md text-white font-semibold ${
                  confirm.action === "reject" || confirm.action === "delete"
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMassScreening;
