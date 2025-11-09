import { Route } from "react-router-dom";
import RhuLayout from "../layouts/Rhu";
import ProtectedRHURoute from "../components/RoleGuard/ProtectedRHURoute";

// Main Modules
import Dashboard from "../pages/rhu/dashboard/Dashboard";
import CancerAwareness from "../pages/rhu/cancerawareness/CancerAwareness";
import PatientList from "../pages/rhu/Patient/PatientList";
import CancerScreening from "../pages/rhu/Services/CancerScreening/CancerScreening";
import MassScreeningApplication from "../pages/rhu/Application/Mass Screening/applicationStatus";
import ViewProfile from "../pages/rhu/Profile/ViewProfile";
import PychosocialSupport from "../pages/rhu/pychosocialSupport/pychosocialSupport";

// sub list
import MassScreening from "../pages/rhu/Patient/MassScreening";
import Precancerous from "../pages/rhu/TreatmentAssistance/PrecancerousMeds/Precancerous"

// Views 
import PrecancerousView from "../pages/rhu/TreatmentAssistance/PrecancerousMeds/View/DetailedView"
import ViewActivity from "../pages/rhu/cancerawareness/View/ViewActivity";

// Edit 
import EditActivity from "../pages/rhu/cancerawareness/Edit/Edit";

// Awareness Attendee 
import Attendee from "../pages/rhu/cancerawareness/ManageAttendees";

// Add 
import AddMeds from "../pages/rhu/TreatmentAssistance/PrecancerousMeds/Add/AddMeds";
import AddAwarenessActivity from "../pages/rhu/cancerawareness/Add/Add";

// Apply 
import ApplyMassScreening from "../pages/rhu/Services/CancerScreening/Apply/MassScreening/";

// Patient Features
import PatientView from "../pages/rhu/Patient/View/PatientView";
import PreScreeningFormView from "../pages/rhu/Patient/View/PreScreeningForm";
import HistoricalView from "../pages/rhu/Patient/View/HistoricalUpdates";

import PatientAdd from "../pages/rhu/Patient/Add/PatientAdd";
import PreScreeningForm from "../pages/rhu/Patient/Add/PreScreeningForm";

import PatientEdit from "../pages/rhu/Patient/Edit/PatientEdit";
import EditPreScreeningForm from "../pages/rhu/Patient/Edit/EditPreScreeningForm";

// application actions
import MassScreeningStatusView from "../pages/rhu/Application/Mass Screening/View/applicationView";
import ApplicationAttendanceView from "../pages/rhu/Application/Mass Screening/View/applicationAttendance";

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
    <Route path="cancer-awareness/view/:id" element={<ViewActivity />} />
    <Route path="cancer-awareness/:id/manage-attendees" element={<Attendee />} />
    <Route path="cancer-awareness/add" element={<AddAwarenessActivity />} />
    <Route path="cancer-awareness/edit/:id" element={<EditActivity />} />

    <Route path="treatment-assistance">
      <Route path="pre-cancerous" element={<Precancerous />} />
      <Route path="pre-cancerous/view/:id" element={<PrecancerousView />} />
      <Route path="pre-cancerous/add" element={<AddMeds />} />
    </Route>

    {/* Services */}
    <Route path="services">
      <Route path="cancer-screening" element={<CancerScreening />} />
      <Route path="cancer-screening/apply" element={<ApplyMassScreening />} />
    </Route>

    {/* Patient Management */}
    <Route path="patients">
      <Route index element={<PatientList />} />
      {/* <Route path="mass-screening" element={<MassScreening />} /> */}

      <Route path="view">
        <Route path=":patient_id" element={<PatientView />}></Route>
        <Route path="cancer-data" element={<PreScreeningFormView />}></Route>
        <Route path="historical-updates"
          element={<HistoricalView />}
        />
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
      <Route path="mass-screening" element={<MassScreeningApplication />} />
      <Route path="mass-screening/view">
        <Route index element={<MassScreeningStatusView />} />
        <Route
          path="attendance"
          element={<ApplicationAttendanceView />}
        />
      </Route>
    </Route>
    
    <Route path="PychosocialSupport" element={<PychosocialSupport />} />
  </Route>
);

export default RhuRoutes;
