import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import CaseSummaryPrintTemplate from "./CaseSummaryPrintTemplate";

const CaseSummaryPlan = () => {
  const location = useLocation();
  const record = location.state;
  const { id } = useParams();
  const [ additionalNotes, setAdditionalNotes ] = useState({
    medicalAbstractNotes: "",
    socialCaseNotes: ""
  })
  const [ interventionPlan, setInterventionPlan ] = useState({
    recommendedSupport: "",
    scopeCoverage: "",
    timelineMilestone: "",
    followUpMonitoring: "",
    poRemarks: "",
  })

  const handleAdditionalNotesChange = (e) => {
    const { name, value } = e.target;
    setAdditionalNotes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterventionPlanChange = (e) => {
    const { name, value } = e.target;
    setInterventionPlan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
              <h1 className="text-xl font-bold uppercase tracking-wide">Case Summary</h1>
              <p className="text-sm text-gray-600">
                Case ID:{" "}
                <span className="font-semibold">{record?.id || "N/A"}</span>
              </p>
              <p className="text-sm text-gray-600">
                Date Created:{" "}
                <span className="font-semibold">
                  {record?.date_submitted || "N/A"}
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
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={record?.patient.full_name || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Age / Sex</label>
                <input
                  type="text"
                  defaultValue={`${record?.patient.age || ""} / ${record?.patient.sex || ""}`}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Address</label>
                <input
                  type="text"
                  defaultValue={record?.patient.address || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">LGU</label>
                <input
                  type="text"
                  defaultValue={record?.patient.city || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
            </div>
          </Section>

          {/* Medical Info */}
          <Section title="Medical Summary">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Diagnosis & Stage</label>
                <input
                  type="text"
                  defaultValue={record?.patient.diagnosis[0]?.diagnosis || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
              {/* <div className="w-full">
                <label className="text-sm font-medium block mb-1">Attachments</label>
                <input
                  type="text"
                  defaultValue={record?.attachments?.join(", ") || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div> */}
            </div>
            <div className="w-full">
              <label className="text-sm font-medium block mb-1">Medical Abstract Notes</label>
              <textarea 
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white resize-none"
                name="medicalAbstractNotes"
                value={additionalNotes.medicalAbstractNotes} 
                onChange={handleAdditionalNotesChange}
              />
            </div>
          </Section>

          {/* Socioeconomic Info */}
          <Section title="Socioeconomic Assessment">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Employment / Income</label>
                <input
                  type="text"
                  defaultValue={`${record?.patient.occupation || ""} / ${record?.patient.monthly_income || ""}`}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
              {/* <div className="w-full">
                <label className="text-sm font-medium block mb-1">Barangay Indigency</label>
                <input
                  type="text"
                  defaultValue="Attach to Email"
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div> */}
            </div>
            <div className="w-full">
              <label className="text-sm font-medium block mb-1">Social Case Notes</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white resize-none"
                name="socialCaseNotes"
                value={additionalNotes.socialCaseNotes}
                onChange={handleAdditionalNotesChange}
              />
            </div>
          </Section>

          {/* Intervention Plan */}
          <Section title="Intervention Plan">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Recommended Support</label>
                <input
                  type="text"
                  name="recommendedSupport"
                  value={interventionPlan.recommendedSupport}
                  onChange={handleInterventionPlanChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Timeline & Milestones</label>
                <input
                  type="text"
                  name="timelineMilestone"
                  value={interventionPlan.timelineMilestone}
                  onChange={handleInterventionPlanChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Scope & Coverage</label>
                <textarea 
                  name="scopeCoverage"
                  value={interventionPlan.scopeCoverage}
                  onChange={handleInterventionPlanChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white resize-none"
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">Follow-up / Monitoring</label>
                <textarea 
                  name="followUpMonitoring"
                  value={interventionPlan.followUpMonitoring}
                  onChange={handleInterventionPlanChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white resize-none"
                />
              </div>
            </div>
            <div className="w-full">
              <label className="text-sm font-medium block mb-1">PO Remarks</label>
              <textarea
                name="poRemarks"
                value={interventionPlan.poRemarks}
                onChange={handleInterventionPlanChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white resize-none"
              />
            </div>
          </Section>

          {/* Signatures */}
          {/* <Section title="Signatures">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SignatureBox label="Patient" />
              <SignatureBox label="Program Officer" />
              <SignatureBox label="Approver" />
            </div>
          </Section> */}
        </div>

        {/* Footer buttons */}
        <div className="w-full flex justify-around">
          <Link
            to={`/admin/cancer-management/view/${id}`}
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            // onClick={handlePrint}
            className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            Save As PDF
          </button>
        </div>
        <br />
      </div>
      <CaseSummaryPrintTemplate caseData={record} additionalNotes={additionalNotes} interventionPlan={interventionPlan} />
    </div>
  );
};

// Keep Section + SignatureBox for layout only
const Section = ({ title, children }) => (
  <div className="mb-8">
    <div className="mb-4 border-b border-gray-200">
      <h2 className="text-md font-bold tracking-wide uppercase pb-1">{title}</h2>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

const SignatureBox = ({ label }) => (
  <div className="border border-dashed border-gray-300 rounded-md p-4 h-[80px] flex flex-col justify-center">
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export default CaseSummaryPlan;
