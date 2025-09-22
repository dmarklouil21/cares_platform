// CaseSummaryPrintTemplate.jsx
import React from "react";

const CaseSummaryPrintTemplate = ({ caseData, additionalNotes, interventionPlan }) => {
  const patient = caseData?.patient || {};

  return (
    <div
      id="case-summary-print-content"
      className="hidden print:flex fixed top-0 left-0 w-full h-full flex-col bg-white z-50 p-0 m-0"
      style={{ margin: 0, padding: 0 }}
    >
      {/* 🔹 Print-specific CSS */}
      <style>{`
        @media print {
          @page { margin: 0 !important; }
          body { margin: 0 !important; }
          #case-summary-print-content { margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      {/* 🔹 Header Logo */}
      <div className="fixed left-10 bg-primary px-5 py-4 rounded-b-4xl">
        <img src="/images/logo_white_text.png" alt="Rafi Logo" />
      </div>

      {/* 🔹 Header Text */}
      <div className="bg-yellow w-full flex justify-end items-end text-md pr-8 pb-1.5 h-[5%]">
        <h1 className="text-gray2 font-bold">Touching People, Shaping the Future</h1>
      </div>
      <div className="bg-lightblue w-full flex justify-end items-end pr-8 py-1">
        <p className="text-gray2 text-sm font-bold">
          Upholding the dignity of man by working with communities to elevate their well-being
        </p>
      </div>

      {/* 🔹 Main Content */}
      <div className="flex-1 flex flex-col px-20 pt-28">
        {/* Title */}
        <h1 className="font-bold text-center mb-6">
          CASE SUMMARY & INTERVENTION PLAN
        </h1>

        {/* Case Details */}
        <div className="flex justify-between text-sm mb-8">
          <div>
            <p><span className="font-bold">Case ID:</span> {caseData?.id || "CASE-12345"}</p>
            <p><span className="font-bold">Date Created:</span> {caseData?.date_submitted || "09/20/2025"}</p>
          </div>
          <div>
            <p><span className="font-bold">Patient:</span> {patient.full_name || "Juan Dela Cruz"}</p>
            <p><span className="font-bold">Age / Sex:</span> {patient.age || "45"} / {patient.sex || "Male"}</p>
            <p><span className="font-bold">Address:</span> {patient.address || "123 Sample Street, Cebu City"}</p>
            <p><span className="font-bold">LGU:</span> {patient.city || "Cebu City"}</p>
          </div>
        </div>

        {/* Medical Summary */}
        <Section title="Medical Summary">
          <p>
            <span className="font-semibold">Diagnosis & Stage:</span>{" "}
            {patient.diagnosis?.[0]?.diagnosis || "Breast Cancer - Stage II"}
          </p>
          <p>
            <span className="font-semibold">Medical Abstract Notes:</span>{" "}
            {additionalNotes?.medicalAbstractNotes || "Patient has completed initial diagnostics and is scheduled for treatment next month."}
          </p>
        </Section>

        {/* Socioeconomic */}
        <Section title="Socioeconomic Assessment">
          <p>
            <span className="font-semibold">Employment / Income:</span>{" "}
            {patient.occupation || "Housewife"} / {patient.monthly_income || "₱5,000"}
          </p>
          <p>
            <span className="font-semibold">Social Case Notes:</span>{" "}
            {additionalNotes?.socialCaseNotes || "Patient is the primary caregiver for two children, lives in a rented house."}
          </p>
        </Section>

        {/* Intervention Plan */}
        <Section title="Intervention Plan">
          <p><span className="font-semibold">Recommended Support:</span> {interventionPlan?.recommendedSupport}</p>
          <p><span className="font-semibold">Timeline & Milestones:</span> {interventionPlan?.timelineMilestone}</p>
          <p><span className="font-semibold">Scope & Coverage:</span> {interventionPlan?.scopeCoverage}</p>
          <p><span className="font-semibold">Follow-up / Monitoring:</span> {interventionPlan?.followUpMonitoring}</p>
          <p><span className="font-semibold">PO Remarks:</span> {interventionPlan?.poRemarks}</p>
        </Section>

        {/* Signatures */}
        <div className="grid grid-cols-3 mt-10 text-center">
          {/* Labels Row */}
          <div>
            <p className="font-medium">Patient:</p>
          </div>
          <div>
            <p className="font-medium">Prepared by:</p>
          </div>
          {/* className="mr-17" */}
          <div>
            <p className="font-medium">Approved by:</p>
          </div>

          <div className="mt-8">
            <p className="font-bold uppercase text-base">Mark Louil M. Diacamos</p>
            <p className="text-sm">Beneficiary</p>
          </div>
          <div className="mt-8">
            <p className="font-bold uppercase text-base">Maria L. Santos</p>
            <p className="text-sm">Social Worker</p>
            <p className="text-sm">RAFI</p>
          </div>
          <div className="mt-8">
            <p className="font-bold uppercase text-base">Dr. James C. Reyes</p>
            <p className="text-sm">Medical Director</p>
            <p className="text-sm">RAFI</p>
          </div>
        </div>

        {/* <div className="flex justify-between mt-8"> */}
          
        {/* </div> */}
      </div>

      {/* 🔹 Footer */}
      <div className="bg-yellow h-[1.3%] "></div>
      <div className="flex gap-2 justify-end items-center pr-8 py-2 bg-primary">
        <img src="/src/assets/images/patient/applicationstatus/printlocation.svg" className="h-3" alt="location icon" />
        <p className="text-white text-[9.5px]">35 Eduardo Aboitiz Street, Cebu City 6000 Philippines</p>
        <img src="/src/assets/images/patient/applicationstatus/printtelephone.svg" className="h-3" alt="telephone icon" />
        <p className="text-white text-[9.5px]">+63 (032) 265-5910, +63 998 967 1917, +63 998 966 0737</p>
        <img src="/src/assets/images/patient/applicationstatus/printemail.svg" className="h-3" alt="email icon" />
        <p className="text-white text-[9.5px]">communicate@rafi.ph</p>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#fff" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-7.5 9h15"/>
        </svg>
        <p className="text-white text-[9.5px]">www.rafi.org.ph</p>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="font-semibold uppercase mb-2">{title}</h2>
    <div className="space-y-2">{children}</div>
  </div>
);

export default CaseSummaryPrintTemplate;
