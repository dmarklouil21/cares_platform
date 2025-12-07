// src/pages/private-partners/PartnerManageAttendance.jsx
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Search, UserPlus, UserMinus, FileSignature } from "lucide-react";

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
      
      // Using PUT with nested entries object as per your logic
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

  if (!record) return <div className="p-10 text-center">Record ID missing.</div>;
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

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray overflow-auto">
        
        {/* Header Information (Optional, keeping it clean per Psychosocial style) */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Search Eligible Patients */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[80vh]">
            <div className="px-5 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-yellow-600">Add Patient</h3>
            </div>
            <div className="p-4 flex-1 flex flex-col min-h-0">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search registered patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-gray-300 py-2 pl-10 pr-4 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full text-sm"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                {eligibleLoading ? (
                   <p className="text-center text-gray-400 py-4 text-sm">Searching...</p>
                ) : eligible.length === 0 ? (
                   <p className="text-center text-gray-400 py-4 text-sm">No patients found.</p>
                ) : (
                  <div className="space-y-2">
                    {eligible.map((it, idx) => {
                      const isAdded = patients.some(p => p.name === it.name);
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded border transition-colors ${isAdded ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200 hover:border-green-300'}`}>
                           <span className="text-sm font-medium text-gray-800">{it.name}</span>
                           <button
                             onClick={() => addFromEligible(it)}
                             disabled={isAdded}
                             className={`p-1.5 rounded text-white transition-colors ${isAdded ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                           >
                             <UserPlus className="w-4 h-4" />
                           </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Current List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[80vh]">
            <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-yellow-600">Current Attendees</h3>
              <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                {patients.length} Added
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-2">
                 {patients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                       <FileSignature className="w-12 h-12 mb-2 opacity-50" />
                       <p className="text-sm">List is empty.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {patients.map((p, idx) => (
                         <div key={idx} className="p-3 bg-white rounded border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                               <p className="text-sm font-medium text-gray-800">{p.name}</p>
                               <button 
                                 onClick={() => removePatient(idx)}
                                 className="text-red-400 hover:text-red-600 transition-colors"
                               >
                                 <UserMinus className="w-4 h-4" />
                               </button>
                            </div>
                            <input 
                              type="text"
                              value={p.result}
                              onChange={(e) => updateResult(idx, e.target.value)}
                              placeholder="Enter result or notes..."
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
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
               className="text-center cursor-pointer bg-white text-black py-2 w-[35%] border border-black rounded-md hover:bg-gray-50 transition-colors"
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

export default PartnerManageAttendance;