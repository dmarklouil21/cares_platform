import { Route } from "react-router-dom";
import AdminLayout from "../layouts/Admin";
import ProtectedAdminRoute from "../components/RoleGuard/ProtectedAdminRoute";

// Main Modules
import Dashboard from "../pages/admin/Dashboard/Dashboard/";
import PatientMasterList from "../pages/admin/Patient/PatientMasterList/PatientMasterList";
import PreEnrollmentList from "../pages/admin/Patient/PreEnrollment/PreEnrollmentList";
import IndividualScreening from "../pages/admin/CancerScreening/IndividualScreening/IndividualScreening";
import Precancerous from "../pages/admin/TreatmentAssistance/PrecancerousMeds/Precancerous";
import PostTreatment from "../pages/admin/TreatmentAssistance/PostTreatment/PostTreatment";
import CancerManagement from "../pages/admin/CancerManagement/CancerManagement";
import UserManagement from "../pages/admin/UserManagement/UserManagement";
import MassScreening from "../pages/admin/CancerScreening/MassScreening/MassScreening";
import HomeVisit from "../pages/admin/survivorship/HomeVisit/HomeVisit";
import HormonalReplacement from "../pages/admin/survivorship/HormonalReplacement/HormonalReplacement";
import EditProfile from "../pages/admin/profile/ViewProfile";
import PychosocialSupport from "../pages/admin/psychosocialSupport/PsychosocialSupport";

//pyschosocialSupport add
import PsychosocialSupportAdd from "../pages/admin/psychosocialSupport/add/add";

//views
import PostTreatmentView from "../pages/admin/TreatmentAssistance/PostTreatment/View/TreatmentView";
import HomeVisitView from "../pages/admin/survivorship/HomeVisit/View/HomeView";
import HomeVisitWellBeingTool from "../pages/admin/survivorship/HomeVisit/View/WellBeingTool"; 
import HormonalView from "../pages/admin/survivorship/HormonalReplacement/View/HormonalView";
import HormonalViewPrescription from "../pages/admin/survivorship/HormonalReplacement/View/DoctorsPresc";

// Survivorship
import HomeVisitAdd from "../pages/admin/survivorship/HomeVisit/Add/Add";
import HomeVisitAddWellbeingForm from "../pages/admin/survivorship/HomeVisit/Add/WellBeingForm";
import AddHormonal from "../pages/admin/survivorship/HormonalReplacement/Add/AddHormonal";

// Patient Features
import PatientView from "../pages/admin/Patient/PatientMasterList/View/PatientView";
import PatientPreScreeningForm from "../pages/admin/Patient/PatientMasterList/View/PreScreeningForm";
import HistoricalUpdates from "../pages/admin/Patient/PatientMasterList/View/HistoricalUpdates";

import AddPatient from "../pages/admin/Patient/PatientMasterList/Add/AddPatient";
import AddPreScreeningForm from "../pages/admin/Patient/PatientMasterList/Add/PreScreeningForm";

import EditPatient from "../pages/admin/Patient/PatientMasterList/Edit/EditPatient";
import EditPreScreeningForm from "../pages/admin/Patient/PatientMasterList/Edit/EditPreScreeningForm";

import PreEnrollPatientView from "../pages/admin/Patient/PreEnrollment/View/PatientView";
import PreEnrollPreScreeningForm from "../pages/admin/Patient/PreEnrollment/View/PreScreeningForm";

// Treatment Assistance Features
import PreCancerousDetailedView from "../pages/admin/TreatmentAssistance/PrecancerousMeds/View/DetailedView";
import PreCancerousMedsAdd from "../pages/admin/TreatmentAssistance/PrecancerousMeds/Add/AddMeds";

import PostTreatmentAdd from "../pages/admin/TreatmentAssistance/PostTreatment/Add/Addtreatment";
import LabRequest from "../pages/admin/TreatmentAssistance/PostTreatment/View/LabRequest";
import LabResult from "../pages/admin/TreatmentAssistance/PostTreatment/View/LabResult";

// Cancer Screening Features
import IndividualScreeningDetailedView from "../pages/admin/CancerScreening/IndividualScreening/View/DetailedView";
import IndividualScreeningAttachments from "../pages/admin/CancerScreening/IndividualScreening/View/Attachments";
import IndividualScreeningPreScreeningForm from "../pages/admin/CancerScreening/IndividualScreening/View/PreScreeningForm";
import IndividualScreeningResults from "../pages/admin/CancerScreening/IndividualScreening/View/Results";
// import IndividualScreeningLOAPrintTemplate from "../pages/admin/CancerScreening/IndividualScreening/View/DetailedView";

//cancer screening add
import IndividualScreeningAdd from "../pages/admin/CancerScreening/IndividualScreening/Add/AddIndividual";
import MassScreeningAdd from "../pages/admin/CancerScreening/MassScreening/Add/AddMass";

import MassScreeningView from "../pages/admin/CancerScreening/MassScreening/view/MassScreeningView";
import MassAttendanceView from "../pages/admin/CancerScreening/MassScreening/view/MassAttendanceView";

