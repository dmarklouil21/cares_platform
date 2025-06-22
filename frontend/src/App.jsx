import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// ----------- LAYOUTS ------------------
import RegisterLoginLayout from "./layouts/RegisterLogin";
import AdminLayout from "./layouts/Admin";
import PatientLayout from "./layouts/Patient";

// ----------- REGISTRATION SIDE ------------------
import SelectUserType from "./pages/patient/registration/SelectUserType";
// details - wala pay rhu and private
import DetailsBeneficiary from "./pages/patient/registration/details/Beneficiary";
// note - wala pay rhu and private
import NoteBeneficiary from "./pages/patient/registration/note/registration/Beneficiary";
//pre enrollment - wala pay rhu and private
import PreEnrollmentBeneficiary from "./pages/patient/registration/preenrollment/Beneficiary";

// ----------- LOGIN SIDE ------------------
import Login from "./pages/patient/login/login";
import ResetPassword from "./pages/patient/login/resetpassword";

// ----------- ADMIN SIDE ------------------
import AdminDashboard from "./pages/admin/dashboard/Dashboard";
import AdminPreEnrollment from "./pages/admin/patient/PreEnrollment";
import IndividualScreening from "./pages/admin/patient/IndividualScreening";

// ----------- ADMIN VIEW SIDE ------------------
import AdminPreenrollmentDetails from "./pages/admin/patient/view/PreenrollmentView";
import AdminIndividualScreeningView from "./pages/admin/patient/view/IndividualScreeningView";

// ----------- PATIENT SIDE ------------------
import PatientHomePage from "./pages/patient/home/Home";
import PatientCancerScreening from "./pages/patient/services/CancerScreening";
import CancerManagement from "./pages/patient/services/CancerManagement";
import Survivorship from "./pages/patient/services/Survivorship";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterLoginLayout />}>
          <Route index element={<SelectUserType />} />
          <Route path="DetailsBeneficiary" element={<DetailsBeneficiary />} />
          <Route path="Login" element={<Login />} />
          <Route path="ResetPassword" element={<ResetPassword />} />
          <Route path="NoteBeneficiary" element={<NoteBeneficiary />} />
          <Route
            path="PreEnrollmentBeneficiary"
            element={<PreEnrollmentBeneficiary />}
          />
          <Route path="PatientHomePage" element={<PatientHomePage />} />
        </Route>
        <Route path="/Admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="patient">
            <Route path="AdminPreEnrollment" element={<AdminPreEnrollment />} />
            <Route
              path="AdminIndividualScreening"
              element={<IndividualScreening />}
            />
            <Route path="view">
              <Route
                path="AdminPreenrollmentDetails/:patientId"
                element={<AdminPreenrollmentDetails />}
              />

              <Route
                path="AdminIndividualScreeningView"
                element={<AdminIndividualScreeningView />}
              />
            </Route>
          </Route>
        </Route>
        <Route path="/Patient" element={<PatientLayout />}>
          <Route index element={<PatientHomePage />} />
          <Route path="services">
            <Route
              path="cancer-screening"
              element={<PatientCancerScreening />}
            />
            <Route path="cancer-management" element={<CancerManagement />} />
            <Route path="survivorship" element={<Survivorship />} />
          </Route>
          <Route path="awareness">
            <Route path="sample1" element={<div>Awareness Sample 1</div>} />
            <Route path="sample2" element={<div>Awareness Sample 2</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
