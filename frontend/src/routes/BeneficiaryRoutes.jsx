import { Route } from "react-router-dom";
import BeneficiaryLayout from "../layouts/Beneficiary";
import ProtectedRoute from "../components/ProtectedRoute";

// Pre Enrollment 
import PreEnrollment  from "../pages/beneficiary/PreEnrollment/PreEnrollment";
import PreScreeningForm from "../pages/beneficiary/PreEnrollment/PreScreeningForm";

// Sidebar Options 
import Home from "../pages/beneficiary/Home/Home/";
import CancerAwareness from "../pages/beneficiary/CancerAwareness/CancerAwareness/";

// Services 
import CancerScreening from "../pages/beneficiary/Services/CancerScreening/CancerScreening";
import CancerManagement from "../pages/beneficiary/Services/CancerManagement/CancerManagement";
import Survivorship from "../pages/beneficiary/Services/Survivorship/Survivorship";

// Applications 
import IndividualScreening from "../pages/beneficiary/Applications/IndividualScreening/IndividualScreening";
import CancerTreatment from "../pages/beneficiary/Applications/CancerTreatment/CancerTreatment";
import PreCancerous from "../pages/beneficiary/Applications/PreCancerous/PreCancerous/"; 

// Cancer Screening Apply
import Requirements from "../pages/beneficiary/Services/CancerScreening/Apply/Requirements"; 
import ScreeningProcedure from "../pages/beneficiary/Services/CancerScreening/Apply/ScreeningProcedure"; 

// Cancer Management Apply (per option)
import BrachyServiceApplicationNote from "../pages/beneficiary/Services/CancerManagement/Apply/Brachytherapy/ServiceApplicationNote"; 
import BrachytherapyWellBeingTool from "../pages/beneficiary/Services/CancerManagement/Apply/Brachytherapy/BrachytherapyWellBeingTool";
import BrachytherapyDocuments from "../pages/beneficiary/Services/CancerManagement/Apply/Brachytherapy/BrachytherapyDocuments";

import ChemoServiceApplicationNote from "../pages/beneficiary/Services/CancerManagement/Apply/ChemoTherapy/ServiceApplicationNote"; 
import ChemotherapyWellBeingTool from "../pages/beneficiary/Services/CancerManagement/Apply/ChemoTherapy/ChemotherapyWellBeingTool";
import ChemotherapyDocuments from "../pages/beneficiary/Services/CancerManagement/Apply/ChemoTherapy/ChemotherapyDocuments";

import RadioActServiceApplicationNote from "../pages/beneficiary/Services/CancerManagement/Apply/Radioactive/ServiceApplicationNote"; 
import RadioactiveWellBeingTool from "../pages/beneficiary/Services/CancerManagement/Apply/Radioactive/RadioactiveWellBeingTool";
import RadioactiveDocuments from "../pages/beneficiary/Services/CancerManagement/Apply/Radioactive/RadioactiveDocuments";

import RadioServiceApplicationNote from "../pages/beneficiary/Services/CancerManagement/Apply/Radiotherapy/ServiceApplicationNote"; 
import RadioTherapyWellBeingTool from "../pages/beneficiary/Services/CancerManagement/Apply/Radiotherapy/RadioTherapyWellBeingTool";
import RadioTherapyDocuments from "../pages/beneficiary/Services/CancerManagement/Apply/Radiotherapy/RadioTherapyDocuments";

import SurgeryServiceApplicationNote from "../pages/beneficiary/Services/CancerManagement/Apply/Surgery/ServiceApplicationNote"; 
import SurgeryWellBeingTool from "../pages/beneficiary/Services/CancerManagement/Apply/Surgery/SurgeryWellBeingTool";
import SurgeryDocuments from "../pages/beneficiary/Services/CancerManagement/Apply/Surgery/SurgeryDocuments";

import PreCancerousMeds from "../pages/beneficiary/Services/CancerManagement/Apply/PreCancerous/PreCancerousMeds"; 

