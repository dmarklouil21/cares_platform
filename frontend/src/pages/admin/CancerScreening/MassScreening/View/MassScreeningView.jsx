// src/pages/admin/Services/CancerScreening/AdminMassScreeningView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  FileText, 
  Download, 
  Users, 
  ClipboardList 
} from "lucide-react";

import SystemLoader from "src/components/SystemLoader";
import { getAdminMassScreeningDetail } from "src/api/massScreening";

export default function AdminMassScreeningView() {
  const location = useLocation();
  const navigate = useNavigate();

  const selected = (location.state && (location.state.record || location.state.item || location.state)) || null;
  const passedId = selected?.id || location.state?.id || null;

  const [record, setRecord] = useState({
    id: selected?.id || "",
    title: selected?.title || "",
    venue: selected?.venue || "",
    description: selected?.description || "",
    beneficiaries: selected?.beneficiaries || "",
    date: selected?.date || "",
    supportNeed: selected?.supportNeed || "",
    status: selected?.status || "",
  });
  
  const [attachments, setAttachments] = useState(Array.isArray(selected?.attachments) ? selected.attachments : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Status Logic ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Verified": return "bg-green-100 text-green-700 border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Done": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  // --- Fetch Data ---
  useEffect(() => {
    const run = async () => {
      if (!passedId) return;
      try {
        setLoading(true);
        setError("");
        const data = await getAdminMassScreeningDetail(passedId);
        setRecord({
          id: data.id,
          title: data.title || "",
          venue: data.venue || "",
          description: data.description || "",
          beneficiaries: data.beneficiaries || "",
          date: data.date || "",
          supportNeed: data.support_need || "",
          status: data.status || "",
        });
        setAttachments(Array.isArray(data.attachments) ? data.attachments : []);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load record.");
      } finally {
        setLoading(false);
      }
    };
    if (!selected || !selected.title) run();
  }, [passedId]);

  // --- Helpers ---
  const attachmentsToShow = useMemo(() => {
    const a = Array.isArray(attachments) ? attachments : [];
    return a.map((att, i) => {
      if (typeof att === "string") return { name: att.split("/").pop(), url: att };
      if (att && typeof att === "object" && typeof att.file === "string") return { name: att.file.split("/").pop(), url: att.file };
      return { name: att?.name || `Attachment ${i + 1}`, url: att?.url };
    });
  }, [attachments]);

  const prettyDate = (iso) => {
    if(!iso) return "--";
    try {
      return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch { return iso; }
  };

  if (loading) return <SystemLoader />;

  return (
    <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray overflow-auto">
      
      {/* Header */}
      {/* <div className="flex items-center gap-4 mb-2">
        <Link to="/admin/cancer-screening/mass-screening" className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors">
            <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
            <h2 className="text-xl font-bold text-gray-800">Request Review</h2>
            <p className="text-sm text-gray-600">Review submitted requirements for cancer screening qualification.</p>
        </div>
      </div> */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content: Details */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-yellow-600">Request Information</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {record.status || "Pending"}
                      </span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1">Activity Title</h4>
                              <p className="text-gray-900 font-medium">{record.title}</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Date
                              </h4>
                              <p className="text-gray-900">{prettyDate(record.date)}</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Venue
                              </h4>
                              <p className="text-gray-900">{record.venue || "—"}</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1">Target Beneficiaries</h4>
                              <p className="text-gray-900">{record.beneficiaries}</p>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-sm font-semibold text-gray-500 mb-1">Description</h4>
                          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{record.description || "No description provided."}</p>
                      </div>

                      <div>
                          <h4 className="text-sm font-semibold text-gray-500 mb-1">RAFI Support Need</h4>
                          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                             <p className="text-gray-800 text-sm italic">{record.supportNeed || "None specified."}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Attachments Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-5 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-yellow-600">Attachments</h3>
                  </div>
                  <div className="p-4">
                      {attachmentsToShow.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">No attachments uploaded.</p>
                      ) : (
                          <div className="space-y-2">
                              {attachmentsToShow.map((att, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:border-blue-200 transition-colors">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className="bg-white p-2 rounded border border-gray-200">
                                              <FileText className="w-5 h-5 text-primary" />
                                          </div>
                                          <div className="truncate">
                                              <p className="text-sm font-medium text-gray-800 truncate">{att.name}</p>
                                          </div>
                                      </div>
                                      <a 
                                          href={att.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                      >
                                          <Download className="w-4 h-4" /> Download
                                      </a>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Sidebar: Actions */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700">Attendance</h4>
                      <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>View List</span>
                      </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4">
                      View the list of patients and their screening results for this activity.
                  </p>

                  <button
                      onClick={() => navigate("/admin/cancer-screening/view/mass-attendance-view", {
                          state: { screening: record }
                      })}
                      className="w-full bg-secondary cursor-pointer hover:bg-secondary/90 text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                      <ClipboardList className="w-4 h-4" />
                      View Attendance
                  </button>
              </div>

              {/* ID Card */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Record ID</h4>
                 <p className="text-sm font-mono text-gray-800 select-all bg-gray-50 p-1 rounded border border-gray-100">{record.id}</p>
              </div>
          </div>
      </div>

      <div className="flex justify-end mt-4 print:hidden">
           <Link
             to="/admin/cancer-screening/mass-screening"
             className="text-center bg-white cursor-pointer text-black py-2 w-[35%] border border-black rounded-md hover:bg-gray-50 transition-colors"
           >
             Back
           </Link>
      </div>
    </div>
  );
}