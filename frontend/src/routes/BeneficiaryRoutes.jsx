import { Route } from "react-router-dom";
import BeneficiaryLayout from "../layouts/Beneficiary";
import ProtectedRoute from "../components/RoleGuard/ProtectedRoute";

// Sidebar Options
import Home from "../pages/beneficiary/Home/Home/";
import CancerAwareness from "../pages/beneficiary/CancerAwareness/CancerAwareness/";
import HomeVisit from "../pages/beneficiary/HomeVisit/HomeVisit";
import Profile from "../pages/beneficiary/profile/Profile";

// HomeVisit View
import HomeVisitView from "../pages/beneficiary/HomeVisit/View/HomeVisitView";

// Services
import CancerScreening from "../pages/beneficiary/Services/CancerScreening/CancerScreening";
import CancerManagement from "../pages/beneficiary/Services/CancerManagement/CancerManagement";
import Survivorship from "../pages/beneficiary/Services/Survivorship/Survivorship";

// Applications
import IndividualScreening from "../pages/beneficiary/Applications/IndividualScreening/IndividualScreening";
import CancerTreatment from "../pages/beneficiary/Applications/CancerTreatment/CancerTreatment";
import PreCancerous from "../pages/beneficiary/Applications/PreCancerous/PreCancerous/";
import PostTreatmentApplication from "../pages/beneficiary/Applications/PostTreatment/PostTreatment";

// Cancer Screening Apply
import Requirements from "../pages/beneficiary/Services/CancerScreening/Apply/Requirements";
import ScreeningProcedure from "../pages/beneficiary/Services/CancerScreening/Apply/ScreeningProcedure";

// Cancer Management Apply
import RequiredDocumentsUpload from "../pages/beneficiary/Services/CancerManagement/Apply/RequiredDocumentsUpload";
import WellBeingForm from "../pages/beneficiary/Services/CancerManagement/Apply/WellBeingForm";
import ServiceApplicationNote from "../pages/beneficiary/Services/CancerManagement/Apply/ServiceApplicationNote";
import PostTreatment from "../pages/beneficiary/Services/CancerManagement/Apply/PostTreatment/PostTreatment";

import PreCancerousMeds from "../pages/beneficiary/Services/CancerManagement/Apply/PreCancerous/PreCancerousMeds";

import ViewTreatmentRequestStatus from "../pages/beneficiary/Applications/CancerTreatment/View/ViewRequestStatus";
import CaseSummaryUpload from "../pages/beneficiary/Applications/CancerTreatment/View/UploadAttachments";

// Applications Features
import ViewScreeningStatus from "../pages/beneficiary/Applications/IndividualScreening/View/ViewScreeningStatus";
import UploadAttachments from "../pages/beneficiary/Applications/IndividualScreening/View/UploadAttachments";

import PreCancerousView from "../pages/beneficiary/Applications/PreCancerous/View/PreCancerousView";
import ViewPostTreatmentStatus from "../pages/beneficiary/Applications/PostTreatment/View/ViewPostTreatmentStatus";

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
    <Route path="profile" element={<Profile />} />

    {/* Home & Awareness */}
    <Route index element={<Home />} />
    <Route path="cancer-awareness" element={<CancerAwareness />} />

    {/* Homevisit */}
    <Route path="home-visit" element={<HomeVisit />} />
    <Route path="home-visit/view/:id" element={<HomeVisitView />} />

    <Route path="home-visit">
      <Route index element={<HomeVisit />} />
      <Route path="view/:id" element={<HomeVisitView />} />
    </Route>

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
          <Route
            path="upload-documents"
            element={<RequiredDocumentsUpload />}
          />

          {/* Pre-cancerous meds */}
          <Route path="precancerous-meds" element={<PreCancerousMeds />} />
          <Route path="post-treatment" element={<PostTreatment />} />
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

      <Route path="post-treatment">
        <Route index element={<PostTreatmentApplication />} />
        <Route path="view/:id" element={<ViewPostTreatmentStatus />} />
      </Route>
    </Route>
  </Route>
);

export default BeneficiaryRoutes;
