// Modal component for confirmation
function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-xl font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/50"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  fetchUsers,
  deleteUser,
  updateUser,
} from "../../../services/userManagementService";
// Notification component for showing popup messages
function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
      <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
        <img
          src="/images/logo_white_notxt.png"
          alt="Rafi Logo"
          className="h-[25px]"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null); // {id, action}

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  // Fix: Use first_name + last_name for display and search
  const filteredResults = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase();
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`
      .trim()
      .toLowerCase();
    const matchesSearch =
      !query ||
      user.id?.toString().includes(query) ||
      fullName.includes(query) ||
      (user.email || "").toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    return matchesSearch && matchesStatus;
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
      setTimeout(() => setNotification(""), 3500);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Modal confirm handler
  const handleModalConfirm = async () => {
    console.log("Modal Confirm:", modalAction); // Debug log
    if (modalAction && modalAction.action === "delete" && modalAction.id) {
      try {
        await deleteUser(modalAction.id);
        setNotification("User deleted successfully");
        loadUsers();
      } catch (error) {
        setNotification("Failed to delete user");
      }
      setTimeout(() => setNotification(""), 3500);
    } else {
      setNotification(
        `${
          modalAction?.action?.charAt(0).toUpperCase() +
          modalAction?.action?.slice(1)
        } user successfully`
      );
      setTimeout(() => setNotification(""), 3500);
    }
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  // Modal cancel handler (just close modal, no action)
  const handleModalCancel = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  // Show modal for delete
  const handleActionClick = (id, action) => {
    console.log("handleActionClick:", { id, action }); // Debug log
    if (action === "delete") {
      setModalText("Are you sure you want to delete this user?");
      setModalAction({ id, action });
      setModalOpen(true);
    } else if (action === "reject") {
      setModalText("Are you sure you want to reject this user?");
      setModalAction({ id, action });
      setModalOpen(true);
    } else {
      setNotification(
        `${action.charAt(0).toUpperCase() + action.slice(1)} user successfully`
      );
      setTimeout(() => setNotification(""), 3500);
    }
  };

  // Accept user
  const handleAccept = async (id) => {
    try {
      await updateUser(id, { is_active: true });
      setNotification("User accepted and activated");
      loadUsers();
    } catch (error) {
      setNotification("Failed to accept user");
    }
    setTimeout(() => setNotification(""), 3500);
  };

  // Reject user
  const handleReject = async (id) => {
    try {
      await updateUser(id, { is_active: false });
      setNotification("User rejected and deactivated");
      loadUsers();
    } catch (error) {
      setNotification("Failed to reject user");
    }
    setTimeout(() => setNotification(""), 3500);
  };

  const navigate = useNavigate();
  // Fix: View button logic
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

  // Fix: Edit button logic
  const handleEditClick = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      // Pass the full user object, including id
      navigate("edit", { state: { user } });
    }
  };

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
      <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            User Management
          </h2>
          <Link
            to="/admin/user-management/add"
            className="bg-yellow px-5 py-1 rounded-sm text-white"
          >
            Add
          </Link>
        </div>
        <div className="flex flex-col bg-white w-full rounded-[4px] shadow-md px-5 py-5 gap-3">
          <p className="text-md font-semibold text-yellow">
            Manage all system users
          </p>
          <div className="flex justify-between flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <input
              type="date"
              className="border border-gray-200 py-2 px-5 rounded-md"
            />
            <button className="px-7 rounded-md text-sm bg-[#C5D7E5]">
              Filter
            </button>
          </div>
          <div className="bg-white shadow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-lightblue">
                  <th className="w-[25%] text-center text-sm py-3 !bg-lightblue">
                    Name
                  </th>
                  <th className="w-[25%] text-center text-sm py-3">Email</th>
                  <th className="w-[12%] text-center text-sm py-3">Role</th>
                  <th className="w-[13.4%] text-center text-sm py-3">Status</th>
                  <th className="w-[23%] text-center text-sm py-3 ">Actions</th>
                  {paginatedData.length >= 4 && (
                    <th className="!bg-lightblue w-[1.6%] p-0 m-0"></th>
                  )}
                </tr>
              </thead>
            </table>
            <div className="max-h-[200px] min-h-[200px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 border-spacing-0">
                <colgroup>
                  <col className="w-[25%]" />
                  <col className="w-[25%] " />
                  <col className="w-[12%]" />
                  <col className="w-[13.4%]" />
                  <col className="w-[23%]" />
                </colgroup>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((user) => (
                    <tr key={user.id}>
                      <td className="text-center text-sm py-4 text-gray-800">
                        {/* Fix: Use first_name + last_name for display */}
                        {`${user.first_name || ""} ${
                          user.last_name || ""
                        }`.trim()}
                      </td>
                      <td className="text-center text-sm py-4 text-gray-800">
                        {user.email}
                      </td>
                      <td className="text-center text-sm py-4 text-gray-800">
                        {user.role}
                      </td>
                      <td className="text-center text-sm py-4 text-gray-800">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-md ${
                            user.is_active
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-center text-sm py-4 flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewClick(user.id)}
                          className="text-white py-1 px-3 rounded-[5px] shadow bg-primary"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditClick(user.id)}
                          className="text-white py-1 px-3 rounded-[5px] shadow bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            console.log(
                              "Delete button clicked for user:",
                              user
                            ); // Debug log
                            handleActionClick(user.id, "delete");
                          }}
                          className="text-white py-1 px-3 rounded-[5px] shadow bg-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
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
                {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)}{" "}
                – {Math.min(currentPage * recordsPerPage, totalRecords)} of{" "}
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
      </div>
    </>
  );
};

export default UserManagement;
