import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import BeneficiarySidebar from "../components/navigation/Beneficiary";
import NotValidated from "../pages/beneficiary/registration/note/preenrollment/NotValidated";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance"; 

const BeneficiaryLayout = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);
  
  useEffect(() => {
    const fetchPreEnrollmentStatus = async () => {
      try {
        const response = await api.get('/beneficiary/details/');
        if (response.data.status === "validated") {
          setIsValidated(true);
        } else if (response.data.status === "pending") {
          setIsValidated(false);
        }
      } catch (error) {
        console.error("Error fetching pre-enrollment data:", error);
        setIsValidated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPreEnrollmentStatus();
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
