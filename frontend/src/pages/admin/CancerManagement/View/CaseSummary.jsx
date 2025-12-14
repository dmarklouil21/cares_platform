import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { 
  Printer, 
  ArrowLeft, 
  FileText, 
  User, 
  Stethoscope, 
  Briefcase, 
  ClipboardCheck 
} from "lucide-react";

import CaseSummaryPrintTemplate from "./CaseSummaryPrintTemplate";

// --- Reusable UI Components ---

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4 mt-8 first:mt-0">
    <Icon className="w-5 h-5 text-yellow-600" />
    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
  </div>
);

const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label}
    </label>
    <div className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700">
      {value || "N/A"}
    </div>
  </div>
);

const InputGroup = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
    />
  </div>
);

const TextAreaGroup = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none bg-white"
    />
  </div>
);

const CaseSummaryPlan = () => {
  const location = useLocation();
  const { id } = useParams();
  const record = location.state;

  const [additionalNotes, setAdditionalNotes] = useState({
    medicalAbstractNotes: "",
    socialCaseNotes: "",
  });

  const [interventionPlan, setInterventionPlan] = useState({
    recommendedSupport: "",
    scopeCoverage: "",
    timelineMilestone: "",
    followUpMonitoring: "",
    poRemarks: "",
  });

  const handleAdditionalNotesChange = (e) => {
    const { name, value } = e.target;
    setAdditionalNotes((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterventionPlanChange = (e) => {
    const { name, value } = e.target;
    setInterventionPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    if (!record || !record.patient) {
      console.error("No record data to generate filename.");
      window.print();
      return;
    }

    const originalTitle = document.title;
    const newTitle = `Case_Summary_${record.patient.patient_id}_${record.patient.full_name}`;
    document.title = newTitle;
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Safe accessors
  const p = record?.patient || {};

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-5xl mx-auto w-full">
        
        {/* Top Actions */}
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-semibold text-gray-800">
              Case Summary & Intervention Plan
           </h2>
        </div>

        {/* Main Card */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-8 px-6 md:px-10 shadow-sm border border-gray-100 flex-1">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow/10 rounded-full text-yellow">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Case Summary</h1>
                <div className="flex gap-4 mt-1 text-sm text-gray-500 font-mono">
                    <span>ID: {record?.id || "N/A"}</span>
                    <span>•</span>
                    <span>Created: {record?.date_submitted || "N/A"}</span>
                </div>
              </div>
            </div>
            <img
              src="/images/logo_black_text.png"
              alt="rafi logo"
              className="h-23 object-contain opacity-80 mt-4 md:mt-0"
            />
          </div>

          {/* 1. Patient Details */}
          <section>
            <SectionHeader icon={User} title="Patient Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField label="Full Name" value={p.full_name} />
              <ReadOnlyField label="Age / Sex" value={`${p.age || '-'} / ${p.sex || '-'}`} />
              <ReadOnlyField label="Address" value={p.address} />
              <ReadOnlyField label="LGU" value={p.city} />
            </div>
          </section>

          {/* 2. Medical Summary */}
          <section>
            <SectionHeader icon={Stethoscope} title="Medical Summary" />
            <div className="grid grid-cols-1 gap-4">
               <ReadOnlyField label="Diagnosis & Stage" value={p.diagnosis?.[0]?.diagnosis} />
               <TextAreaGroup 
                  label="Medical Abstract Notes" 
                  name="medicalAbstractNotes"
                  value={additionalNotes.medicalAbstractNotes}
                  onChange={handleAdditionalNotesChange}
                  placeholder="Enter medical notes..."
               />
            </div>
          </section>

          {/* 3. Socioeconomic */}
          <section>
            <SectionHeader icon={Briefcase} title="Socioeconomic Assessment" />
            <div className="grid grid-cols-1 gap-4">
               <ReadOnlyField label="Employment / Income" value={`${p.occupation || '-'} / ${p.monthly_income || '-'}`} />
               <TextAreaGroup 
                  label="Social Case Notes" 
                  name="socialCaseNotes"
                  value={additionalNotes.socialCaseNotes}
                  onChange={handleAdditionalNotesChange}
                  placeholder="Enter social case notes..."
               />
            </div>
          </section>

          {/* 4. Intervention Plan */}
          <section>
            <SectionHeader icon={ClipboardCheck} title="Intervention Plan" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <InputGroup 
                  label="Recommended Support" 
                  name="recommendedSupport" 
                  value={interventionPlan.recommendedSupport} 
                  onChange={handleInterventionPlanChange} 
               />
               <InputGroup 
                  label="Timeline & Milestones" 
                  name="timelineMilestone" 
                  value={interventionPlan.timelineMilestone} 
                  onChange={handleInterventionPlanChange} 
               />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <TextAreaGroup 
                  label="Scope & Coverage" 
                  name="scopeCoverage" 
                  value={interventionPlan.scopeCoverage} 
                  onChange={handleInterventionPlanChange} 
               />
               <TextAreaGroup 
                  label="Follow-up / Monitoring" 
                  name="followUpMonitoring" 
                  value={interventionPlan.followUpMonitoring} 
                  onChange={handleInterventionPlanChange} 
               />
            </div>
            <TextAreaGroup 
                label="PO Remarks" 
                name="poRemarks" 
                value={interventionPlan.poRemarks} 
                onChange={handleInterventionPlanChange} 
            />
          </section>
          {/* Footer Actions */}
          <div className="flex justify-around print:hidden mt-6">
            <Link
              to={`/admin/cancer-management/view/${id}`}
              className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
            >
              {/* <ArrowLeft className="w-4 h-4" /> */}
              Back
            </Link>
            
            <button
              type="button"
              onClick={handlePrint}
              className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-"
            >
              {/* <Printer className="w-4 h-4" /> */}
              Save as PDF
            </button>
          </div>
        </div>

      </div>

        <CaseSummaryPrintTemplate
          caseData={record}
          additionalNotes={additionalNotes}
          interventionPlan={interventionPlan}
        />

      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default CaseSummaryPlan;