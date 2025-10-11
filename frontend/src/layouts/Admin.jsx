// src/layouts/Admin.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "../components/navigation/admin";
import AdminHeader from "../components/header/AdminHeader";

const Admin = () => {
  return (
    <div className="flex w-full h-screen items-center justify-start bg-gray1">
      <AdminNav />
      <div className="w-full h-full flex flex-col overflow-y-auto">
        <AdminHeader />
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
