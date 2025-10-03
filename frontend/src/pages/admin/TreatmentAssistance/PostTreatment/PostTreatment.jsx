import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Info } from "lucide-react";

import api from "src/api/axiosInstance";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";

const PostTreatment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    date: "",
  });

  const [pagination, setPagination] = useState({
    recordsPerPage: 10,
    currentPage: 1,
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(location.state?.type || "");

  const [modal, setModal] = useState({
    open: false,
    text: "",
    action: null,
  });

  const fetchData = async () => {
    try {
      const { data } = await api.get("/post-treatment/list/");
      setTableData(data);
    } catch (error) {
      console.error("Error fetching post-treatment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle flash notifications
  useEffect(() => {
    const flash = location.state?.flash;
    if (flash) {
      setNotification(flash);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Auto-hide notification
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const filteredAndPaginated = useMemo(() => {
    const { search, status, date } = filters;
    const { recordsPerPage, currentPage } = pagination;

    const searchQuery = search.trim().toLowerCase();

    const filtered = tableData.filter((row) => {
      const matchesSearch =
        !searchQuery ||
        row.patient?.patient_id?.toLowerCase().includes(searchQuery) ||
        row.patient?.full_name?.toLowerCase().includes(searchQuery);

      const matchesStatus =
        status === "all" || row.status?.toLowerCase() === status;

      const matchesDate = !date || row.created_at === date;

      return matchesSearch && matchesStatus && matchesDate;
    });

    const totalRecords = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));

    const paginatedData = filtered.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );

    return { paginatedData, totalRecords, totalPages };
  }, [tableData, filters, pagination]);

  const openConfirm = (id, action) => {
    const actionText =
      action === "accept"
        ? "Accept this request?"
        : action === "delete"
        ? "Delete this record?"
        : "Reject this request?";

    setModal({ open: true, text: actionText, action: { id, type: action } });
  };

  const doAction = async () => {
    if (!modal.action) return;

    const { id, type } = modal.action;
    setModal((prev) => ({ ...prev, open: false }));

    try {
      setLoading(true);

      if (type === "accept") {
        const payload = {
          status: "Approved"
        }

        await api.patch(`post-treatment/approve/${id}/`, payload);
        setNotificationType("success");
        setNotification(`Request has been approved.`);
      } else {
        await api.delete(`post-treatment/record/delete/${id}/`);
        setNotificationType("success");
        setNotification(`Request has been ${type} successfully.`);
        setTableData((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error(`Failed to ${type} request:`, error);
      setNotificationType("error");
      setNotification(`Failed to ${type} request.`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => navigate(`/admin/treatment-assistance/postview/${id}`);

  return (
    <>
      {loading && <SystemLoader />}

      <ConfirmationModal
        open={modal.open}
        title={modal.text}
        onConfirm={doAction}
        onCancel={() => setModal({ open: false, text: "", action: null })}
      />

      <Notification message={notification} type={notificationType} />

      <div className="flex-1 w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold">Post Treatment Assistance</h2>
          <Link
            to="/admin/treatment-assistance/add-post-treatment"
            className="bg-yellow px-5 py-1 rounded-sm text-white"
          >
            Add
          </Link>
        </div>

        <div className="flex flex-col bg-white w-full rounded-md shadow-md px-5 py-5 gap-3">
          <p className="text-md font-semibold text-yellow">Manage Post Treatment</p>

          {/* Filters */}
          <div className="flex justify-between flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by patient no, patient name..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
            />

            <select
              className="border border-gray-200 rounded-md p-2 bg-white"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="date"
              className="border border-gray-200 py-2 px-5 rounded-md"
              value={filters.date}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          {/* Table */}
          <div className="bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
              <thead>
                <tr className="bg-lightblue">
                  <th className="w-[15%] text-center text-sm py-3 !bg-lightblue">Patient ID</th>
                  <th className="w-[20%] text-center text-sm py-3">Patient Name</th>
                  <th className="w-[20%] text-center text-sm py-3">Diagnosis</th>
                  <th className="w-[15%] text-center text-sm py-3">Date Submitted</th>
                  <th className="w-[10%] text-center text-sm py-3">Status</th>
                  <th className="w-[20%] text-center text-sm py-3">Action</th>
                </tr>
              </thead>
            </table>

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
                  {filteredAndPaginated.paginatedData.map((p) => (
                    <tr key={p.id}>
                      <td className="text-center text-sm py-3">{p.patient?.patient_id}</td>
                      <td className="text-center text-sm py-3">{p.patient?.full_name}</td>
                      <td className="text-center text-sm py-3">
                        {p.patient?.diagnosis?.[0]?.diagnosis || "N/A"}
                      </td>
                      <td className="text-center text-sm py-3">
                        {new Date(p.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="text-center text-sm py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs gap-1 font-semibold rounded-md ${
                            p.status === "Approved"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : p.status === "Completed"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {p.status}
                          <Info
                            size={14}
                            title={
                              p.has_patient_response
                                ? p.response_description
                                : "No patient response"
                            }
                            className={`cursor-pointer ${
                              p.has_patient_response ? "text-blue-500" : "text-gray-300"
                            }`}
                          />
                        </span>
                      </td>
                      <td className="text-center text-sm py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleView(p.id)}
                            className="text-white py-1 px-2 rounded shadow bg-primary"
                          >
                            View
                          </button>
                          {p.status === "Pending" ? (
                            <>
                              <button
                                onClick={() => openConfirm(p.id, "accept")}
                                className="text-white py-1 px-2 rounded shadow bg-green-500"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openConfirm(p.id, "reject")}
                                className="text-white py-1 px-2 rounded shadow bg-red-500"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openConfirm(p.id, "delete")}
                              className="text-white py-1 px-2 rounded shadow bg-red-500"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndPaginated.paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center py-2 gap-5">
            <div className="flex items-center gap-2">
              <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                Records per page:
              </label>
              <select
                id="recordsPerPage"
                className="w-16 rounded-md shadow-sm"
                value={pagination.recordsPerPage}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    recordsPerPage: Number(e.target.value),
                    currentPage: 1,
                  }))
                }
              >
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-sm text-gray-700">
                {Math.min(
                  (pagination.currentPage - 1) * pagination.recordsPerPage + 1,
                  filteredAndPaginated.totalRecords
                )}{" "}
                –{" "}
                {Math.min(
                  pagination.currentPage * pagination.recordsPerPage,
                  filteredAndPaginated.totalRecords
                )}{" "}
                of {filteredAndPaginated.totalRecords}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.max(1, prev.currentPage - 1),
                  }))
                }
                disabled={pagination.currentPage === 1}
                className="text-gray-600"
              >
                ←
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.min(
                      filteredAndPaginated.totalPages,
                      prev.currentPage + 1
                    ),
                  }))
                }
                disabled={pagination.currentPage === filteredAndPaginated.totalPages}
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

export default PostTreatment; 
