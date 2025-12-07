// src/pages/admin/Services/CancerScreening/AdminMassAttendanceView.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, FileSignature } from "lucide-react";

import SystemLoader from "src/components/SystemLoader";
import { getAdminMassScreeningAttendance } from "src/api/massScreening";

export default function AdminMassAttendanceView() {
  const location = useLocation();
  const navigate = useNavigate();

  const screening = location.state?.screening;
  const requestId = screening?.id;

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!requestId) return;
      try {
        setLoading(true);
        setError("");
        const data = await getAdminMassScreeningAttendance(requestId);
        const normalized = (Array.isArray(data) ? data : []).map((e) => ({
          name: e.name,
          result: e.result || "",
        }));
        setPatients(normalized);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [requestId]);

  if (!requestId) return (
      <div className="h-screen w-full flex items-center justify-center bg-gray flex-col gap-4">
          <div className="bg-white p-8 rounded-lg shadow text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Record Selected</h3>
              <p className="text-gray-500 mb-4">Please select a mass screening request first.</p>
              <Link to="/admin/cancer-screening/mass-screening" className="text-primary hover:underline">Return to list</Link>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray overflow-auto">
      
      {/* Header */}
      {/* <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors">
            <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
            <h2 className="text-xl font-bold text-gray-800">Attendance List</h2>
            <p className="text-sm text-gray-600">ID: {requestId} • {screening?.title}</p>
        </div>
      </div> */}

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-yellow-600">Participants</h3>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                  <Users className="w-3.5 h-3.5" />
                  {patients.length} Total
              </div>
          </div>

          <div className="p-0">
             {loading && <div className="p-10"><SystemLoader /></div>}
             
             {error && !loading && (
                <div className="p-8 text-center text-red-600 bg-red-50 m-4 rounded border border-red-100">
                    {error}
                </div>
             )}

             {!loading && !error && patients.length === 0 && (
                 <div className="p-12 text-center flex flex-col items-center">
                     <FileSignature className="w-12 h-12 text-gray-300 mb-3" />
                     <p className="text-gray-500 font-medium">No attendance records found.</p>
                     <p className="text-sm text-gray-400">The partner has not encoded any attendees yet.</p>
                 </div>
             )}

             {!loading && !error && patients.length > 0 && (
                 <div className="min-w-full">
                     {/* Table Header */}
                     <div className="grid grid-cols-12 bg-gray-50 px-6 py-3 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                         <div className="col-span-4 md:col-span-5">Patient Name</div>
                         <div className="col-span-8 md:col-span-7">Screening Result / Notes</div>
                     </div>
                     
                     {/* Rows */}
                     <div className="divide-y divide-gray-100">
                         {patients.map((p, i) => (
                             <div key={i} className="grid grid-cols-12 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                                 <div className="col-span-4 md:col-span-5 font-medium text-gray-900">
                                     {p.name}
                                 </div>
                                 <div className="col-span-8 md:col-span-7 text-sm text-gray-600">
                                     {p.result ? (
                                         <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200 inline-block">
                                             {p.result}
                                         </span>
                                     ) : (
                                         <span className="text-gray-400 italic">— No result encoded —</span>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     {/* Footer */}
                     <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-right">
                         Generated from Mass Screening ID {requestId}
                     </div>
                 </div>
             )}
          </div>
      </div>

      <div className="flex justify-end mt-2 print:hidden">
          <button
             onClick={() => navigate(-1)}
             className="text-center cursor-pointer bg-white text-black py-2 w-[35%] border border-black rounded-md hover:bg-gray-50 transition-colors"
           >
             Back
           </button>
      </div>
    </div>
  );
}