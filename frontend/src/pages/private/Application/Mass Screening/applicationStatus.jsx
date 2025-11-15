import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, Plus, Pencil, X, RotateCcw} from "lucide-react";
import {
  listMyPrivateMassScreenings,
  deleteMyPrivateMassScreening,
} from "src/api/massScreening";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";

const MassScreeningStatus = () => {
  const navigate = useNavigate();

  // Data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Pagination
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listMyPrivateMassScreenings();
      const normalized = (Array.isArray(data) ? data : []).map((d) => ({
        id: d.id,
        title: d.title,
        date: d.date,
        beneficiaries: d.beneficiaries,
        status: d.status,
        description: d.description,
        supportNeed: d.support_need,
        attachments: d.attachments || [],
      }));
      setItems(normalized);
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load applications.");
      setNotification("Failed to load applications.");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch =
        !q ||
        String(it.id ?? "").toLowerCase().includes(q) ||
        (it.title ?? "").toLowerCase().includes(q) ||
        (it.beneficiaries ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ? true : (it.status ?? "") === statusFilter;
      const matchesDate = !dateFilter ? true : (it.date ?? "") === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [items, searchQuery, statusFilter, dateFilter]);

  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  
  useEffect(() => {
    setCurrentPage(1);
  }, [recordsPerPage, searchQuery, statusFilter, dateFilter, totalRecords]);

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

  // Action handlers
  const handleViewClick = (id) => {
    const record = items.find((x) => x.id === id);
    navigate(`/private/application/mass-screening/view?id=${encodeURIComponent(id)}`, {
      state: record ?? { id },
    });
  };

  const handleDeleteClick = (id) => {
    setModalText("Confirm Delete");
    setModalDesc("Are you sure you want to delete this mass screening request? This action cannot be undone.");
    setModalAction({ type: "delete", id });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "delete") {
      try {
        setModalOpen(false);
        setLoading(true);
        await deleteMyPrivateMassScreening(modalAction.id);
        
        setNotification("Record deleted successfully.");
        setNotificationType("success");
        setTimeout(() => setNotification(""), 2000);
        await loadItems();
      } catch (e) {
        setNotification(e?.response?.data?.detail || "Failed to delete record.");
        setNotificationType("error");
        setTimeout(() => setNotification(""), 2000);
      } finally {
        setLoading(false);
      }
    }
    setModalOpen(false);
    setModalAction(null);
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Verified: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Done: "bg-blue-100 text-blue-700",
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
      <Notification message={notification} type={notificationType} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-gray-800">
            Mass Screening Requests
          </h2>
          {/* <Link
            to="/rhu/application/mass-screening/add"
            className="bg-yellow hover:bg-yellow/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            Add New
          </Link> */}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-600">
              Manage all mass screening requests
            </h3>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search by Mass ID, title, or beneficiaries..."
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

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 py-2 px-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />

              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFilter("");
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
                  <div className="col-span-2 text-center">Mass ID</div>
                  <div className="col-span-3 text-center">Title</div>
                  <div className="col-span-2 text-center">Date</div>
                  <div className="col-span-2 text-center">Beneficiaries</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-auto">
                {paginatedData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No mass screening requests found matching your filters.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {paginatedData.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm"
                      >
                        <div 
                          className="col-span-2 text-center text-blue-500 cursor-pointer font-medium"
                          onClick={() => handleViewClick(item.id)}
                        >
                          {item.id || "—"}
                        </div>
                        <div className="col-span-3 text-center text-gray-800">
                          {item.title || "—"}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {formatDate(item.date)}
                        </div>
                        <div className="col-span-2 text-center text-gray-800">
                          {item.beneficiaries || "—"}
                        </div>
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[item.status] || statusColors.Default
                            }`}
                          >
                            {item.status || "—"}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-center gap-1">
                          {item.status !== "Completed" && (
                            <button
                              onClick={() => handleDeleteClick(item.id)} // Cancel 
                              className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                              title="Delete Request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* {item.status === "Rejected" && (
                            <button
                              onClick={() => handleDeleteClick(item.id)} // Resubmit
                              className="bg-yellow hover:bg-yellow/90 cursor-pointer text-white py-1.5 px-2 rounded transition-colors"
                              title="Resubmit Application"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )} */}
                          {item.status === "Completed" && (
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) }
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
                  onChange={handleRecordsPerPageChange}
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
                    onClick={handlePrev}
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
                    onClick={handleNext}
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

export default MassScreeningStatus;