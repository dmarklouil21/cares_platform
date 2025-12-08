import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Shield, Lock, Activity } from "lucide-react";

const ViewUser = () => {
  const location = useLocation();
  const user = location.state?.user || {};
  const [showPassword, setShowPassword] = useState(false);

  // Helper for Status Badge
  const getStatusColor = (st) => {
    return st === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          User Management
        </h2>

        {/* White Card Container */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
            <div className="flex items-center gap-3">
              {/* <div className="p-2 bg-yellow/10 rounded-full text-yellow">
                <User className="w-6 h-6" />
              </div> */}
              <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                User Profile
              </h1>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(
                user.status || "active"
              )}`}
            >
              {user.status || "active"}
            </span>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column: Personal Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> Personal Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      First Name
                    </label>
                    <div className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-medium">
                      {user.firstName || "---"}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      Last Name
                    </label>
                    <div className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-medium">
                      {user.lastName || "---"}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      Email Address
                    </label>
                    <div className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email || "---"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Account Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" /> Account Security
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      Username
                    </label>
                    <div className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                      {user.username || "---"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                        Role
                      </label>
                      <div className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 capitalize">
                        {user.role || "Admin"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                        Status
                      </label>
                      <div className="w-full  text-sm p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 capitalize flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        {user.status || "Active"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      Password
                    </label>
                    <div className="relative">
                      <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 font-mono text-sm">
                          {showPassword ? (user.password || "********") : "••••••••••••••"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer Actions */}
          <div className="flex justify-end print:hidden mt-5">
            <Link
              to="/admin/user-management"
              className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Footer Strip */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default ViewUser;