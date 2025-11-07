import { BrowserRouter, Routes, Route } from "react-router-dom";
// ----------- LAYOUTS ------------------
import RegisterLoginLayout from "./layouts/RegisterLogin";

// ----------- REGISTRATION SIDE ------------------
import SelectUserType from "./pages/SelectUserType";
// details - wala pay rhu and private
import UserRegistration from "./pages/beneficiary/registration/details/Beneficiary";
import DetailsRhu from "./pages/rhu/registration/Registration";
import PrivateRegistration from "./pages/private/registration/Registration"

// note - wala pay rhu private
import NoteBeneficiary from "./pages/beneficiary/registration/note/registration/Beneficiary";
import NoteRhu from "./pages/rhu/registration/Note";
import NotePrivate from "./pages/private/registration/Note";

//pre enrollment - wala pay private
import NotValidated from "./pages/beneficiary/registration/note/preenrollment/NotValidated";
import PreEnrollment from "./pages/beneficiary/PreEnrollment/PreEnrollment";
import PreScreeningForm from "./pages/beneficiary/PreEnrollment/PreScreeningForm";

// ----------- REGISTRATION RHU SIDE ------------------

// ----------- LOGIN SIDE ------------------
import BeneficiaryLogin from "./pages/beneficiary/login/Login";
import RHULogin from "./pages/rhu/login/Login";
import PrivateLogin from "./pages/private/login/Login";
import AdminLogin from "./pages/admin/login/Login";
import ResetPassword from "./pages/beneficiary/login/resetpassword";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/RoleGuard/ProtectedRoute";
import ProtectedAuthenticatedRoute from "./components/RoleGuard/ProtectedAuthenticatedRoute";
import AccountNotSupported from "./pages/AccountNotSupported";

//admin
import AdminRegistration from "./pages/admin/registration/Registration";

// Route Groups
import AdminRoutes from "./routes/AdminRoutes";
import BeneficiaryRoutes from "./routes/BeneficiaryRoutes";
import RhuRoutes from "./routes/RhuRoutes";
import PrivateRoutes from "./routes/PrivateRoutes";

import NotificationsPage from "./pages/NotificationsPage";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<RegisterLoginLayout />}>
            <Route index element={<SelectUserType />} />
            <Route path="beneficiary-login" element={<BeneficiaryLogin />} />
            <Route path="rhu-login" element={<RHULogin />} />
            <Route path="private-login" element={<PrivateLogin />} />
            <Route path="admin-login" element={<AdminLogin />} />
            <Route
              path="beneficiary-registration"
              element={<UserRegistration />}
            />
            <Route path="rhu-registration" element={<DetailsRhu />} />
            <Route path="private-registration" element={<PrivateRegistration />} />
            <Route path="NoteRhu" element={<NoteRhu />} />
            <Route path="private-registration/note" element={<NotePrivate />} />
            <Route
              path="ResetPassword"
              element={
                <ProtectedAuthenticatedRoute>
                  <ResetPassword />
                </ProtectedAuthenticatedRoute>
              }
            />

            <Route
              path="beneficiary/pre-enrollment/note"
              element={
                <ProtectedAuthenticatedRoute>
                  <NoteBeneficiary />
                </ProtectedAuthenticatedRoute>
              }
            />

            <Route 
              path="beneficiary/pre-enrollment" 
              element={
                <ProtectedAuthenticatedRoute>
                  <PreEnrollment />
                </ProtectedAuthenticatedRoute>
              }
            />

            <Route 
              path="beneficiary/pre-enrollment/cancer-data" 
              element={
                <ProtectedAuthenticatedRoute>
                  <PreScreeningForm />
                </ProtectedAuthenticatedRoute>
              } 
            />

            <Route path="NotValidated" element={<NotValidated />} />

            <Route
              path="AccountNotSupported"
              element={<AccountNotSupported />}
            />
            <Route path="admin-registration" element={<AdminRegistration />} />

            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin Route Group */}
          {AdminRoutes()}

          {/* Beneficiary Route Group */}
          {BeneficiaryRoutes()}

          {/* RHU Route Group */}
          {RhuRoutes()}

          {/* Private/Partner Route Group */}
          {PrivateRoutes()}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
