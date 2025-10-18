// Rhulayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import PrivateSidebar from "../components/navigation/Private";
// import NotValidated from "../pages/beneficiary/registration/note/preenrollment/NotValidated";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import PropagateLoaderComponent from "../components/loading/PropagateLoaderComponent ";
import TextLoader from "../components/loading/TextLoader";
import PrivateHeader from "../components/header/PrivateHeader";

// Show header ONLY on these exact paths
const HEADER_PATHS = [
  "/private", // (kept exact as requested)
  "/private", // include lowercase variant in case your route is lowercase
  "/private/cancer-awareness",
  "/private/patients",
  "/private/patients/mass-screening",
  "/private/services/cancer-screening",
  "/private/application",
  "/private/PychosocialSupport",
];

const Privatelayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      // Private layout: skip beneficiary pre-enrollment endpoint to avoid 404
      if (!user || user.is_private) {
        setIsValidated(true);
        setLoading(false);
        return;
      }
    };

    fetchStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-5 justify-center w-full h-screen bg-gray1">
        <div className="flex justify-center items-end gap-5 ">
          <TextLoader />
          <img
            src="/images/logo_white_notxt.png"
            alt="Rafi Logo Icon"
            className="h-[50px]"
          />
        </div>

        <PropagateLoaderComponent />
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen items-center justify-start bg-gray1">
      <PrivateSidebar />
      <div className="w-full h-full flex flex-col overflow-y-auto">
        <PrivateHeader />
        <Outlet />
      </div>
    </div>
  );
};

export default Privatelayout;
