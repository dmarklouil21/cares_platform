import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  FileText, 
  Download, 
  Users, 
  ClipboardList,
  ArrowLeft
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
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      
      {/* Error Message */}
      {error && (
        <div className="mx-5 mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
        {/* Top Title */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Application Details
        </h2>

        {/* White Card Container */}
        <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
            <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
              Mass Screening Activity
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(
                record.status
              )}`}
            >
              {record.status || "Pending"}
            </span>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column: Activity Details */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                  Activity Details
                </h3>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-500 font-medium">Activity Title</span>
                  <span className="col-span-2 text-gray-900 font-semibold">{record.title}</span>

                  <span className="text-gray-500 font-medium">Date</span>
                  <span className="col-span-2 text-gray-900 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {prettyDate(record.date)}
                  </span>

                  <span className="text-gray-500 font-medium">Venue</span>
                  <span className="col-span-2 text-gray-900 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {record.venue || "---"}
                  </span>

                  <span className="text-gray-500 font-medium">Beneficiaries</span>
                  <span className="col-span-2 text-gray-900">{record.beneficiaries}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                  Description & Support
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</span>
                    <p className="text-sm text-gray-900 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                      {record.description || "No description provided."}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase mb-1 block">RAFI Support Need</span>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                      <p className="text-sm text-gray-800 italic">{record.supportNeed || "None specified."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Attendance & Attachments */}
            <div className="space-y-8">
              
              {/* Attendance Action */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" /> Attendance Management
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-4">
                    View and manage the list of patients and their screening results for this activity.
                  </p>
                  <button
                    onClick={() => navigate("/admin/cancer-screening/view/mass-attendance-view", {
                      state: { screening: record }
                    })}
                    className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 py-2 px-4 rounded text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ClipboardList className="w-4 h-4 text-primary" />
                    View Attendance List
                  </button>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                  Attachments
                </h3>
                
                <div className="flex flex-col gap-3">
                  {attachmentsToShow.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No documents attached.</p>
                  ) : (
                    attachmentsToShow.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="text-gray-400 group-hover:text-primary">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-primary truncate max-w-[200px]">
                            {att.name}
                          </span>
                        </div>
                        <a 
                          href={att.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
        {/* Footer Actions */}
        <div className="flex justify-end print:hidden mt-5">
          <Link
            to="/admin/cancer-screening/mass-screening"
            className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Decorative Footer */}
      {/* <div className="h-16 bg-secondary shrink-0"></div> */}
    </div>
  );
}