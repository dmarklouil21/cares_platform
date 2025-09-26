// src/layouts/Admin.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminNav from "../components/navigation/Admin";
import AdminHeader from "../components/header/AdminHeader";

const HEADER_PATHS = [
  "/admin",
  "/admin/patient/pre-enrollment",
  "/admin/patient/master-list",
  "/admin/cancer-screening",
  "/admin/cancer-screening/mass-screening",
  "/admin/treatment-assistance/pre-cancerous",
  "/admin/treatment-assistance/post-treatment",
  "/admin/survivorship",
  "/admin/cancer-management",
  "/admin/user-management",
];

const Admin = () => {
  const location = useLocation();

  // exact matches only; remove trailing slash to avoid mismatch
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const showHeader = HEADER_PATHS.includes(pathname);

  return (
    <div className="flex w-full h-screen items-center justify-start bg-gray1">
      <AdminNav />
      <div className="w-full h-full flex flex-col overflow-y-auto">
        {showHeader && <AdminHeader />}
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
