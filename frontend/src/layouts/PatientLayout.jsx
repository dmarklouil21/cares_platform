import React from "react";
import { Outlet } from "react-router-dom";
import GreetPanel from "../components/GreetPanel";

const PatientLayout = () => {
  return (
    <div className="flex w-full h-screen items-center justify-start bg-gray1">
      <GreetPanel />
      <Outlet />
    </div>
  );
};

export default PatientLayout;
