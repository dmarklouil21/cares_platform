import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Search, 
  UserPlus, 
  UserMinus, 
  FileSignature, 
  Users,
  User,
  AlertCircle
} from "lucide-react";

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

        // 2. Fetch Available Patients (Specific logic for RHU)
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
      setTimeout(() => navigate(-1), 1500); 
    } catch (error) {
      setNotification("Failed to save attendance.");
      setNotificationType("error");
    } finally {
      setSaving(false);
    }
  };

  if (!record) return (
    <div className="h-screen flex items-center justify-center bg-gray">
        <div className="bg-white p-6 rounded-lg shadow text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3"/>
            <p className="text-gray-600 font-medium">Record ID missing.</p>
            <button onClick={() => navigate(-1)} className="text-primary hover:underline mt-2">Go Back</button>
        </div>
    </div>
  );

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

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Mass Screening Management
          </h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                  Manage Attendance
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                   Activity: <span className="font-medium text-gray-700">{record.title}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 uppercase">
                <Users className="w-3.5 h-3.5" />
                {patients.length} Participants
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
              
              {/* Left Column: Available Patients */}
              <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" /> Search Local Patients
                  </h3>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
                  {filteredPatients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <p className="text-sm text-gray-500">
                          {searchTerm ? "No matching patients found." : "No patients available."}
                        </p>
                    </div>
                  ) : (
                    filteredPatients.map((patient, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all"
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                          </p>
                          <p className="text-xs text-gray-500 truncate font-mono">
                            ID: {patient.patient_id || "N/A"}
                          </p>
                        </div>
                        <button
                          onClick={() => addAttendee(patient)}
                          className="bg-green-50 text-green-600 hover:bg-green-100 p-2 rounded-full transition-colors"
                          title="Add to list"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Attendance List */}
              <div className="flex flex-col h-full bg-blue-50/30 rounded-lg border border-blue-100 overflow-hidden">
                <div className="p-4 border-b border-blue-100 bg-white">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-gray-400" /> Attendance & Results
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50">
                  {patients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <FileSignature className="w-12 h-12 text-gray-300 mb-3 opacity-50" />
                      <p className="text-sm text-gray-500">Attendance list is empty.</p>
                      <p className="text-xs text-gray-400 mt-1">Search and add patients from the left panel.</p>
                    </div>
                  ) : (
                    patients.map((p, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-2">
                           <p className="text-sm font-bold text-gray-800">{p.name}</p>
                           <button 
                             onClick={() => removeAttendee(idx)}
                             className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                             title="Remove"
                           >
                             <UserMinus className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="relative">
                            <input 
                              type="text"
                              value={p.result}
                              onChange={(e) => updateResult(idx, e.target.value)}
                              placeholder="Enter screening result / notes..."
                              className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-around print:hidden mt-6">
              <button
                onClick={() => navigate(-1)}
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                {/* <ArrowLeft className="w-4 h-4" /> */}
                Cancel
              </button>
              <button
                onClick={() => setModalOpen(true)}
                disabled={saving}
                className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
              >
                {/* <Save className="w-4 h-4" /> */}
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>

          </div>
        </div>

        {/* Decorative Footer */}
        <div className="h-16 bg-secondary shrink-0"></div>
      </div>
    </>
  );
};

export default MassScreeningAttendance;