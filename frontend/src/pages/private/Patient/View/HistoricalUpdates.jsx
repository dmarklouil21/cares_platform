import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  History, 
  Activity, 
  Calendar, 
  FileText, 
  Clock,
  AlertCircle
} from "lucide-react";

import SystemLoader from "src/components/SystemLoader";

const HistoricalUpdates = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const record = location.state;
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    if (record?.patient) {
      setPatient(record.patient);
    }
  }, [record]);

  if (!patient) {
    return (
        <div className="h-screen flex items-center justify-center bg-gray">
             <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No patient record loaded.</p>
                <button 
                  onClick={() => navigate(-1)} 
                  className="text-primary hover:underline mt-4 text-sm font-semibold"
                >
                  Go Back
                </button>
             </div>
        </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="py-5 px-5 md:px-5 flex flex-col flex-1 max-w-7xl mx-auto w-full">
        
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Patient Profile
        </h2>

        {/* White Card Container */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow/10 rounded-full text-yellow">
                <History className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                   Historical Data
                </h1>
                <p className="text-sm text-gray-500">
                   Patient: <span className="font-semibold text-gray-700">{patient.full_name}</span> (ID: {patient.patient_id})
                </p>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Services Received */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" /> Treatment / Services Received
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-2 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div>Service Type</div>
                    <div className="text-right">Date Completed</div>
                </div>

                {(patient.service_received && patient.service_received.length > 0) ? (
                    <div className="divide-y divide-gray-100">
                        {patient.service_received.map((service, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                <span className="font-semibold text-gray-800 text-sm">
                                    {service.service_type || "Unknown Service"}
                                </span>
                                <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1 font-medium">
                                    <Calendar className="w-3 h-3" />
                                    {service.date_completed || "No Date"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                        <Activity className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">No services received yet.</p>
                    </div>
                )}
              </div>
            </div>

            {/* Right Column: Historical Updates */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Patient History Log
              </h3>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-3 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">Last Checkup</div>
                    <div className="col-span-2">Note</div>
                </div>

                {(patient.historical_updates && patient.historical_updates.length > 0) ? (
                    <div className="divide-y divide-gray-100">
                        {patient.historical_updates.map((update, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50 transition-colors grid grid-cols-3 gap-4 text-sm">
                                <div className="col-span-1 font-medium text-gray-900 flex items-start gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                                    {update.date || "---"}
                                </div>
                                <div className="col-span-2 text-gray-600 leading-relaxed bg-gray-50/50 p-2 rounded border border-gray-100">
                                    {update.note || "No notes recorded."}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                        <FileText className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">No historical updates recorded.</p>
                    </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end border-t border-gray-100 pt-6">
            <Link
              to={`/private/patients/view/cancer-data`}
              state={{ patient: patient }}
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

export default HistoricalUpdates;