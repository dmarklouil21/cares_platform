import React from "react";
import { useLocation, Link } from "react-router-dom";

const ViewUser = () => {
  // Get user data from location state (passed from UserManagement View button)
  const location = useLocation();
  const user = location.state?.user || {};

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">View User</h1>
      </div>
      <form className="h-full w-full p-5 flex flex-col justify-between">
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Account Information</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            {/* First Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">First Name:</label>
                <input
                  type="text"
                  value={user.firstName || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email:</label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Role:</label>
                <select
                  value={user.role || "admin"}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 appearance-none"
                >
                  <option value="admin">Admin</option>
                  <option value="beneficiary">Beneficiary</option>
                  <option value="rhu">rhu</option>
                  <option value="private">private</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Password:</label>
                <input
                  type="password"
                  value={user.password || "********"}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Last Name:</label>
                <input
                  type="text"
                  value={user.lastName || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Username:</label>
                <input
                  type="text"
                  value={user.username || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Status:</label>
                <select
                  value={user.status || "active"}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15  rounded-md"
            to="/Admin/UserManagement"
          >
            BACK
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ViewUser;
