import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, FileSignature, AlertCircle } from "lucide-react";

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

  if (!requestId)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray flex-col gap-4">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            No Record Selected
          </h3>
          <p className="text-gray-500 mb-6 text-sm">
            Please select a mass screening request from the list to view attendance.
          </p>
          <Link
            to="/admin/cancer-screening/mass-screening"
            className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Return to List
          </Link>
        </div>
      </div>
    );

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Activity Attendance
        </h2>

        {/* White Card Container */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                Attendance List
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                ID: <span className="font-mono text-gray-700">{requestId}</span>
                <span className="text-gray-300">•</span>
                <span className="font-medium text-gray-700">
                  {screening?.title || "Unknown Activity"}
                </span>
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 uppercase">
              <Users className="w-3.5 h-3.5" />
              {patients.length} Participants
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto min-h-[300px]">
            {loading && (
              <div className="h-full flex items-center justify-center">
                <SystemLoader />
              </div>
            )}

            {error && !loading && (
              <div className="p-8 text-center bg-red-50 rounded-lg border border-red-100 mx-4 mt-4">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {!loading && !error && patients.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <FileSignature className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No attendance records found
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  The partner organization has not encoded any attendees for this
                  activity yet.
                </p>
              </div>
            )}

            {!loading && !error && patients.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-gray-50 px-6 py-3 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1 text-center text-gray-400">#</div>
                  <div className="col-span-4 md:col-span-5">Patient Name</div>
                  <div className="col-span-7 md:col-span-6">
                    Screening Result / Notes
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100 bg-white">
                  {patients.map((p, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 px-6 py-4 hover:bg-gray-50 transition-colors items-center group"
                    >
                      <div className="col-span-1 text-center text-xs text-gray-400 group-hover:text-gray-600">
                        {i + 1}
                      </div>
                      <div className="col-span-4 md:col-span-5 font-medium text-gray-900 text-sm">
                        {p.name}
                      </div>
                      <div className="col-span-7 md:col-span-6 text-sm">
                        {p.result ? (
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-100 text-xs font-medium inline-block">
                            {p.result}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            — No result encoded —
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Table Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-right font-medium">
                    Total Records: {patients.length}
                </div>
              </div>
            )}
          </div>
          {/* Footer Actions */}
        <div className="flex justify-end print:hidden mt-5">
          <button
            onClick={() => navigate(-1)}
            className="w-[35%] cursor-pointer text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
          >
            {/* <ArrowLeft className="w-4 h-4" /> */}
            Back
          </button>
        </div>
        </div>
      </div>
      {/* Decorative Footer */}
      <div className="h-16 bg-secondary shrink-0"></div>
    </div>
  );
}