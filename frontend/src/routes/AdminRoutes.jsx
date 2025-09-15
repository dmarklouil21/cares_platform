import { Route } from "react-router-dom";
import AdminLayout from "../layouts/Admin";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";

// Main Modules
import Dashboard from "../pages/admin/Dashboard/Dashboard/";
import PatientMasterList from "../pages/admin/Patient/PatientMasterList/PatientMasterList";
import PreEnrollmentList from "../pages/admin/Patient/PreEnrollment/PreEnrollmentList";
import IndividualScreening from "../pages/admin/CancerScreening/IndividualScreening/IndividualScreening";
import Precancerous from "../pages/admin/TreatmentAssistance/PrecancerousMeds/Precancerous";
import CancerManagement from "../pages/admin/CancerManagement/CancerManagement";
import UserManagement from "../pages/admin/UserManagement/UserManagement";

// Patient Features
import PatientView from "../pages/admin/Patient/PatientMasterList/View/PatientView";
import PatientPreScreeningForm from "../pages/admin/Patient/PatientMasterList/View/PreScreeningForm";

import AddPatient from "../pages/admin/Patient/PatientMasterList/Add/AddPatient";
import AddPreScreeningForm from "../pages/admin/Patient/PatientMasterList/Add/PreScreeningForm";

import EditPatient from "../pages/admin/Patient/PatientMasterList/Edit/EditPatient";
import EditPreScreeningForm from "../pages/admin/Patient/PatientMasterList/Edit/EditPreScreeningForm";

import PreEnrollPatientView from "../pages/admin/Patient/PreEnrollment/View/PatientView";
import PreEnrollPreScreeningForm from "../pages/admin/Patient/PreEnrollment/View/PreScreeningForm";

// Treatment Assistance Features 
import PreCancerousDetailedView from "../pages/admin/TreatmentAssistance/PrecancerousMeds/View/DetailedView";

// Cancer Screening Features 
import IndividualScreeningDetailedView from "../pages/admin/CancerScreening/IndividualScreening/View/DetailedView";
import IndividualScreeningAttachments from "../pages/admin/CancerScreening/IndividualScreening/View/Attachments";
import IndividualScreeningPreScreeningForm from "../pages/admin/CancerScreening/IndividualScreening/View/PreScreeningForm";
import IndividualScreeningResults from "../pages/admin/CancerScreening/IndividualScreening/View/Results";
// import IndividualScreeningLOAPrintTemplate from "../pages/admin/CancerScreening/IndividualScreening/View/DetailedView";

// Cancer Management 
import CancerManagementDetailedView from "../pages/admin/CancerManagement/View/DetailedView/";
import CancerManagementAttachments from "../pages/admin/CancerManagement/View/Attachments";
import CancerManagementPreScreeningForm from "../pages/admin/CancerManagement/View/PreScreeningForm";
import CancerManagementResults from "../pages/admin/CancerManagement/View/Results";
import CancerManagementWellBeingForm from "../pages/admin/CancerManagement/View/WellBeingTool";
import CaseSummary from "../pages/admin/CancerManagement/View/CaseSummary";

// User Management Features 
import ViewUser from "../pages/admin/UserManagement/View/ViewUser";
import AddUser from "../pages/admin/UserManagement/Add/AddUser";
import EditUser from "../pages/admin/UserManagement/Edit/EditUser";

const AdminRoutes = () => (
  <Route
    path="/admin"
    element={
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    }
  >
    {/* Dashboard */}
    <Route index element={<Dashboard />} />

    {/* Patients */}
    <Route path="patient">
      <Route path="pre-enrollment" element={<PreEnrollmentList />} />
      <Route path="master-list" element={<PatientMasterList />} />

      {/* Views */}
      <Route path="view">
        <Route path="pre-enrollment/:patient_id" element={<PreEnrollPatientView />} />
        <Route path="pre-enrollment/cancer-data" element={<PreEnrollPreScreeningForm />} />
        <Route path=":patient_id" element={<PatientView />} />
        <Route path=":patient_id/cancer-data" element={<PatientPreScreeningForm />} />
      </Route>

      {/* Edit */}
      <Route path="edit">
        <Route path=":patient_id" element={<EditPatient />} />
        <Route path=":patient_id/cancer-data" element={<EditPreScreeningForm />} />
      </Route>

      {/* Add */}
      <Route path="add">
        <Route path="general-data" element={<AddPatient />} />
        <Route path="cancer-data" element={<AddPreScreeningForm />} />
      </Route>
    </Route>

    {/* Cancer Screening */}
    <Route path="cancer-screening">
      <Route index element={<IndividualScreening />} />
      <Route path="view">
        <Route path="details" element={<IndividualScreeningDetailedView />} />
        <Route path="attachments" element={<IndividualScreeningAttachments />} />
        <Route path="pre-screening-form" element={<IndividualScreeningPreScreeningForm />} />
        {/* <Route path="loa-print" element={<IndividualScreeningLOAPrintTemplate />} /> */}
        <Route path="results" element={<IndividualScreeningResults />} />
      </Route>
    </Route>

    {/* Treatment Assistance */}
    <Route path="treatment-assistance">
      <Route path="pre-cancerous" element={<Precancerous />} />
      <Route path="view/:id" element={<PreCancerousDetailedView />} />
    </Route>

    {/* Cancer Management */}
    <Route path="cancer-management"> 
      <Route index element={<CancerManagement />} />
      <Route path="view"> 
        <Route path=":id" element={<CancerManagementDetailedView />} />
        <Route path=":id/attachments" element={<CancerManagementAttachments />} />
        <Route path=":id/pre-screening-form" element={<CancerManagementPreScreeningForm />} />
        <Route path=":id/results" element={<CancerManagementResults />} />
        <Route path=":id/well-being-form" element={<CancerManagementWellBeingForm />} />
        <Route path=":id/case-summary" element={<CaseSummary />} />
      </Route>
    </Route>

    {/* User Management */}
    <Route path="user-management">
      <Route index element={<UserManagement />} />
      <Route path="add" element={<AddUser />} />
      <Route path="view" element={<ViewUser />} />
      <Route path="edit" element={<EditUser />} />
    </Route>

  </Route>
);

export default AdminRoutes;