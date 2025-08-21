import { BrowserRouter, Routes, Route } from "react-router-dom";
// ----------- LAYOUTS ------------------
import RegisterLoginLayout from "./layouts/RegisterLogin";
import AdminLayout from "./layouts/Admin";
import BeneficiaryLayout from "./layouts/Beneficiary";
import RhuLayout from "./layouts/Rhu";

// ----------- REGISTRATION SIDE ------------------
import SelectUserType from "./pages/SelectUserType";
// details - wala pay rhu and private
import UserRegistration from "./pages/beneficiary/registration/details/Beneficiary";
import DetailsRhu from "./pages/rhu/registration/Registration";

// note - wala pay rhu private
import NoteBeneficiary from "./pages/beneficiary/registration/note/registration/Beneficiary";
import NoteRhu from "./pages/rhu/registration/Note";

//pre enrollment - wala pay private
import PreEnrollmentBeneficiary from "./pages/beneficiary/registration/preenrollment/Beneficiary";
import NotValidated from "./pages/beneficiary/registration/note/preenrollment/NotValidated";

// ----------- REGISTRATION RHU SIDE ------------------

// ----------- LOGIN SIDE ------------------
import BeneficiaryLogin from "./pages/beneficiary/login/Login";
import RHULogin from "./pages/rhu/login/Login";
import AdminLogin from "./pages/admin/login/Login";
import ResetPassword from "./pages/beneficiary/login/resetpassword";

// ----------- ADMIN SIDE ------------------
import AdminDashboard from "./pages/admin/dashboard/Dashboard";
import AdminPreEnrollment from "./pages/admin/patient/PreEnrollment";
import AdminIndividualScreening from "./pages/admin/cancerscreening/IndividualScreening";
import AdminUserManagement from "./pages/admin/usermanagement/UserManagement";
import AdminScreeningRequest from "./pages/admin/cancerscreening/ScreeningRequest";
import AdminPatientMasterList from "./pages/admin/patient/PatientMasterList";

// ----------- ADMIN VIEW SIDE ------------------
import AdminPreenrollmentDetails from "./pages/admin/patient/view/PreenrollmentView";
import AdminIndividualScreeningView from "./pages/admin/cancerscreening/view/IndividualScreeningView";
import ViewPreScreeningForm from "./pages/admin/cancerscreening/view/ViewPreScreeningForm";
import ViewScreeningProcedure from "./pages/admin/cancerscreening/view/ViewScreeningProcedure";
import ViewAttachments from "./pages/admin/cancerscreening/view/ViewAttachments";
import ViewResults from "./pages/admin/cancerscreening/view/ViewResults";
import AdminPatientMasterListView from "./pages/admin/patient/view/PatientMasterListView";

// ----------- ADMIN EDIT SIDE ------------------
import AdminPatientMasterListEdit from "./pages/admin/patient/edit/PatientMasterListEdit";

// ----------- ADMIN ADD SIDE ------------------
import AdminPatientMasterListAdd from "./pages/admin/patient/add/PatientMasterListAdd";

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
import BeneficiaryIndividualScreeningStatus from "./pages/beneficiary/individualscreeningstatus/IndividualScreeningStatus";
import BeneficiaryCancerAwareness from "./pages/beneficiary/cancerawareness/CancerAwareness";
import UploadAttachments from "./pages/beneficiary/individualscreeningstatus/UploadAttachments";

// ----------- Application actions ------------------
import BeneficiaryApplicationView from "./pages/beneficiary/applicationstatus/view/ViewApplication";

// ----------- IndividualScreeningStatus actions ------------------
import BeneficiaryIndividualScreeningStatusView from "./pages/beneficiary/individualscreeningstatus/view/ViewIndividualStatus";

// ----------- Services: Cancer Screening ------------------
import ScreeningRequirementsNote from "./pages/beneficiary/individualscreeningstatus/Requirements";
import ScreeningProcedure from "./pages/beneficiary/individualscreeningstatus/ScreeningProcedure";
import BeneficiaryPreScreeningForm from "./pages/beneficiary/services/pages/cancerscreening/PreScreeningForm";
import PreScreeningFormNote from "./pages/beneficiary/services/pages/cancerscreening/PreScreeningFormNote";

// ----------- RHU SIDE ------------------
import RhuDashboard from "./pages/rhu/dashboard/Dashboard";
import RhuCancerAwarenss from "./pages/rhu/cancerawareness/CancerAwareness";
import RhuPreEnrollment from "./pages/rhu/rhu/PreEnrollment";
// ----------- RHU SERVICES ------------------
import RhuCancerManagement from "./pages/rhu/services/CancerManagement";
import RhuCancerScreening from "./pages/rhu/services/CancerScreening";
import RhuSurvivorship from "./pages/rhu/services/Survivorship";