// Applications Features 
import ViewScreeningStatus from "../pages/beneficiary/Applications/IndividualScreening/View/ViewScreeningStatus"; 
import UploadAttachments from "../pages/beneficiary/Applications/IndividualScreening/View/UploadAttachments"; 

import PreCancerousView from "../pages/beneficiary/Applications/PreCancerous/View/PreCancerousView"; 

// Success Page
import SuccessPage from "../pages/beneficiary/SuccessPage"; 

const BeneficiaryRoutes = () => (
  <Route
    path="/beneficiary"
    element={
      <ProtectedRoute>
        <BeneficiaryLayout />
      </ProtectedRoute>
    }
  >
    {/* Success Page */}
    <Route path="success-application" element={<SuccessPage />} />

    <Route path="pre-enrollment">
      <Route index element={<PreEnrollment />} />
      <Route path="pre-screening-form" element={<PreScreeningForm />} />
    </Route>

    {/* Home & Awareness */}
    <Route index element={<Home />} />
    <Route path="cancer-awareness" element={<CancerAwareness />} />

    {/* Services */}
    <Route path="services">
      {/* Cancer Screening */}
      <Route path="cancer-screening">
        <Route index element={<CancerScreening />} />
        <Route path="requirements" element={<Requirements />} />
        <Route path="procedure" element={<ScreeningProcedure />} />
      </Route>

      {/* Cancer Management */}
      <Route path="cancer-management" element={<CancerManagement />} />
      <Route path="cancer-management-options">
        {/* Radiotherapy */}
        <Route path="radiotherapy">
          <Route path="form-note" element={<RadioServiceApplicationNote />} />
          <Route path="well-being-tool" element={<RadioTherapyWellBeingTool />} />
          <Route path="documents" element={<RadioTherapyDocuments />} />
        </Route>

        {/* Radioactive */}
        <Route path="radioactive">
          <Route path="form-note" element={<RadioActServiceApplicationNote />} />
          <Route path="well-being-tool" element={<RadioactiveWellBeingTool />} />
          <Route path="documents" element={<RadioactiveDocuments />} />
        </Route>

        {/* Brachytherapy */}
        <Route path="brachytherapy">
          <Route path="form-note" element={<BrachyServiceApplicationNote />} />
          <Route path="well-being-tool" element={<BrachytherapyWellBeingTool />} />
          <Route path="documents" element={<BrachytherapyDocuments />} />
        </Route>

        {/* Chemotherapy */}
        <Route path="chemotherapy">
          <Route path="form-note" element={<ChemoServiceApplicationNote />} />
          <Route path="well-being-tool" element={<ChemotherapyWellBeingTool />} />
          <Route path="documents" element={<ChemotherapyDocuments />} />
        </Route>

        {/* Surgery */}
        <Route path="surgery">
          <Route path="form-note" element={<SurgeryServiceApplicationNote />} />
          <Route path="well-being-tool" element={<SurgeryWellBeingTool />} />
          <Route path="documents" element={<SurgeryDocuments />} />
        </Route>

        {/* Pre-cancerous meds */}
        <Route path="precancerous-meds" element={<PreCancerousMeds />} />
      </Route>

      {/* Survivorship */}
      <Route path="survivorship" element={<Survivorship />} />
    </Route>

    {/* Applications */}
    <Route path="applications">
      <Route path="individual-screening"> 
        <Route index element={<IndividualScreening />} />
        <Route path="view" element={<ViewScreeningStatus />} />
        <Route path="upload-attachments" element={<UploadAttachments />} />
      </Route>

      <Route path="cancer-treatment" element={<CancerTreatment />} />

      <Route path="precancerous">
        <Route index element={<PreCancerous />} />
        <Route path="view/:id" element={<PreCancerousView />} />
      </Route>
    </Route>

  </Route>
);

export default BeneficiaryRoutes;