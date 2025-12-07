// src/pages/mass-screening/MassScreeningAttendance.jsx
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Search, UserPlus, UserMinus, FileSignature } from "lucide-react";

import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import api from "src/api/axiosInstance";
import {
  getMassScreeningAttendance,
  saveMassScreeningAttendance,
} from "src/api/massScreening";

const MassScreeningAttendance = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const record = state?.record || state || null;

  const [patients, setPatients] = useState([]); // Current Attendees
  const [patientList, setPatientList] = useState([]); // Available Database
  const [searchTerm, setSearchTerm] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // --- Logic: Load Data ---
  useEffect(() => {
    if (!record?.id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Existing Attendance
        const attendanceData = await getMassScreeningAttendance(record.id);
        if (Array.isArray(attendanceData)) {
          setPatients(attendanceData.map((e) => ({ name: e.name, result: e.result || "" })));
        }

        // 2. Fetch Available Patients (Smart Logic from original code)
        const prof = await api.get("/rhu/profile/");
        const lgu = prof?.data?.lgu || "";
        const toCity = (s) => String(s || "").replace(/^RHU\s+/i, "").split(",")[0].trim();
        const norm = (s) => toCity(s).toLowerCase();
        const cityExact = toCity(lgu);

        let list = [];
        try {
           // Try generic RHU list first
           const res = await api.get("/rhu/patients/");
           list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
        } catch(err) { console.warn(err); }

        if (!Array.isArray(list) || list.length === 0) {
           // Fallback to searching by registered_by or city
           try {
             const resCity = await api.get(`/patient/list/`, { params: { registered_by: lgu } });
             list = Array.isArray(resCity?.data) ? resCity.data : (resCity?.data?.results || []);
             
             if (!list.length) {
               // Fallback: fetch all and filter client-side (last resort)
               const resAll = await api.get(`/patient/list/`);
               const all = Array.isArray(resAll?.data) ? resAll.data : (resAll?.data?.results || []);
               list = all.filter((p) => norm(p.city).includes(norm(cityExact)));
             }
           } catch(err) { console.warn(err); }
        }
        setPatientList(list || []);

      } catch (error) {
        console.error("Error loading data:", error);
        setNotification("Failed to load patient data.");
        setNotificationType("error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [record?.id]);

  // --- Filtering Logic ---
  const addedNames = useMemo(() => new Set(patients.map((p) => (p.name || "").toLowerCase())), [patients]);
  
  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return patientList
      .filter((p) => {
        const full = (p.full_name || `${p.first_name || ""} ${p.last_name || ""}`).trim();
        if (!full) return false;
        // Exclude if already in attendees list
        if (addedNames.has(full.toLowerCase())) return false;
        // Search Filter
        if (!term) return true;
        return full.toLowerCase().includes(term) || String(p.patient_id || "").includes(term);
      })
      .slice(0, 100); // Limit rendering for performance
  }, [patientList, searchTerm, addedNames]);

  // --- Handlers ---
  const addAttendee = (patient) => {
    const full = (patient.full_name || `${patient.first_name || ""} ${patient.last_name || ""}`).trim();
    if (!full || addedNames.has(full.toLowerCase())) return;
    
    setPatients(prev => [...prev, { name: full, result: "" }]);
  };

  const removeAttendee = (idx) => {
    setPatients(prev => prev.filter((_, i) => i !== idx));
  };

  const updateResult = (idx, value) => {
    setPatients(prev => prev.map((p, i) => (i === idx ? { ...p, result: value } : p)));
  };

  const handleSave = async () => {
    setModalOpen(false);
    try {
      setSaving(true);
      const entries = patients
        .map((p) => ({ name: String(p.name || "").trim(), result: String(p.result || "").trim() }))
        .filter((p) => p.name);
      
      await saveMassScreeningAttendance(record.id, entries);
      
      setNotification("Attendance and results saved successfully!");
      setNotificationType("success");
      setTimeout(() => navigate(-1), 1500); // Go back after success
    } catch (error) {
      setNotification("Failed to save attendance.");
      setNotificationType("error");
    } finally {
      setSaving(false);
    }
  };

  if (!record) return <div className="p-10 text-center">Record ID missing.</div>;
  if (loading) return <SystemLoader />;

  return (
    <>
      {saving && <SystemLoader />}
      <ConfirmationModal
        open={modalOpen}
        title="Save Attendance"
        desc="This will update the attendance list and save any encoded results. Continue?"
        onConfirm={handleSave}
        onCancel={() => setModalOpen(false)}
      />
      <Notification message={notification} type={notificationType} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray overflow-auto">
        
        {/* Header */}
        {/* <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(-1)} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors">
               <ArrowLeft className="w-4 h-4" />
             </button>
             <div>
               <h2 className="text-xl font-bold text-gray-800">Attendance: {record.title}</h2>
               <p className="text-sm text-gray-600 mt-1">{record.date}</p>
             </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Available Patients */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[80vh]">
            <div className="px-5 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-yellow-600">Available Patients</h3>
            </div>
            <div className="p-4 flex-1 flex flex-col min-h-0">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 py-2 pl-10 pr-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full text-sm"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                {filteredPatients.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {searchTerm ? "No matching patients found." : "No patients available."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredPatients.map((patient) => (
                      <div key={patient.patient_id || patient.full_name} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:border-green-300 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                             {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                          </p>
                          <p className="text-xs text-gray-500">ID: {patient.patient_id || "N/A"}</p>
                        </div>
                        <button
                          onClick={() => addAttendee(patient)}
                          className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded transition-colors"
                          title="Add to list"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Current Attendees & Results */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[80vh]">
            <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-yellow-600">Current List</h3>
              <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                {patients.length} Attendees
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-2">
                {patients.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <FileSignature className="w-12 h-12 mb-2 opacity-50" />
                     <p className="text-sm">No attendees added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patients.map((attendee, idx) => (
                      <div key={idx} className="p-3 bg-white rounded border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                             <p className="text-sm font-medium text-gray-800">{attendee.name}</p>
                             <button
                               onClick={() => removeAttendee(idx)}
                               className="text-red-400 hover:text-red-600 transition-colors"
                               title="Remove"
                             >
                               <UserMinus className="w-4 h-4" />
                             </button>
                        </div>
                        {/* Result Input Field */}
                        <div>
                           <input 
                             type="text"
                             value={attendee.result}
                             onChange={(e) => updateResult(idx, e.target.value)}
                             placeholder="Enter screening result / notes..."
                             className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                           />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        
        <div className="flex justify-around print:hidden mt-2">
            <button
               onClick={() => navigate(-1)}
               className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md hover:bg-gray-50 transition-colors"
            >
               Back
            </button>
            <button
               onClick={() => setModalOpen(true)}
               disabled={saving}
               className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
               {saving ? "Saving..." : "Save Attendance"}
            </button>
        </div>
      </div>
    </>
  );
};

export default MassScreeningAttendance;