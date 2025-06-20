import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// ----------- LAYOUTS ------------------
import PatientLayout from "./layouts/Patient";
import AdminLayout from "./layouts/Admin";

// ----------- REGISTRATION SIDE ------------------
import SelectUserType from "./pages/patient/registration/SelectUserType";
// details - wala pay rhu and private
import DetailsBeneficiary from "./pages/patient/registration/details/Beneficiary";
// note - wala pay rhu and private
import NoteBeneficiary from "./pages/patient/registration/note/Beneficiary";
//pre enrollment - wala pay rhu and private
import PreEnrollmentBeneficiary from "./pages/patient/registration/preenrollment/Beneficiary";

// ----------- LOGIN SIDE ------------------
import Login from "./pages/patient/login/login";
import ResetPassword from "./pages/patient/login/resetpassword";

// ----------- ADMIN SIDE ------------------
import AdminDashboard from "./pages/admin/dashboard/Dashboard";
import AdminPreEnrollment from "./pages/admin/patient/PreEnrollment";
import AdminPatientDetails from "./pages/admin/patient/Details";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PatientLayout />}>
          <Route index element={<SelectUserType />} />
          <Route path="DetailsBeneficiary" element={<DetailsBeneficiary />} />
          <Route path="Login" element={<Login />} />
          <Route path="ResetPassword" element={<ResetPassword />} />
          <Route path="NoteBeneficiary" element={<NoteBeneficiary />} />
          <Route
            path="PreEnrollmentBeneficiary"
            element={<PreEnrollmentBeneficiary />}
          />
        </Route>
        <Route path="/Admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="AdminPreEnrollment" element={<AdminPreEnrollment />} />
          <Route
            path="AdminPatientDetails/:patientId"
            element={<AdminPatientDetails />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