// ----------- RHU rhu actions ------------------
import RhuPreEnrollmentView from "./pages/rhu/rhu/view/PreEnrollmentView";
import RhuPreEnrollmentEdit from "./pages/rhu/rhu/edit/PreEnrollmentEdit";
import RhuPreEnrollmentAdd from "./pages/rhu/rhu/add/PreEnrollmentAdd";

import { AuthProvider } from "./context/AuthContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedRHURoute from "./components/ProtectedRHURoute";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
                path="AdminPatientMasterList"
                element={<AdminPatientMasterList />}
              />
              <Route path="view">
                <Route
                  path="AdminPreenrollmentDetails/:beneficiary_id"
                  element={<AdminPreenrollmentDetails />}
                />
                <Route
                  path="AdminPatientMasterListView"
                  element={<AdminPatientMasterListView />}
                />
              </Route>
              <Route path="edit">
                <Route
                  path="AdminPatientMasterListEdit"
                  element={<AdminPatientMasterListEdit />}
                />
              </Route>
              <Route path="add">
                <Route
                  path="AdminPatientMasterListAdd"
                  element={<AdminPatientMasterListAdd />}
                />
              </Route>
            </Route>

            <Route path="UserManagement">
              <Route index element={<AdminUserManagement />} />
              <Route path="add-user" element={<AdminManagementAddUser />} />
              <Route path="view-user" element={<AdminManagementViewUser />} />
              <Route path="edit-user" element={<AdminManagementEditUser />} />
            </Route>
            <Route path="cancerscreening">
              <Route
                path="AdminIndividualScreening"
                element={<AdminIndividualScreening />}
              />
              <Route
                path="AdminScreeningRequest"
                element={<AdminScreeningRequest />}
              />
              <Route path="view">
                <Route
                  path="AdminIndividualScreeningView"
                  element={<AdminIndividualScreeningView />}
                />
                <Route path="ViewAttachments" element={<ViewAttachments />} />
                <Route
                  path="ViewPreScreeningForm"
                  element={<ViewPreScreeningForm />}
                />
                <Route
                  path="ViewScreeningProcedure"
                  element={<ViewScreeningProcedure />}
                />
                <Route path="ViewResults" element={<ViewResults />} />
              </Route>
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
            <Route
              path="cancerawareness"
              element={<BeneficiaryCancerAwareness />}
            />
            <Route path="services">
              <Route path="cancer-screening">
                <Route index element={<BeneficiaryCancerScreening />} />
                <Route
                  path="pre-screening-form-note"
                  element={<PreScreeningFormNote />}
                />
                <Route
                  path="pre-screening-form"
                  element={<BeneficiaryPreScreeningForm />}
                />
              </Route>
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
            <Route path="individualscreeningstatus">
              <Route index element={<BeneficiaryIndividualScreeningStatus />} />
              <Route
                path="individualstatus-view"
                element={<BeneficiaryIndividualScreeningStatusView />}
              />
              <Route
                path="screening-requirements-note"
                element={<ScreeningRequirementsNote />}
              />
              <Route
                path="screening-procedure"
                element={<ScreeningProcedure />}
              />
              <Route
                path="upload-attachments"
                element={<UploadAttachments />}
              />
            </Route>
          </Route>
          <Route
            path="/Rhu"
            element={
              <ProtectedRHURoute>
                <RhuLayout />
              </ProtectedRHURoute>
            }
          >
            <Route index element={<RhuDashboard />} />
            <Route path="cancerawareness" element={<RhuCancerAwarenss />} />
            <Route path="services">
              <Route path="cancer-screening" element={<RhuCancerScreening />} />
              <Route
                path="cancer-management"
                element={<RhuCancerManagement />}
              />
              <Route path="survivorship" element={<RhuSurvivorship />} />
            </Route>
            <Route path="rhu">
              <Route path="pre-enrollment" element={<RhuPreEnrollment />} />
              <Route path="view">
                <Route
                  path="RhuPreEnrollmentView/:preenrollment_id"
                  element={<RhuPreEnrollmentView />}
                />
              </Route>
              <Route path="edit">
                <Route
                  path="RhuPreEnrollmentEdit/:preenrollment_id"
                  element={<RhuPreEnrollmentEdit />}
                />
              </Route>
              <Route path="add">
                <Route
                  path="RhuPreEnrollmentAdd"
                  element={<RhuPreEnrollmentAdd />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
