// src/pages/treatment/PostTreatment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Info, Printer, CheckCircle, X, Trash2 } from "lucide-react";

import api from "src/api/axiosInstance";

import RemarksModal from "src/components/Modal/RemarksModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";

import PostTreatmentPrint from "./generate/generate";

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
  const [modalDesc, setModalDesc] = useState("Confirm before proceeding");
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );

  const [modal, setModal] = useState({
    open: false,
    text: "",
    action: null,
  });

  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  const fetchData = async () => {
    try {
      const { data } = await api.get("/post-treatment/list/");
      setTableData(Array.isArray(data) ? data : []);
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

  // Filter and Pagination
  const filteredAndPaginated = useMemo(() => {
    const { search, status } = filters;
    const { recordsPerPage, currentPage } = pagination;

    const searchQuery = search.trim().toLowerCase();

    const filtered = tableData.filter((row) => {
      const createdDate = new Date(row.created_at || row.date_submitted);
      const createdYear = createdDate.getFullYear();
      const createdMonth = createdDate.getMonth() + 1;
      const createdDay = createdDate.getDate();

      const matchesSearch =
        !searchQuery ||
        row.patient?.patient_id?.toLowerCase().includes(searchQuery) ||
        row.patient?.full_name?.toLowerCase().includes(searchQuery);

      const matchesStatus =
        status === "all" || (row.status || "").toLowerCase() === status;

      const matchesMonth = !monthFilter || createdMonth === Number(monthFilter);
      const matchesYear = !yearFilter || createdYear === Number(yearFilter);
      const matchesDay = !dayFilter || createdDay === Number(dayFilter);

      return matchesSearch && matchesStatus && matchesMonth && matchesYear && matchesDay;
    });

    const totalRecords = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));

    const start = (currentPage - 1) * recordsPerPage;
    const paginatedData = filtered.slice(start, start + recordsPerPage);

    return { filtered, paginatedData, totalRecords, totalPages };
  }, [tableData, filters, pagination, monthFilter, yearFilter, dayFilter]);

  useEffect(() => {
    setPagination((p) => ({ ...p, currentPage: 1 }));
  }, [filters.search, filters.status, monthFilter, yearFilter, dayFilter]);

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
        const payload = { status: "Approved" };
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

  const handleView = (id) =>
    navigate(`/admin/treatment-assistance/postview/${id}`);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Completed: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Default: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <style>{`
        :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        @media print {
          #posttreat-root { display: none !important; }
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
        <PostTreatmentPrint rows={filteredAndPaginated.filtered} />
      </div>

      {/* SCREEN CONTENT */}
      <div id="posttreat-root">
        {loading && <SystemLoader />}

        <ConfirmationModal
          open={modal.open}
          title={modal.text}
          desc={modalDesc}
          onConfirm={doAction}
          onCancel={() => setModal({ open: false, text: "", action: null })}
        />

        <Notification message={notification} type={notificationType} />
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
            <h2 className="text-xl font-bold text-gray-800">
              Post Treatment Assistance
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  loading ? "bg-primary/60 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
                }`}
                title={loading ? "Loading data..." : "Print current list"}
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <Link
                to="/admin/treatment-assistance/add-post-treatment"
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
                Manage Post Treatment
              </h3>
            </div>

            {/* Filters Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search by patient ID or name..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-64 text-sm"
                />

                <select
                  className="border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
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

                <button
                  onClick={() => {
                    setFilters({ status: "all", search: "", date: "" });
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
                    <div className="col-span-2 text-center">Diagnosis</div>
                    <div className="col-span-2 text-center">Date Submitted</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-center">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="max-h-96 overflow-auto">
                  {filteredAndPaginated.paginatedData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No records found matching your filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredAndPaginated.paginatedData.map((p) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm"
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
                            {new Date(p.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                statusColors[p.status] || statusColors.Default
                              }`}
                            >
                              {p.status}
                              {/* <span
                                title={
                                  p.has_patient_response
                                    ? p.response_description
                                    : "No additional information"
                                }
                                className="cursor-pointer"
                              >
                                <Info
                                  size={14}
                                  className={
                                    p.has_patient_response
                                      ? "text-blue-500"
                                      : "text-gray-300"
                                  }
                                />
                              </span> */}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-center gap-2">
                            {/* <button
                              onClick={() => handleView(p.id)}
                              className="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
                            >
                              View

                            </button> */}
                            {p.status === "Pending" ? (
                              <>
                                <button
                                  onClick={() => openConfirm(p.id, "accept")}
                                  className="bg-primary cursor-pointer text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                >
                                  {/* Approve */}
                                  <CheckCircle className="w-3.5 h-3.5"/>
                                </button>
                                <button
                                  // onClick={() => openConfirm(p.id, "reject")}
                                  onClick={() => setRemarksModalOpen(true)}
                                  className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                >
                                  {/* Reject */}
                                  <X className="w-3.5 h-3.5"/>
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
                                  className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                  onClick={() => openConfirm(p.id, "delete")}
                                >
                                  {/* Cancel */}
                                  <X className="w-3.5 h-3.5"/>
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
                  Showing {filteredAndPaginated.paginatedData.length} of {filteredAndPaginated.totalRecords} records
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                      Records per page:
                    </label>
                    <select
                      id="recordsPerPage"
                      className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  <div className="flex items-center gap-2">
                    <span>
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
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: Math.max(1, prev.currentPage - 1),
                          }))
                        }
                        disabled={pagination.currentPage === 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
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

export default PostTreatment;