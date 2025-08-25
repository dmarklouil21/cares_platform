import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import BeneficiarySidebar from "../components/navigation/Beneficiary";
import NotValidated from "../pages/beneficiary/registration/note/preenrollment/NotValidated";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import PropagateLoaderComponent from "../components/loading/PropagateLoaderComponent ";
import TextLoader from "../components/loading/TextLoader";

const BeneficiaryLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const fetchPreEnrollmentStatus = async () => {
      try {
        const response = await api.get("/beneficiary/patient/details/");
        const status = response.data.status;
        if (status === "validated") {
          setIsValidated(true);
        } else if (status === "pending") {
          setIsValidated(false);
        } 
      } catch (error) {
        console.error("Error fetching pre-enrollment data:", error);
        // navigate("/PreEnrollmentBeneficiary");
        setIsValidated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPreEnrollmentStatus();
  }, []);

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

  if (!isValidated) {
    return (
      <NotValidated
        fullName={user.first_name}
        submittedDate={user.date_of_birth}
      />
    );
  }

  return (
    <div className="flex w-full h-screen items-center justify-start bg-gray1">
      <BeneficiarySidebar />
      <Outlet />
    </div>
  );
};

export default BeneficiaryLayout;
