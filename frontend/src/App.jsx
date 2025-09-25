import { BrowserRouter, Routes, Route } from "react-router-dom";
// ----------- LAYOUTS ------------------
import RegisterLoginLayout from "./layouts/RegisterLogin";

// ----------- REGISTRATION SIDE ------------------
import SelectUserType from "./pages/SelectUserType";
// details - wala pay rhu and private
import UserRegistration from "./pages/beneficiary/registration/details/Beneficiary";
import DetailsRhu from "./pages/rhu/registration/Registration";

// note - wala pay rhu private
import NoteBeneficiary from "./pages/beneficiary/registration/note/registration/Beneficiary";
import NoteRhu from "./pages/rhu/registration/Note";

//pre enrollment - wala pay private
import NotValidated from "./pages/beneficiary/registration/note/preenrollment/NotValidated";

// ----------- REGISTRATION RHU SIDE ------------------

// ----------- LOGIN SIDE ------------------
import BeneficiaryLogin from "./pages/beneficiary/login/Login";
import RHULogin from "./pages/rhu/login/Login";
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
            <Route path="admin-login" element={<AdminLogin />} />
            <Route
              path="beneficiary-registration"
              element={<UserRegistration />}
            />
            <Route path="rhu-registration" element={<DetailsRhu />} />
            <Route path="NoteRhu" element={<NoteRhu />} />
            <Route
              path="ResetPassword"
              element={
                <ProtectedAuthenticatedRoute>
                  <ResetPassword />
                </ProtectedAuthenticatedRoute>
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

            <Route path="NotValidated" element={<NotValidated />} />
            <Route
              path="AccountNotSupported"
              element={<AccountNotSupported />}
            />
            <Route path="admin-registration" element={<AdminRegistration />} />
          </Route>

          {/* Admin Route Group */}
          {AdminRoutes()}

          {/* Beneficiary Route Group */}
          {BeneficiaryRoutes()}

          {/* RHU Route Group */}
          {RhuRoutes()}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
