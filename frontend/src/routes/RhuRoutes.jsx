import { Route } from "react-router-dom";
import RhuLayout from "../layouts/Rhu";
import ProtectedRHURoute from "../components/RoleGuard/ProtectedRHURoute";

// Main Modules
import Dashboard from "../pages/rhu/Dashboard/Dashboard";
import CancerAwareness from "../pages/rhu/cancerawareness/CancerAwareness";
import PatientList from "../pages/rhu/Patient/PatientList";
import CancerScreening from "../pages/rhu/Services/CancerScreening/CancerScreening";
import ApplicationStatus from "../pages/rhu/applicationStatus/applicationStatus";
import ViewProfile from "../pages/rhu/Profile/ViewProfile";
import PychosocialSupport from "../pages/rhu/pychosocialSupport/pychosocialSupport";

// sub list
import MassScreening from "../pages/rhu/Patient/MassScreening";
import Precancerous from "../pages/rhu/TreatmentAssistance/PrecancerousMeds/Precancerous"

// Views 
import PrecancerousView from "../pages/rhu/TreatmentAssistance/PrecancerousMeds/View/DetailedView"

// Patient Features
import PatientView from "../pages/rhu/Patient/View/PatientView";
import PreScreeningFormView from "../pages/rhu/Patient/View/PreScreeningForm";

import PatientAdd from "../pages/rhu/Patient/Add/PatientAdd";
import PreScreeningForm from "../pages/rhu/Patient/Add/PreScreeningForm";

import PatientEdit from "../pages/rhu/Patient/Edit/PatientEdit";
import EditPreScreeningForm from "../pages/rhu/Patient/Edit/EditPreScreeningForm";

// application actions
import ApplicationStatusView from "../pages/rhu/applicationStatus/view/applicationView";
import ApplicationAttendanceView from "../pages/rhu/applicationStatus/view/applicationAttendance";

const RhuRoutes = () => (
  <Route
    path="/rhu"
    element={
      <ProtectedRHURoute>
        <RhuLayout />
      </ProtectedRHURoute>
    }
  >
    {/* Dashboard */}
    <Route index element={<Dashboard />} />
    <Route path="profile" element={<ViewProfile />} />

    {/* Awareness */}
    <Route path="cancer-awareness" element={<CancerAwareness />} />

    <Route path="treatment-assistance">
      <Route path="pre-cancerous" element={<Precancerous />} />
      <Route path="pre-cancerous/view/:id" element={<PrecancerousView />} />
    </Route>

    {/* Services */}
    <Route path="services">
      <Route path="cancer-screening" element={<CancerScreening />} />
      {/* <Route path="cancer-management" element={<CancerManagement />} /> */}
      {/* <Route path="survivorship" element={<Survivorship />} /> */}
    </Route>

    {/* Patient Management */}
    <Route path="patients">
      <Route index element={<PatientList />} />
      <Route path="mass-screening" element={<MassScreening />} />
      <Route path="view">
        <Route path=":patient_id" element={<PatientView />}></Route>
        <Route path="cancer-data" element={<PreScreeningFormView />}></Route>
      </Route>

      <Route path="add">
        <Route index element={<PatientAdd />} />
        <Route path="cancer-data-form" element={<PreScreeningForm />} />
      </Route>

      <Route path="edit">
        <Route path=":patient_id" element={<PatientEdit />} />
        <Route
          path=":patient_id/cancer-data"
          element={<EditPreScreeningForm />}
        />
      </Route>
    </Route>

    <Route path="application">
      <Route index element={<ApplicationStatus />} />
      <Route path="view">
        <Route path="applicationview" element={<ApplicationStatusView />} />
        <Route
          path="applicationAttendance"
          element={<ApplicationAttendanceView />}
        />
      </Route>
    </Route>
    <Route path="PychosocialSupport" element={<PychosocialSupport />} />
  </Route>
);

export default RhuRoutes;
