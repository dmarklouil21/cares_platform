import { Route } from "react-router-dom";
import RhuLayout from "../layouts/Rhu";
import ProtectedRHURoute from "../components/ProtectedRHURoute";

// Main Modules 
import Dashboard from "../pages/rhu/Dashboard/Dashboard";
import CancerAwareness from "../pages/rhu/CancerAwareness/CancerAwareness";
import PatientList from "../pages/rhu/Patient/PatientList";
import CancerScreening from "../pages/rhu/Services/CancerScreening/CancerScreening";

// Patient Features 
import PatientView from "../pages/rhu/Patient/View/PatientView";
import PreScreeningFormView from "../pages/rhu/Patient/View/PreScreeningForm";

import PatientAdd from "../pages/rhu/Patient/Add/PatientAdd";
import PreScreeningForm from "../pages/rhu/Patient/Add/PreScreeningForm";

import PatientEdit from "../pages/rhu/Patient/Edit/PatientEdit";
import EditPreScreeningForm from "../pages/rhu/Patient/Edit/EditPreScreeningForm";

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

    {/* Awareness */}
    <Route path="cancer-awareness" element={<CancerAwareness />} />

    {/* Services */}
    <Route path="services">
      <Route path="cancer-screening" element={<CancerScreening />} />
      {/* <Route path="cancer-management" element={<CancerManagement />} /> */}
      {/* <Route path="survivorship" element={<Survivorship />} /> */}
    </Route>

    {/* Patient Management */}
    <Route path="patients">
      <Route index element={<PatientList />} />
      <Route path="view">
        <Route path=":patient_id" element={<PatientView />}></Route>
        <Route path="cancer-data" element={<PreScreeningFormView />}></Route>
      </Route>

      <Route path="add">
        <Route index element={<PatientAdd />} />
        <Route path="cancer-data-form" element={<PreScreeningForm />} />
      </Route>

      <Route path="edit" >
        <Route path=":patient_id" element={<PatientEdit />} />
        <Route path=":patient_id/cancer-data" element={<EditPreScreeningForm />} />
      </Route>
    </Route>
  </Route>
);

export default RhuRoutes;