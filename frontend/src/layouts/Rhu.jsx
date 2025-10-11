// Rhulayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import RhuSidebar from "../components/navigation/Rhu";
// import NotValidated from "../pages/beneficiary/registration/note/preenrollment/NotValidated";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import PropagateLoaderComponent from "../components/loading/PropagateLoaderComponent ";
import TextLoader from "../components/loading/TextLoader";
import RhuHeader from "../components/header/RhuHeader";

// Show header ONLY on these exact paths
const HEADER_PATHS = [
  "/Rhu", // (kept exact as requested)
  "/rhu", // include lowercase variant in case your route is lowercase
  "/rhu/cancer-awareness",
  "/rhu/patients",
  "/rhu/patients/mass-screening",
  "/rhu/services/cancer-screening",
  "/rhu/application",
  "/rhu/PychosocialSupport",
];

const Rhulayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      // RHU layout: skip beneficiary pre-enrollment endpoint to avoid 404
      if (!user || user.is_rhu) {
        setIsValidated(true);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/beneficiary/details/");
        const status = response.data.status;
        setIsValidated(status === "validated");
      } catch (error) {
        console.error("Error fetching pre-enrollment data:", error);
        setIsValidated(false);
      } finally {
        setLoading(false);
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
      <RhuSidebar />
      <div className="w-full h-full flex flex-col overflow-y-auto">
        <RhuHeader />
        <Outlet />
      </div>
    </div>
  );
};

export default Rhulayout;