// Cancer Management
import CancerManagementDetailedView from "../pages/admin/CancerManagement/view/DetailedView";
import CancerManagementAttachments from "../pages/admin/CancerManagement/View/Attachments";
import CancerManagementPreScreeningForm from "../pages/admin/CancerManagement/View/PreScreeningForm";
import CancerManagementResults from "../pages/admin/CancerManagement/View/Results";
import CancerManagementWellBeingForm from "../pages/admin/CancerManagement/View/WellBeingTool";
import CaseSummary from "../pages/admin/CancerManagement/View/CaseSummary";
import CancerManagementAdd from "../pages/admin/cancermanagement/Add/AddCancer/";
import CancerManagementAddWellbeingForm from "../pages/admin/cancermanagement/Add/WellBeingForm/";

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
    <Route path="profile" element={<EditProfile />} />

    {/* Patients */}
    <Route path="patient">
      <Route path="pre-enrollment" element={<PreEnrollmentList />} />
      <Route path="master-list" element={<PatientMasterList />} />

      {/* Views */}
      <Route path="view">
        <Route
          path="pre-enrollment/:patient_id"
          element={<PreEnrollPatientView />}
        />
        <Route
          path="pre-enrollment/cancer-data"
          element={<PreEnrollPreScreeningForm />}
        />
        <Route path=":patient_id" element={<PatientView />} />
        <Route
          path=":patient_id/cancer-data"
          element={<PatientPreScreeningForm />}
        />
        <Route
          path=":patient_id/historical-updates"
          element={<HistoricalUpdates />}
        />
      </Route>

      {/* Edit */}
      <Route path="edit">
        <Route path=":patient_id" element={<EditPatient />} />
        <Route
          path=":patient_id/cancer-data"
          element={<EditPreScreeningForm />}
        />
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
      <Route path="mass-screening" element={<MassScreening />} />
      <Route path="view">
        <Route path="mass-view" element={<MassScreeningView />} />
        <Route path="mass-attendance-view" element={<MassAttendanceView />} />
        <Route path="details" element={<IndividualScreeningDetailedView />} />
        <Route
          path="attachments"
          element={<IndividualScreeningAttachments />}
        />
        <Route
          path="pre-screening-form"
          element={<IndividualScreeningPreScreeningForm />}
        />
        {/* <Route path="loa-print" element={<IndividualScreeningLOAPrintTemplate />} /> */}
        <Route path="results" element={<IndividualScreeningResults />} />
      </Route>
      <Route path="add">
        <Route path="individual" element={<IndividualScreeningAdd />} />
        <Route path="mass" element={<MassScreeningAdd />} />
      </Route>
    </Route>

    {/* Treatment Assistance */}
    <Route path="treatment-assistance">
      <Route path="pre-cancerous" element={<Precancerous />} />
      <Route path="post-treatment" element={<PostTreatment />} />
      <Route path="view/:id" element={<PreCancerousDetailedView />} />
      <Route path="postview/:id" element={<PostTreatmentView />} />
      <Route path="postview/:id/lab-request" element={<LabRequest />} />
      <Route path="postview/:id/lab-result" element={<LabResult />} />
      <Route path="add-pre-cancerous" element={<PreCancerousMedsAdd />} />
      <Route path="add-post-treatment" element={<PostTreatmentAdd />} />
    </Route>

    {/* Cancer Management */}
    <Route path="cancer-management">
      <Route index element={<CancerManagement />} />
      <Route path="view">
        <Route path=":id" element={<CancerManagementDetailedView />} />
        <Route
          path=":id/attachments"
          element={<CancerManagementAttachments />}
        />
        <Route
          path=":id/pre-screening-form"
          element={<CancerManagementPreScreeningForm />}
        />
        <Route path=":id/results" element={<CancerManagementResults />} />
        <Route
          path=":id/well-being-form"
          element={<CancerManagementWellBeingForm />}
        />
        <Route path=":id/case-summary" element={<CaseSummary />} />
      </Route>
      <Route path="add">
        <Route index element={<CancerManagementAdd />} />
        <Route path="well-being-form" element={<CancerManagementAddWellbeingForm />} />
      </Route>
    </Route>

    {/* User Management */}
    <Route path="user-management">
      <Route index element={<UserManagement />} />
      <Route path="add" element={<AddUser />} />
      <Route path="view" element={<ViewUser />} />
      <Route path="edit" element={<EditUser />} />
    </Route>

    {/* Survivorship */}
    <Route path="survivorship">
      <Route index element={<HomeVisit />} />

      <Route path="hormonal-replacement" >
        <Route index element={<HormonalReplacement />} />
        <Route path="view/:id" element={<HormonalView />} />
        <Route path="view/:id/doctors-prescription" element={<HormonalViewPrescription />} />

        <Route path="add" element={<AddHormonal />} />
      </Route>

      <Route path="view">
        <Route path=":id" element={<HomeVisitView />} />
        <Route path=":id/wellbeing-form" element={<HomeVisitWellBeingTool />} />
      </Route>

      <Route path="add">
        <Route index element={<HomeVisitAdd />} />
        <Route path="well-being-form" element={<HomeVisitAddWellbeingForm />} />
      </Route>
    </Route>

    <Route path="PychosocialSupport">
      <Route index element={<PychosocialSupport />} />
      <Route path="add" element={<PsychosocialSupportAdd />} />
    </Route>
  </Route>
);

export default AdminRoutes;
