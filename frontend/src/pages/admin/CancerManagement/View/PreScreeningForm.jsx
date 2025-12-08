import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Activity, 
  Stethoscope, 
  AlertCircle, 
  Calendar 
} from "lucide-react";

import SystemLoader from "src/components/SystemLoader";

// --- Reusable UI Helpers for Read-Only Display ---

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4 mt-6 first:mt-0">
    <Icon className="w-5 h-5 text-yellow-600" />
    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
  </div>
);

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
            className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold shadow-sm"
          >
            {/* Handle if item is string or object {name: 'val'} */}
            {typeof item === 'object' ? item.name : item}
          </span>
        ))
      ) : (
        <span className="text-sm text-gray-400 italic">{emptyText}</span>
      )}
    </div>
  </div>
);

const ViewPreScreeningForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const record = location.state;
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (record) {
      const pData = record.patient || record.formData || record; 
      const fData = pData.pre_screening_form || {};
      
      setPatient(pData);
      setForm(fData);
    }
  }, [record]);

  if (!record || !patient) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray gap-4">
             <SystemLoader />
             <p className="text-gray-500">Loading Record...</p>
             <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
        </div>
    );
  }

  // Date Formatter
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-7xl mx-auto w-full">
        
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Pre Screening Form
        </h2>

        {/* Main Card */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow/10 rounded-full text-yellow">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                            Pre-Screening Form
                        </h1>
                        <p className="text-sm text-gray-500">
                            Patient: <span className="font-semibold text-gray-700">{patient?.full_name || "Unknown"}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-10">
                
                {/* Left Column */}
                <div className="space-y-8">
                    
                    {/* Referral Info */}
                    <div>
                        <SectionHeader icon={User} title="Referral Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoGroup label="Referred From" value={form?.referred_from} />
                            <InfoGroup label="Date of Consultation" value={formatDate(form?.date_of_consultation)} />
                            <InfoGroup label="Referring Doctor/Facility" value={form?.referring_doctor_or_facility} fullWidth />
                            <InfoGroup label="Reason for Referral" value={form?.reason_for_referral} fullWidth />
                        </div>
                    </div>

                    {/* Diagnosis Info */}
                    <div>
                        <SectionHeader icon={Activity} title="Diagnosis Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoGroup label="Date of Diagnosis" value={formatDate(form?.date_of_diagnosis)} />
                            <InfoGroup label="Chief Complaint" value={form?.chief_complaint} fullWidth />
                            
                            <BadgeList label="Basis of Diagnosis" items={form?.diagnosis_basis} />
                            
                            <InfoGroup label="Final Diagnosis" value={form?.final_diagnosis} fullWidth />
                            <InfoGroup label="ICD-10 Code" value={form?.final_diagnosis_icd10} />
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    
                    {/* Pathology */}
                    <div>
                        <SectionHeader icon={AlertCircle} title="Pathology & Staging" />
                        
                        <BadgeList label="Primary Sites" items={form?.primary_sites} />
                        {form?.primary_sites_other && <InfoGroup label="Other Primary Sites" value={form.primary_sites_other} fullWidth />}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InfoGroup label="Laterality" value={form?.laterality} />
                            <InfoGroup label="Multiple Primaries" value={form?.multiple_primaries} />
                            
                            <InfoGroup label="Histology" value={form?.histology} fullWidth />
                            
                            {/* Staging & TNM Side-by-Side */}
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
                            <BadgeList label="Distant Metastasis" items={form?.distant_metastasis_sites} />
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
                             <InfoGroup label="RAFI Assistance" value={form?.primary_assistance_by_ejacc} />
                             <InfoGroup label="Date of Assistance" value={formatDate(form?.date_of_assistance)} />
                        </div>

                        <div className="mt-4 space-y-4">
                            <BadgeList label="Adjuvant Treatments (RAFI)" items={form?.adjuvant_treatments_received} />
                            {form?.adjuvant_treatments_other && <InfoGroup label="Other Adjuvant" value={form.adjuvant_treatments_other} fullWidth />}

                            <BadgeList label="Other Source Treatments" items={form?.other_source_treatments} />
                            {form?.other_source_treatments_other && <InfoGroup label="Other Sources" value={form.other_source_treatments_other} fullWidth />}
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex items-center justify-start border-t border-gray-100 pt-6">
                <Link
                    to={`/admin/cancer-management/view/${id}`} 
                    state={{ record: record }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
            </div>

        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default ViewPreScreeningForm;