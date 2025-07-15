import { BrowserRouter, Routes, Route } from "react-router-dom";
// ----------- LAYOUTS ------------------
import RegisterLoginLayout from "./layouts/RegisterLogin";
import AdminLayout from "./layouts/Admin";
import BeneficiaryLayout from "./layouts/Beneficiary";

// ----------- REGISTRATION SIDE ------------------
import SelectUserType from "./pages/beneficiary/registration/SelectUserType";
// details - wala pay rhu and private
import UserRegistration from "./pages/beneficiary/registration/details/Beneficiary";
// note - wala pay rhu and private
import NoteBeneficiary from "./pages/beneficiary/registration/note/registration/Beneficiary";
//pre enrollment - wala pay rhu and private
import PreEnrollmentBeneficiary from "./pages/beneficiary/registration/preenrollment/Beneficiary";
import NotValidated from "./pages/beneficiary/registration/note/preenrollment/NotValidated";

// ----------- LOGIN SIDE ------------------
import Login from "./pages/beneficiary/login/Login";
import ResetPassword from "./pages/beneficiary/login/resetpassword";

// ----------- ADMIN SIDE ------------------
import AdminDashboard from "./pages/admin/dashboard/Dashboard";
import AdminPreEnrollment from "./pages/admin/patient/PreEnrollment";
import AdminIndividualScreening from "./pages/admin/patient/IndividualScreening";
import AdminUserManagement from "./pages/admin/usermanagement/UserManagement";

// ----------- ADMIN VIEW SIDE ------------------
import AdminPreenrollmentDetails from "./pages/admin/patient/view/PreenrollmentView";
import AdminIndividualScreeningView from "./pages/admin/patient/view/IndividualScreeningView";

// ----------- User Management actions ------------------
import AdminManagementAddUser from "./pages/admin/usermanagement/add/AddUser";
import AdminManagementViewUser from "./pages/admin/usermanagement/view/ViewUser";
import AdminManagementEditUser from "./pages/admin/usermanagement/edit/EditUser";

// ----------- BENEFICIARY SIDE ------------------
import BeneficiaryHomePage from "./pages/beneficiary/home/Home";
import BeneficiaryCancerScreening from "./pages/beneficiary/services/CancerScreening";
import CancerManagement from "./pages/beneficiary/services/CancerManagement";
import Survivorship from "./pages/beneficiary/services/Survivorship";
import BeneficiaryApplicationStatus from "./pages/beneficiary/applicationstatus/ApplicationStatus";

// ----------- Application actions ------------------
import BeneficiaryApplicationView from "./pages/beneficiary/applicationstatus/view/ViewApplication";

import { AuthProvider } from "./context/AuthContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RegisterLoginLayout />}>
            <Route index element={<SelectUserType />} />
            <Route path="UserRegistration" element={<UserRegistration />} />
            <Route path="Login" element={<Login />} />
            <Route
              path="ResetPassword"
              element={
                <ProtectedRoute>
                  <ResetPassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="NoteBeneficiary"
              element={
                <ProtectedRoute>
                  <NoteBeneficiary />
                </ProtectedRoute>
              }
            />
            <Route
              path="PreEnrollmentBeneficiary"
              element={
                <ProtectedRoute>
                  <PreEnrollmentBeneficiary />
                </ProtectedRoute>
              }
            />
            <Route path="NotValidated" element={<NotValidated />} />
          </Route>
          <Route
            path="/Admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="patient">
              <Route
                path="AdminPreEnrollment"
                element={<AdminPreEnrollment />}
              />
              <Route
                path="AdminIndividualScreening"
                element={<AdminIndividualScreening />}
              />
              <Route path="view">
                <Route
                  path="AdminPreenrollmentDetails/:beneficiary_id"
                  element={<AdminPreenrollmentDetails />}
                />

                <Route
                  path="AdminIndividualScreeningView"
                  element={<AdminIndividualScreeningView />}
                />
              </Route>
            </Route>

            <Route path="UserManagement">
              <Route index element={<AdminUserManagement />} />
              <Route path="add-user" element={<AdminManagementAddUser />} />
              <Route path="view-user" element={<AdminManagementViewUser />} />
              <Route path="edit-user" element={<AdminManagementEditUser />} />
            </Route>
          </Route>
          <Route
            path="/Beneficiary"
            element={
              <ProtectedRoute>
                <BeneficiaryLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BeneficiaryHomePage />} />
            <Route path="services">
              <Route
                path="cancer-screening"
                element={<BeneficiaryCancerScreening />}
              />
              <Route path="cancer-management" element={<CancerManagement />} />
              <Route path="survivorship" element={<Survivorship />} />
            </Route>
            <Route path="awareness">
              <Route path="sample1" element={<div>Awareness Sample 1</div>} />
              <Route path="sample2" element={<div>Awareness Sample 2</div>} />
            </Route>
            <Route path="applicationstatus">
              <Route index element={<BeneficiaryApplicationStatus />} />
              <Route
                path="application-view"
                element={<BeneficiaryApplicationView />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
