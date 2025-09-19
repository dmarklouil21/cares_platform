import { Route } from "react-router-dom";
import BeneficiaryLayout from "../layouts/Beneficiary";
import ProtectedRoute from "../components/RoleGuard/ProtectedRoute";

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

// Cancer Management Apply 
import RequiredDocumentsUpload from "../pages/beneficiary/Services/CancerManagement/Apply/RequiredDocumentsUpload";
import WellBeingForm from "../pages/beneficiary/Services/CancerManagement/Apply/WellBeingForm";
import ServiceApplicationNote from "../pages/beneficiary/Services/CancerManagement/Apply/ServiceApplicationNote";

import PreCancerousMeds from "../pages/beneficiary/Services/CancerManagement/Apply/PreCancerous/PreCancerousMeds"; 

import ViewTreatmentRequestStatus from "../pages/beneficiary/Applications/CancerTreatment/View/ViewRequestStatus";
import CaseSummaryUpload from "../pages/beneficiary/Applications/CancerTreatment/View/UploadAttachments";

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
      <Route path="cancer-management">
        <Route index element={<CancerManagement />} />

        {/* Apply */}
        <Route path="apply">
          <Route path="note" element={<ServiceApplicationNote />} />
          <Route path="well-being-tool" element={<WellBeingForm />} />
          <Route path="upload-documents" element={<RequiredDocumentsUpload />} />

          {/* Pre-cancerous meds */}
          <Route path="precancerous-meds" element={<PreCancerousMeds />} />
        </Route>
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

      <Route path="cancer-treatment">
        <Route index element={<CancerTreatment />} />
        <Route path="view/:id" element={<ViewTreatmentRequestStatus />} />
        <Route path="view/:id/upload" element={<CaseSummaryUpload />} />
      </Route>

      <Route path="precancerous">
        <Route index element={<PreCancerous />} />
        <Route path="view/:id" element={<PreCancerousView />} />
      </Route>
    </Route>

  </Route>
);

export default BeneficiaryRoutes;