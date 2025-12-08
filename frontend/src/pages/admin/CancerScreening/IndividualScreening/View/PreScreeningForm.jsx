import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  User, 
  Calendar, 
  Activity, 
  Stethoscope, 
  AlertCircle 
} from "lucide-react";

import SystemLoader from "src/components/SystemLoader";

// Helper for consistent data display
const InfoGroup = ({ label, value, fullWidth = false }) => (
  <div className={`${fullWidth ? "col-span-full" : ""}`}>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
      {label}
    </label>
    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-900 break-words min-h-[40px] flex items-center">
      {value || <span className="text-gray-400 italic">N/A</span>}
    </div>
  </div>
);

// Helper for list data
const BadgeList = ({ label, items, emptyText = "None selected" }) => (
  <div className="col-span-full">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
      {label}
    </label>
    <div className="flex flex-wrap gap-2">
      {items && items.length > 0 ? (
        items.map((item, idx) => (
          <span 
            key={idx} 
            className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold"
          >
            {item.name || item}
          </span>
        ))
      ) : (
        <span className="text-sm text-gray-400 italic">{emptyText}</span>
      )}
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4 mt-2">
    <Icon className="w-5 h-5 text-yellow-600" />
    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide">
      {title}
    </h3>
  </div>
);

const PatientPreScreeningForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const record = location.state;
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (record) {
      const pData = record.patient || record.formData; 
      const fData = pData?.pre_screening_form || {};
      
      setPatient(pData);
      setForm(fData);
    }
  }, [record]);

  if (!patient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray">
         <SystemLoader />
      </div>
    );
  }

  // Formatting Dates
  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-7xl mx-auto w-full">
        
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Pre Screening Form
        </h2>

        {/* White Card Container */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow/10 rounded-full text-yellow">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                   Pre-Screening Data
                </h1>
                <p className="text-sm text-gray-500">
                   Patient: <span className="font-semibold text-gray-700">{patient.full_name}</span> (ID: {patient.patient_id})
                </p>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-10">
            
            {/* Left Column: Referral & Diagnosis */}
            <div className="space-y-8">
              
              {/* Referral Section */}
              <div>
                <SectionHeader icon={User} title="Referral Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoGroup label="Referred From" value={form?.referred_from} />
                  <InfoGroup label="Date of Consultation" value={formatDate(form?.date_of_consultation)} />
                  <InfoGroup label="Referring Doctor/Facility" value={form?.referring_doctor_or_facility} fullWidth />
                  <InfoGroup label="Reason for Referral" value={form?.reason_for_referral} fullWidth />
                </div>
              </div>

              {/* Diagnosis Details */}
              <div>
                <SectionHeader icon={Activity} title="Diagnosis Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InfoGroup label="Date of Diagnosis" value={formatDate(form?.date_of_diagnosis)} />
                   <InfoGroup label="Chief Complaint" value={form?.chief_complaint} fullWidth />
                   <InfoGroup label="Final Diagnosis" value={form?.final_diagnosis} fullWidth />
                   <InfoGroup label="ICD-10 Code" value={form?.final_diagnosis_icd10} />
                </div>
              </div>

              {/* Basis of Diagnosis */}
              <div>
                <SectionHeader icon={Stethoscope} title="Basis of Diagnosis" />
                <div className="space-y-4">
                   <BadgeList label="Most Valid Basis" items={form?.diagnosis_basis} />
                </div>
              </div>

            </div>

            {/* Right Column: Pathology & Treatment */}
            <div className="space-y-8">
              
              {/* Pathology */}
              <div>
                <SectionHeader icon={AlertCircle} title="Pathology & Staging" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <BadgeList label="Primary Sites" items={form?.primary_sites} />
                   {form?.primary_sites_other && <InfoGroup label="Other Primary Sites" value={form.primary_sites_other} fullWidth />}
                   
                   <InfoGroup label="Laterality" value={form?.laterality} />
                   <InfoGroup label="Multiple Primaries" value={form?.multiple_primaries} />
                   
                   <InfoGroup label="Histology (Morphology)" value={form?.histology} fullWidth />
                   
                   {/* Staging and TNM System - Side by Side */}
                   <InfoGroup label="Staging" value={form?.staging} />
                   <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">TNM System</label>
                       <div className="grid grid-cols-3 gap-2">
                          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-center">
                             <span className="text-gray-400 mr-1">T:</span>{form?.t_system || "-"}
                          </div>
                          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-center">
                             <span className="text-gray-400 mr-1">N:</span>{form?.n_system || "-"}
                          </div>
                          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-center">
                             <span className="text-gray-400 mr-1">M:</span>{form?.m_system || "-"}
                          </div>
                       </div>
                   </div>
                </div>

                <div className="mt-4">
                   <BadgeList label="Distant Metastasis Sites" items={form?.distant_metastasis_sites} />
                   {form?.distant_metastasis_sites_other && (
                      <div className="mt-2">
                        <InfoGroup label="Other Metastasis" value={form.distant_metastasis_sites_other} fullWidth />
                      </div>
                   )}
                </div>
              </div>

              {/* Treatment */}
              <div>
                <SectionHeader icon={Calendar} title="Treatment Plan" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <InfoGroup label="Treatment Purpose" value={form?.treatment_purpose} />
                   {form?.treatment_purpose_other && <InfoGroup label="Other Purpose" value={form.treatment_purpose_other} />}
                   
                   <InfoGroup label="Primary Assistance (RAFI-EJACC)" value={form?.primary_assistance_by_ejacc} />
                   <InfoGroup label="Date of Assistance" value={formatDate(form?.date_of_assistance)} />
                </div>

                <div className="space-y-4">
                   <BadgeList label="Adjuvant Treatments (RAFI-EJACC)" items={form?.adjuvant_treatments_received} />
                   {form?.adjuvant_treatments_other && <InfoGroup label="Other Adjuvant" value={form.adjuvant_treatments_other} fullWidth />}

                   <BadgeList label="Treatments from Other Sources" items={form?.other_source_treatments} />
                   {form?.other_source_treatments_other && <InfoGroup label="Other Sources" value={form.other_source_treatments_other} fullWidth />}
                </div>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            {/* <Link
              to={`/rhu/patients/view/historical-updates`}
              state={{ patient: patient }}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
            >
              Next: Hi
              <ArrowRight className="w-4 h-4" />
            </Link> */}
          </div>

        </div>
      </div>

      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default PatientPreScreeningForm;