import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AddUser = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    status: "active",
  });
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    setNotification("User successfully added!");
    setTimeout(() => {
      setNotification("");
      navigate("/Admin/UserManagement");
    }, 2000);
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
      {/* Notification Popup */}
      {notification && (
        <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
          <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
            <img
              src="/images/logo_white_notxt.png"
              alt="Rafi Logo"
              className="h-[25px]"
            />
            <span>{notification}</span>
          </div>
        </div>
      )}
      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Add User</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="h-full w-full p-5 flex flex-col justify-between"
      >
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
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none "
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none "
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Password:</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none "
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Role:</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none  "
                >
                  <option value="admin">Admin</option>
                  <option value="beneficiary">Beneficiary</option>
                  <option value="rhu">rhu</option>
                  <option value="private">private</option>
                </select>
              </div>
            </div>
            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none "
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Username:</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Status:</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none  "
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-around">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15  rounded-md"
            to="/Admin/UserManagement"
          >
            CANCEL
          </Link>
          <button
            type="submit"
            className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            ADD
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
