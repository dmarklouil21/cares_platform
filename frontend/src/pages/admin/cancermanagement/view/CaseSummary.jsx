import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const CaseSummaryPlan = ({ caseData }) => {
  const location = useLocation();
  const record = location.state;
  const { id } = useParams();
  
  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA] overflow-auto">
      {/* Header */}
      <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Case Summary & Intervention Plan</h1>
        <div className="p-3">
          <Link to={`/admin/cancer-management/view/${id}`}>
            <img src="/images/back.png" alt="Back" className="h-6 cursor-pointer" />
          </Link>
        </div>
      </div>

      {/* Card Container */}
      <div className="h-full w-full p-5 flex flex-col gap-5">
        <div className="border border-black/15 p-5 bg-white rounded-sm shadow-sm">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold uppercase tracking-wide">
                Case Summary
              </h1>
              <p className="text-sm text-gray-600">
                Case ID:{" "}
                <span className="font-semibold">
                  {caseData?.case_id || "N/A"}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Date Created:{" "}
                <span className="font-semibold">
                  {caseData?.created_at || "N/A"}
                </span>
              </p>
            </div>

            {/* Logo */}
            <img
              src="/images/logo_black_text.png"
              alt="rafi logo"
              className="h-30 md:h-30 object-contain"
            />
          </div>

          {/* Patient Info */}
          <Section title="Patient Details">
            <TwoColumn>
              <Field label="Full Name" value={caseData?.patient_name} />
              <Field label="Age / Sex" value={caseData?.patient_age_sex} />
            </TwoColumn>
            <TwoColumn>
              <Field label="Address" value={caseData?.patient_address} />
              <Field label="LGU" value={caseData?.lgu} />
            </TwoColumn>
          </Section>

          {/* Medical Info */}
          <Section title="Medical Summary">
            <TwoColumn>
              <Field
                label="Diagnosis & Stage"
                value={caseData?.diagnosis_stage}
              />
              <Field
                label="Attachments"
                value={caseData?.attachments?.join(", ")}
              />
            </TwoColumn>
            <TwoColumn>
              <Field
                label="Medical Abstract Notes"
                value={caseData?.medical_notes}
                multiline
              />
            </TwoColumn>
          </Section>

          {/* Socioeconomic Info */}
          <Section title="Socioeconomic Assessment">
            <TwoColumn>
              <Field
                label="Employment / Income"
                value={caseData?.employment_income}
              />
              <Field
                label="Barangay Indigency"
                value={caseData?.barangay_indigency}
              />
            </TwoColumn>
            <Field
              label="Social Case Notes"
              value={caseData?.social_notes}
              multiline
            />
          </Section>

          {/* Intervention Plan */}
          <Section title="Intervention Plan">
            <TwoColumn>
              <Field
                label="Recommended Support"
                value={caseData?.recommended_support}
              />
              <Field label="Timeline & Milestones" value={caseData?.timeline} />
            </TwoColumn>
            <TwoColumn>
              <Field label="Scope & Coverage" value={caseData?.coverage} multiline />
              <Field
                label="Follow-up / Monitoring"
                value={caseData?.follow_up}
                multiline
              />
            </TwoColumn>
            <Field label="PO Remarks" value={caseData?.po_remarks} multiline />
          </Section>

          {/* LOA & Approval */}
          <Section title="LOA & Approval">
            <TwoColumn>
              <Field label="LOA Generated" value={caseData?.loa_reference} />
              <Field label="Reviewed / Approved By" value={caseData?.approver} />
            </TwoColumn>
            <Field
              label="Notified Parties"
              value={caseData?.notified_to?.join(", ")}
            />
          </Section>

          {/* Signatures */}
          <Section title="Signatures">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SignatureBox label="Patient" />
              <SignatureBox label="Program Officer" />
              <SignatureBox label="Approver" />
            </div>
          </Section>
        </div>
        <div className="w-full flex justify-around">
          <Link 
            to={`/admin/cancer-management/view/${id}`}
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
          >
            Back
          </Link>
          <button
            // type="submit"
            type="button"
            // onClick={handleSave}
            className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            Save As PDF
          </button>
        </div>
        <br />
      </div>
    </div>
  );
};

// Subcomponents for cleaner layout
const Section = ({ title, children }) => (
  <div className="mb-8">
    <div className="mb-4 border-b border-gray-200">
      <h2 className="text-md font-bold tracking-wide uppercase pb-1">
        {title}
      </h2>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

const TwoColumn = ({ children }) => (
  <div className="flex flex-col md:flex-row gap-6">{children}</div>
);

const Field = ({ label, value, multiline }) => (
  <div className="w-full">
    <label className="text-sm font-medium block mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value || ""}
        disabled
        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 resize-none"
      />
    ) : (
      <input
        type="text"
        value={value || ""}
        disabled
        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
      />
    )}
  </div>
);

const SignatureBox = ({ label }) => (
  <div className="border border-dashed border-gray-300 rounded-md p-4 h-[80px] flex flex-col justify-center">
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export default CaseSummaryPlan;
