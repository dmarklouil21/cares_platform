import { Route } from "react-router-dom";
import PrivateLayout from "../layouts/Private";
import ProtectedPrivateRoute from "../components/RoleGuard/ProtectedPrivateRoute";

// Main Modules
import Dashboard from "../pages/private/Dashboard/Dashboard";
import CancerAwareness from "../pages/private/cancerawareness/CancerAwareness";
import PatientList from "../pages/private/Patient/PatientList";
import CancerScreening from "../pages/private/Services/CancerScreening/CancerScreening";
import ApplicationStatus from "../pages/private/applicationStatus/applicationStatus";
import ViewProfile from "../pages/private/Profile/ViewProfile";
import PychosocialSupport from "../pages/private/pychosocialSupport/pychosocialSupport";

// sub list
import MassScreening from "../pages/private/Patient/MassScreening";
import Precancerous from "../pages/private/TreatmentAssistance/PrecancerousMeds/Precancerous"

// Views 
import PrecancerousView from "../pages/private/TreatmentAssistance/PrecancerousMeds/View/DetailedView"

// Patient Features
import PatientView from "../pages/private/Patient/View/PatientView";
import PreScreeningFormView from "../pages/private/Patient/View/PreScreeningForm";

import PatientAdd from "../pages/private/Patient/Add/PatientAdd";
import PreScreeningForm from "../pages/private/Patient/Add/PreScreeningForm";

import PatientEdit from "../pages/private/Patient/Edit/PatientEdit";
import EditPreScreeningForm from "../pages/private/Patient/Edit/EditPreScreeningForm";

// application actions
import ApplicationStatusView from "../pages/private/applicationStatus/view/applicationView";
import ApplicationAttendanceView from "../pages/private/applicationStatus/view/applicationAttendance";

const PrivateRoutes = () => (
  <Route
    path="/private"
    element={
      <ProtectedPrivateRoute>
        <PrivateLayout />
      </ProtectedPrivateRoute>
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

export default PrivateRoutes;
