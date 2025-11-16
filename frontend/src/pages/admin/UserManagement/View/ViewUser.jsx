import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const ViewUser = () => {
  // Get user data from location state (passed from UserManagement View button)
  const location = useLocation();
  const user = location.state?.user || {};
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
      <form className="h-full w-full p-5 flex flex-col justify-between">
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className=" rounded-sm py-3 px-5 w-full flex justify-between items-center">
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
                <div className="relative border border-gray-300 rounded px-3 py-2 bg-gray-100 flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={user.password || "********"}
                    disabled
                    className="w-full bg-gray-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex items-center cursor-pointer ml-2"
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {!showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 001.42-.38M9.88 4.24A9.98 9.98 0 0112 4c5.52 0 10 4.48 10 8 0 1.32-.45 2.56-1.25 3.63M6.35 6.35C4.31 7.68 3 9.69 3 12c0 3.52 4.48 8 9 8 1.04 0 2.04-.17 2.97-.49"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                        />
                        <circle cx="12" cy="12" r="3" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
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
            className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black  rounded-md"
            to="/admin/user-management"
          >
            BACK
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ViewUser;
