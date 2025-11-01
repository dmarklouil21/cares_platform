// src/pages/user-management/UserManagement.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Printer, Info, CheckCircle, X, Trash2, Pencil } from "lucide-react";
import {
  fetchUsers,
  deleteUser,
  updateUser,
} from "../../../services/userManagementService";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";

import UserManagementPrint from "./generate/generate";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [modalDesc, setModalDesc] = useState(
    "Are you sure you want to proceed with this action?"
  );

  // Date filters
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const filteredResults = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase();
    const fullName = user.full_name?.trim().toLowerCase();

    const matchesSearch =
      !query ||
      user.id?.toString().includes(query) ||
      fullName?.includes(query) ||
      (user.email || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    
    // 📅 Date filter logic
    const userDate = user.created_at ? new Date(user.created_at) : null;
    const userDay = userDate ? userDate.getDate() : null;
    const userMonth = userDate ? userDate.getMonth() + 1 : null; // months are 0-based
    const userYear = userDate ? userDate.getFullYear() : null;

    const matchesDay = !dayFilter || userDay === parseInt(dayFilter);
    const matchesMonth = !monthFilter || userMonth === parseInt(monthFilter);
    const matchesYear = !yearFilter || userYear === parseInt(yearFilter);
    return matchesSearch && matchesStatus && matchesDay  && matchesMonth && matchesYear;
  });

  const totalRecords = filteredResults.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedData = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Fetch users from API
  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      setNotification("Failed to fetch users");
      setNotificationType("error");
      setTimeout(() => setNotification(""), 3500);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Modal confirm handler
  const handleModalConfirm = async () => {
    if (modalAction && modalAction.action === "delete" && modalAction.id) {
      try {
        await deleteUser(modalAction.id);
        setNotification("User deleted successfully");
        setNotificationType("success");
        loadUsers();
      } catch (error) {
        setNotification("Failed to delete user");
        setNotificationType("error");
      }
      setTimeout(() => setNotification(""), 3500);
    } else {
      setNotification(
        `${
          modalAction?.action?.charAt(0).toUpperCase() +
          modalAction?.action?.slice(1)
        } user successfully`
      );
      setNotificationType("success");
      setTimeout(() => setNotification(""), 3500);
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  // Show modal for delete/reject
  const handleActionClick = (id, action) => {
    if (action === "delete") {
      setModalText("Are you sure you want to delete this user?");
      setModalDesc("This action cannot be undone.");
      setModalAction({ id, action });
      setModalOpen(true);
    } else if (action === "reject") {
      setModalText("Are you sure you want to reject this user?");
      setModalDesc("This user will be deactivated.");
      setModalAction({ id, action });
      setModalOpen(true);
    }
  };

  // Accept user
  const handleAccept = async (id) => {
    try {
      await updateUser(id, { is_active: true });
      setNotification("User accepted and activated");
      setNotificationType("success");
      loadUsers();
    } catch (error) {
      setNotification("Failed to accept user");
      setNotificationType("error");
    }
    setTimeout(() => setNotification(""), 3500);
  };

  // Reject user
  const handleReject = async (id) => {
    try {
      await updateUser(id, { is_active: false });
      setNotification("User rejected and deactivated");
      setNotificationType("success");
      loadUsers();
    } catch (error) {
      setNotification("Failed to reject user");
      setNotificationType("error");
    }
    setTimeout(() => setNotification(""), 3500);
  };

  const handleViewClick = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      const userDetails = {
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email,
        username: user.email ? user.email.split("@")[0] : "",
        password: "********",
        confirmPassword: "********",
        role: user.role ? user.role.toLowerCase() : "admin",
        status: user.is_active ? "active" : "inactive",
      };
      navigate("/admin/user-management/view", { state: { user: userDetails } });
    }
  };

  const handleEditClick = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      navigate("edit", { state: { user } });
    }
  };

  const statusColors = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
    Default: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <style>{`
        :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        @media print {
          #um-root { display: none !important; }
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
        <UserManagementPrint rows={filteredResults} />
      </div>

      {/* SCREEN CONTENT */}
      <div id="um-root">
        <ConfirmationModal
          open={modalOpen}
          title={modalText}
          desc={modalDesc}
          onConfirm={handleModalConfirm}
          onCancel={() => {
            setModalOpen(false);
            setModalAction(null);
            setModalText("");
          }}
        />
        
        <Notification message={notification} type={notificationType} />

        <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-gray-800">
              User Management
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
                title="Print current list"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <Link
                to="/admin/user-management/add"
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
                Manage All System Users
              </h3>
            </div>

            {/* Filters Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                    filteredResults.map((p) =>
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
                    <div className="col-span-4 text-center">Name</div>
                    <div className="col-span-3 text-center">Email</div>
                    <div className="col-span-1 text-center">Role</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-center">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="max-h-96 overflow-auto">
                  {paginatedData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No records found matching your filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {paginatedData.map((user) => (
                        <div
                          key={user.id}
                          className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 items-center text-sm"
                        >
                          <div className="col-span-4 text-center text-gray-800">
                            {`${user.first_name || ""} ${
                              user.last_name || ""
                            }`.trim()}
                          </div>
                          <div 
                            className="col-span-3 text-center cursor-pointer text-blue-500"
                            onClick={() => handleViewClick(user.id)}
                          >
                            {user.email}
                          </div>
                          <div className="col-span-1 text-center text-gray-800">
                            {user.role}
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                statusColors[user.is_active ? "active" : "inactive"] || statusColors.Default
                              }`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-center gap-2">
                            {/* <button
                              onClick={() => handleViewClick(user.id)}
                              className="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
                            >
                              View
                            </button> */}
                            <button
                              onClick={() => handleEditClick(user.id)}
                              className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5"/>
                            </button>
                            <button
                              onClick={() => handleActionClick(user.id, "delete")}
                              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
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
                  Showing {paginatedData.length} of {totalRecords} records
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
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
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)}{" "}
                      – {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
                      {totalRecords}
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

export default UserManagement;