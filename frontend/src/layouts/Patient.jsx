import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "../components/navigation/Patient";
import NotValidated from "../pages/patient/registration/note/preenrollment/NotValidated";

const PatientLayout = () => {
  const [loading, setLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  // Sample data -
  const sampleUser = {
    id: "pat-12345",
    name: "Sample Patient",
    preEnrollment: {
      validated: false,
      submittedDate: "2023-11-15",
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsValidated(sampleUser.preEnrollment.validated);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray1">
        <p>Checking your enrollment status...</p>
      </div>
    );
  }

  if (!isValidated) {
    return (
      <NotValidated
        userName={sampleUser.name}
        submittedDate={sampleUser.preEnrollment.submittedDate}
      />
    );
  }

  return (
    <div className="flex w-full h-screen items-center justify-start bg-gray1">
      <PatientSidebar />
      <Outlet />
    </div>
  );
};

export default PatientLayout;
