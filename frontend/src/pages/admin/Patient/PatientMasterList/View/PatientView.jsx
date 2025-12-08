import React, { useState, useEffect } from "react";
import { useLocation, Link, useParams, useNavigate } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Activity, 
  Briefcase, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Info
} from "lucide-react";

import api from "src/api/axiosInstance";
import SystemLoader from "src/components/SystemLoader";

// Helper component for consistent data display
const InfoGroup = ({ label, value, icon: Icon, fullWidth = false }) => (
  <div className={`${fullWidth ? "col-span-full" : ""}`}>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />} {label}
    </label>
    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-900 break-words">
      {value || <span className="text-gray-400 italic">N/A</span>}
    </div>
  </div>
);

const PatientView = () => {
  const navigate = useNavigate();
  const { patient_id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const SAMPLE_2X2 = "https://placehold.co/600x600/png?text=No+Photo";

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/patient/details/${patient_id}/`);
        if (isMounted) {
          setPatient(response.data);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [patient_id]);

  if (loading) return <SystemLoader />;

  if (!patient) return (
    <div className="h-screen flex items-center justify-center bg-gray">
      <div className="text-center">
        <p className="text-gray-500 font-medium">Patient record not found.</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline mt-2">Go Back</button>
      </div>
    </div>
  );

  // Formatting helpers
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const fullName = patient.full_name || `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name} ${patient.suffix || ''}`;

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-7xl mx-auto w-full">
        
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Patient Management
        </h2>

        {/* White Card Container */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-yellow-100 overflow-hidden shrink-0 shadow-sm">
                <img
                  src={patient.photo_url || SAMPLE_2X2}
                  alt="Patient"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-2xl md:text-2xl text-yellow leading-tight">
                  {fullName}
                </h1>
                <p className="text-sm text-gray-500 font-mono mt-1">
                   ID: <span className="text-gray-700 font-semibold">{patient.patient_id}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <img
                src="/images/logo_black_text.png"
                alt="rafi logo"
                className="h-23 object-contain opacity-80"
              />
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Personal Snapshot */}
            <div className="xl:col-span-1 space-y-6">
               <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Personal Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoGroup label="Sex" value={patient.sex} />
                        <InfoGroup label="Age" value={patient.age} />
                    </div>
                    <InfoGroup label="Birthdate" value={formatDate(patient.date_of_birth)} />
                    <InfoGroup label="Civil Status" value={patient.civil_status} />
                    <InfoGroup label="Children" value={patient.number_of_children} />
                  </div>
               </div>

               <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-4 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" /> Medical Snapshot
                  </h3>
                  <div className="space-y-4">
                    <InfoGroup label="Diagnosis" value={patient.diagnosis?.[0]?.diagnosis} fullWidth />
                    <div className="grid grid-cols-2 gap-4">
                        <InfoGroup label="Stage" value={patient.diagnosis?.[0]?.cancer_stage} />
                        <InfoGroup label="Site" value={patient.diagnosis?.[0]?.cancer_site} />
                    </div>
                    <InfoGroup label="Date Diagnosed" value={formatDate(patient.diagnosis?.[0]?.date_diagnosed)} fullWidth />
                  </div>
               </div>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="xl:col-span-2 space-y-8">
                
                {/* Contact & Address */}
                <section>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" /> Contact & Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoGroup label="Permanent Address" value={patient.address} fullWidth />
                        <InfoGroup label="Barangay" value={patient.barangay} />
                        <InfoGroup label="City / Municipality" value={patient.city} />
                        <InfoGroup label="Mobile Number" value={patient.mobile_number} icon={Phone} />
                        <InfoGroup label="Email Address" value={patient.email} icon={Mail} />
                    </div>
                </section>

                {/* Socioeconomic */}
                <section>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" /> Socioeconomic Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoGroup label="Education" value={patient.highest_educational_attainment} />
                        <InfoGroup label="Occupation" value={patient.occupation} />
                        <InfoGroup label="Source of Income" value={patient.source_of_income} />
                        <InfoGroup label="Monthly Income" value={patient.monthly_income} />
                    </div>
                </section>

                {/* Emergency Contacts */}
                <section>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" /> Emergency Contacts
                    </h3>
                    
                    {patient.emergency_contacts && patient.emergency_contacts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {patient.emergency_contacts.map((contact, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative">
                                    <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 uppercase">Contact {index + 1}</span>
                                    <div className="space-y-3 mt-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{contact.name}</p>
                                                <p className="text-xs text-gray-500 uppercase">{contact.relationship_to_patient}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <p className="flex items-center gap-2"><Phone className="w-3 h-3"/> {contact.mobile_number || "N/A"}</p>
                                            <p className="flex items-center gap-2"><Mail className="w-3 h-3"/> {contact.email || "N/A"}</p>
                                            <p className="flex items-center gap-2"><MapPin className="w-3 h-3"/> {contact.address || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No emergency contacts recorded.</p>
                    )}
                </section>

                {/* Additional Info */}
                <section>
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-400" /> Additional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoGroup label="Source of Information" value={patient.source_of_information} />
                        <InfoGroup label="Other RAFI Programs Availed" value={patient.other_rafi_programs_availed} />
                    </div>
                </section>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              onClick={() => navigate(`/admin/patient/master-list`)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <Link
              to={`/admin/patient/view/${patient.patient_id}/cancer-data`}
              state={{ patient: patient }}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>

      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
};

export default PatientView;