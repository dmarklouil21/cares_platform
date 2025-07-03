import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
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

const sampleUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "rhu",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "Beneficiary",
    status: "Active",
  },
  {
    id: 4,
    name: "SHISH Johnson",
    email: "alice.johnson@example.com",
    role: "private",
    status: "Active",
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredResults = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      user.id.toString().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.status.toLowerCase() === "active") ||
      (statusFilter === "inactive" && user.status.toLowerCase() === "inactive");
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

  const handleActionClick = (id, action) => {
    setNotification(
      `${action.charAt(0).toUpperCase() + action.slice(1)} user successfully`
    );
    setTimeout(() => setNotification(""), 3500);
    // For demo, you can add logic to update users state if needed
  };

  const navigate = useNavigate();
  const handleViewClick = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      // Map sample user fields to match AddUser/ViewUser fields
      const userDetails = {
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        email: user.email,
        username: user.email.split("@")[0],
        password: "********",
        confirmPassword: "********",
        role: user.role ? user.role.toLowerCase() : "admin",
        status: user.status ? user.status.toLowerCase() : "active",
      };
      navigate("view-user", { state: { user: userDetails } });
    }
  };

  const handleEditClick = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      // Map sample user fields to match AddUser/EditUser fields
      const userDetails = {
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        email: user.email,
        username: user.email.split("@")[0],
        password: "********",
        confirmPassword: "********",
        role: user.role ? user.role.toLowerCase() : "admin",
        status: user.status ? user.status.toLowerCase() : "active",
      };
      navigate("edit-user", { state: { user: userDetails } });
    }
  };

  return (
    <>
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
      <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
        <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
          <h1 className="text-md font-bold h-full flex items-center ">Admin</h1>
          <Link
            to="/Admin/UserManagement/add-user"
            className="bg-yellow gap-3 flex justify-center items-center px-5 py-1 rounded-sm"
          >
            <img
              src="/images/add.svg"
              alt="Add User Icon"
              className="h-[18px]"
            />
            <p className="text-white text-sm">Add User</p>
          </Link>
        </div>
        <div className=" w-full flex-1 py-5 flex flex-col justify-around px-5">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            User Management
          </h2>
          <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-3">
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
              <button className="px-7 rounded-md text-sm text-white bg-lightblue">
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
                    <th className="w-[13.4%] text-center text-sm py-3">
                      Status
                    </th>
                    <th className="w-[23%] text-center text-sm py-3 ">
                      Actions
                    </th>
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
                          {user.name}
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
                              user.status === "Active"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="text-center text-sm py-4 flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewClick(user.id)}
                            className="text-white py-1 px-3 rounded-md shadow bg-primary"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditClick(user.id)}
                            className="text-white py-1 px-3 rounded-md shadow bg-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleActionClick(user.id, "reject")}
                            className="text-white py-1 px-3 rounded-md shadow bg-red-500"
                          >
                            Reject
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
                <label
                  htmlFor="recordsPerPage"
                  className="text-sm text-gray-700"
                >
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
                  {Math.min(
                    (currentPage - 1) * recordsPerPage + 1,
                    totalRecords
                  )}{" "}
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
      </div>
    </>
  );
};

export default UserManagement;
