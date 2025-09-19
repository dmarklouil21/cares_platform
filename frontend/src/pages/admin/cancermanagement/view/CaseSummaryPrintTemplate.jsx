const CaseSummaryPrintTemplate = ({ caseData }) => (
  <div
    id="case-summary-print"
    className="hidden print:flex fixed top-0 left-0 w-full h-full flex-col bg-white z-50"
  >
    <style>{`
      @media print {
        @page { size: A4; margin: 20mm; }
        body { margin: 0 !important; }
        #case-summary-print { margin: 0; padding: 0; }
      }
    `}</style>

    {/* Header / Logo */}
    <div className="flex justify-between items-center border-b pb-2 mb-6">
      <h1 className="text-lg font-bold uppercase">
        Case Summary & Intervention Plan
      </h1>
      <img src="/images/logo_black_text.png" alt="Rafi Logo" className="h-12" />
    </div>

    {/* Case Info */}
    <div className="mb-4">
      <p><strong>Case ID:</strong> {caseData?.case_id || "N/A"}</p>
      <p><strong>Date Created:</strong> {caseData?.created_at || "N/A"}</p>
    </div>

    {/* Patient Info */}
    <h2 className="font-bold border-b mt-6 mb-2">Patient Details</h2>
    <p><strong>Full Name:</strong> {caseData?.patient_name}</p>
    <p><strong>Age / Sex:</strong> {caseData?.patient_age_sex}</p>
    <p><strong>Address:</strong> {caseData?.patient_address}</p>
    <p><strong>LGU:</strong> {caseData?.lgu}</p>

    {/* Medical Info */}
    <h2 className="font-bold border-b mt-6 mb-2">Medical Summary</h2>
    <p><strong>Diagnosis & Stage:</strong> {caseData?.diagnosis_stage}</p>
    <p><strong>Attachments:</strong> {caseData?.attachments?.join(", ")}</p>
    <p><strong>Medical Abstract Notes:</strong> {caseData?.medical_notes}</p>

    {/* Socioeconomic Info */}
    <h2 className="font-bold border-b mt-6 mb-2">Socioeconomic Assessment</h2>
    <p><strong>Employment / Income:</strong> {caseData?.employment_income}</p>
    <p><strong>Barangay Indigency:</strong> {caseData?.barangay_indigency}</p>
    <p><strong>Social Case Notes:</strong> {caseData?.social_notes}</p>

    {/* Intervention Plan */}
    <h2 className="font-bold border-b mt-6 mb-2">Intervention Plan</h2>
    <p><strong>Recommended Support:</strong> {caseData?.recommended_support}</p>
    <p><strong>Timeline & Milestones:</strong> {caseData?.timeline}</p>
    <p><strong>Scope & Coverage:</strong> {caseData?.coverage}</p>
    <p><strong>Follow-up / Monitoring:</strong> {caseData?.follow_up}</p>
    <p><strong>PO Remarks:</strong> {caseData?.po_remarks}</p>

    {/* LOA & Approval */}
    {/* <h2 className="font-bold border-b mt-6 mb-2">LOA & Approval</h2>
    <p><strong>LOA Generated:</strong> {caseData?.loa_reference}</p>
    <p><strong>Reviewed / Approved By:</strong> {caseData?.approver}</p>
    <p><strong>Notified Parties:</strong> {caseData?.notified_to?.join(", ")}</p> */}

    {/* Signatures */}
    <h2 className="font-bold border-b mt-6 mb-4">Signatures</h2>
    <div className="grid grid-cols-3 gap-8 mt-8">
      <div className="border border-dashed h-20 flex items-end justify-center">
        <span>Patient</span>
      </div>
      <div className="border border-dashed h-20 flex items-end justify-center">
        <span>Program Officer</span>
      </div>
      <div className="border border-dashed h-20 flex items-end justify-center">
        <span>Approver</span>
      </div>
    </div>
  </div>
);

export default CaseSummaryPrintTemplate;
