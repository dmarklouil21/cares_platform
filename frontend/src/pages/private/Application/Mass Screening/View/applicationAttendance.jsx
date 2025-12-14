import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Search, 
  UserPlus, 
  UserMinus, 
  Users, 
  User,
  FileSignature
} from "lucide-react";

import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import api from "src/api/axiosInstance";

const PartnerManageAttendance = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const record = state?.record || state || null;

  const [patients, setPatients] = useState([]); // Current attendees
  const [eligible, setEligible] = useState([]); // Search results
  const [search, setSearch] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // --- Initialize Data ---
  useEffect(() => {
    if (!record?.id) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/partners/cancer-screening/mass-screening/attendance/${record.id}/`);
        if (Array.isArray(data) && data.length) {
          setPatients(data.map((e) => ({ name: e.name, result: e.result || "" })));
        }
      } catch (e) {
        setNotification("Failed to load existing attendance.");
        setNotificationType("error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [record?.id]);

  // --- Search Logic (Debounced) ---
  useEffect(() => {
    let alive = true;
    const loadEligible = async () => {
      try {
        setEligibleLoading(true);
        const params = search?.trim() ? { q: search.trim() } : undefined;
        // Fetch from the specific private partners endpoint
        const { data } = await api.get(`/partners/private/eligible-patients/`, params ? { params } : undefined);
        
        if (!alive) return;
        const list = Array.isArray(data?.patients) ? data.patients : [];
        setEligible(list);
      } catch (e) {
        console.warn("Search failed", e);
      } finally {
        if (alive) setEligibleLoading(false);
      }
    };
    
    const t = setTimeout(loadEligible, 300); // 300ms debounce
    return () => { alive = false; clearTimeout(t); };
  }, [search]);

  // --- Handlers ---
  const addFromEligible = (item) => {
    const name = String(item?.name || "").trim();
    if (!name) return;
    if (patients.some((p) => p.name === name)) {
        setNotification("Patient already added to list.");
        setNotificationType("info");
        return;
    }
    setPatients((list) => [...list, { name, result: "" }]);
  };

  const removePatient = (idx) => {
    setPatients((list) => list.filter((_, i) => i !== idx));
  };

  const updateResult = (idx, value) => {
    setPatients((list) => list.map((p, i) => (i === idx ? { ...p, result: value } : p)));
  };

  const saveAttendance = async () => {
    setModalOpen(false);
    if (!record?.id) return;

    try {
      setSaving(true);
      const entries = patients
        .map((p) => ({ name: String(p.name || "").trim(), result: String(p.result || "").trim() }))
        .filter((p) => p.name);
      
      await api.put(`/partners/cancer-screening/mass-screening/attendance/${record.id}/`, { entries });
      
      setNotification("Attendance saved successfully.");
      setNotificationType("success");
      setTimeout(() => navigate(-1), 1500);
    } catch (e) {
      console.error(e);
      setNotification(e?.response?.data?.detail || "Failed to save attendance.");
      setNotificationType("error");
    } finally {
      setSaving(false);
    }
  };

  if (!record) return (
    <div className="h-screen flex items-center justify-center bg-gray">
        <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">Record information is missing.</p>
            <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
        </div>
    </div>
  );

  if (loading) return <SystemLoader />;

  return (
    <>
      {saving && <SystemLoader />}
      
      <ConfirmationModal
        open={modalOpen}
        title="Confirm Save"
        desc="This will update the attendance list and results. Continue?"
        onConfirm={saveAttendance}
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
              
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 uppercasee">
                <Users className="w-3.5 h-3.5" />
                {patients.length} Registered
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
              
              {/* Left Column: Available Patients (Search) */}
              <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" /> Search Patients
                  </h3>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search registered patients..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
                  {eligibleLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <p className="text-sm text-gray-400">Searching...</p>
                    </div>
                  ) : eligible.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <p className="text-sm text-gray-500">No patients found.</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
                    </div>
                  ) : (
                    eligible.map((it, idx) => {
                      const isAdded = patients.some(p => p.name === it.name);
                      return (
                        <div 
                            key={idx} 
                            className={`flex items-center justify-between p-3 rounded border transition-all ${
                                isAdded 
                                    ? 'bg-gray-100 border-gray-200 opacity-60' 
                                    : 'bg-white border-gray-200 shadow-sm hover:border-green-300 hover:shadow-md'
                            }`}
                        >
                          <span className="text-sm font-medium text-gray-800">{it.name}</span>
                          <button
                            onClick={() => addFromEligible(it)}
                            disabled={isAdded}
                            className={`p-1.5 rounded transition-colors ${
                                isAdded 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700'
                            }`}
                            title={isAdded ? "Already Added" : "Add Patient"}
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Current Attendees List */}
              <div className="flex flex-col h-full bg-blue-50/30 rounded-lg border border-blue-100 overflow-hidden">
                <div className="p-4 border-b border-blue-100 bg-white">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-gray-400" /> Attendance List
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50">
                  {patients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <FileSignature className="w-12 h-12 text-gray-300 mb-3 opacity-50" />
                      <p className="text-sm text-gray-500">List is currently empty.</p>
                      <p className="text-xs text-gray-400 mt-1">Search and add patients from the left panel.</p>
                    </div>
                  ) : (
                    patients.map((p, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-2">
                           <p className="text-sm font-bold text-gray-800">{p.name}</p>
                           <button 
                             onClick={() => removePatient(idx)}
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
                              placeholder="Enter screening result or notes..."
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

export default PartnerManageAttendance;