import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "../components/navigation/Admin";

const Admin = () => {
  return (
    <div className="flex w-full h-screen items-center justify-start bg-gray1">
      <AdminNav />
      <Outlet />
    </div>
  );
};

export default Admin;
