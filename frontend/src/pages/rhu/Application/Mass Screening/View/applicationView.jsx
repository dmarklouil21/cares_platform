// src/pages/mass-screening/ViewMassScreening.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Save, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Users, 
  ClipboardList 
} from "lucide-react";

import SystemLoader from "src/components/SystemLoader";
import Notification from "src/components/Notification";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import { 
  getMyMassScreeningDetail, 
  updateMyMassScreening, 
  addMassScreeningAttachments, 
  deleteMassScreeningAttachment 
} from "src/api/massScreening";

const ViewMassScreening = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Logic to determine ID from state or URL
  const selected = (location.state && (location.state.record || location.state.item || location.state)) || null;
  const qsId = new URLSearchParams(location.search).get('id');
  const passedId = selected?.id || location.state?.id || qsId || null;

  const [form, setForm] = useState({
    id: selected?.id ?? "",
    title: selected?.title ?? "",
    date: selected?.date ?? "",
    beneficiaries: selected?.beneficiaries ?? "",
    description: selected?.description ?? "",
    supportNeed: selected?.supportNeed ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusValue, setStatusValue] = useState(selected?.status || "");
  const [attachments, setAttachments] = useState([]);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Status Badge Styling
  const getStatusColor = (status) => {
    switch (status) {
      case "Verified": return "bg-green-100 text-green-700 border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Done": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  // --- Data Fetching ---
  const toAttachment = (a) => {
    if (typeof a === "string") return { name: a.split("/").pop(), url: a };
    if (a && typeof a === "object") {
      if (a.file instanceof File) return { name: a.name, size: a.size, file: a.file, url: a.url };
      if (a.id != null && typeof a.file === "string") return { id: a.id, name: a.file.split("/").pop(), url: a.file };
      if (a.url) return { name: a.name, size: a.size, url: a.url };
    }
    return a;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!passedId) return;
      try {
        setLoading(true);
        const data = await getMyMassScreeningDetail(passedId);
        setForm({
          id: data.id,
          title: data.title || "",
          date: data.date || "",
          beneficiaries: data.beneficiaries || "",
          description: data.description || "",
          supportNeed: data.support_need || "",
        });
        setStatusValue(data.status || "");
        const atts = Array.isArray(data.attachments) ? data.attachments : [];
        setAttachments(atts.map(toAttachment));
      } catch (e) {
        setNotification("Failed to load record details.");
        setNotificationType("error");
      } finally {
        setLoading(false);
      }
    };
    
    // Initial load logic
    if (!selected || !selected.title) {
        fetchDetail();
    } else if (selected && selected.attachments) {
        setAttachments((selected.attachments || []).map(toAttachment));
    }
  }, [passedId]);

  // --- Handlers ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const MAX_SIZE = 10 * 1024 * 1024;
    const next = [];

    for (const f of files) {
      if (f.size > MAX_SIZE) {
        setNotification(`"${f.name}" exceeds 10MB limit.`);
        setNotificationType("error");
        continue;
      }
      next.push({
        name: f.name,
        size: f.size,
        file: f,
        url: URL.createObjectURL(f),
      });
    }
    if (next.length) setAttachments((prev) => [...prev, ...next]);
    e.target.value = ""; 
  };

  const removeAttachment = async (idx) => {
    const item = attachments[idx];
    if (item.id != null) {
      try {
        await deleteMassScreeningAttachment(item.id);
        setAttachments((prev) => prev.filter((_, i) => i !== idx));
        setNotification("Attachment removed.");
        setNotificationType("success");
      } catch (e) {
        setNotification("Failed to remove attachment.");
        setNotificationType("error");
      }
    } else {
      setAttachments((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const saveChanges = async () => {
    setModalOpen(false);
    try {
      setSaving(true);
      
      // 1. Update Details
      await updateMyMassScreening(form.id, {
        title: form.title,
        date: form.date,
        beneficiaries: form.beneficiaries,
        description: form.description,
        support_need: form.supportNeed,
      });

      // 2. Upload New Files
      const newFiles = attachments.filter((a) => a.file instanceof File && a.id == null).map((a) => a.file);
      if (newFiles.length) {
        await addMassScreeningAttachments(form.id, newFiles);
      }

      // 3. Refresh
      const data = await getMyMassScreeningDetail(form.id);
      setAttachments((data.attachments || []).map(toAttachment));

      setNotification("Mass screening details updated successfully!");
      setNotificationType("success");
    } catch (e) {
      setNotification(e?.response?.data?.detail || "Failed to save changes.");
      setNotificationType("error");
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(""), 3000);
    }
  };

  if (loading) return <SystemLoader />;

  return (
    <>
      {saving && <SystemLoader />}
      <ConfirmationModal
        open={modalOpen}
        title="Confirm Save"
        desc="Are you sure you want to save changes to this Mass Screening record?"
        onConfirm={saveChanges}
        onCancel={() => setModalOpen(false)}
      />
      <Notification message={notification} type={notificationType} />

      <div className="min-h-screen w-full flex flex-col p-5 gap-4 bg-gray overflow-auto">
        
        {/* Header with Status */}
        {/* <div className="flex justify-between items-center w-full">
             <div className="flex items-center gap-4">
                <Link to="/rhu/application/mass-screening" className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                   <h2 className="text-xl font-bold text-gray-800">Mass Screening</h2>
                   <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(statusValue)}`}>
                      {statusValue || "Pending"}
                   </div>
                </div>
             </div>
             <button
               onClick={() => setModalOpen(true)}
               disabled={saving}
               className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
             >
               <Save className="w-4 h-4" />
               Save Changes
             </button>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content: Details */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-5 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-yellow-600">Details</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Title</label>
                                <input 
                                    name="title"
                                    value={form.title} 
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500"/> Date
                                </label>
                                <input 
                                    type="date"
                                    name="date"
                                    value={form.date} 
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Target Beneficiaries</label>
                            <input 
                                name="beneficiaries"
                                value={form.beneficiaries} 
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                            <textarea 
                                name="description"
                                rows={4}
                                value={form.description} 
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">RAFI Support Need</label>
                            <textarea 
                                name="supportNeed"
                                rows={3}
                                value={form.supportNeed} 
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Attachments Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-yellow-600">Attachments</h3>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                            <Upload className="w-4 h-4" /> Add File
                        </button>
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            multiple 
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="p-4">
                        {attachments.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No attachments uploaded.</p>
                        ) : (
                            <div className="space-y-2">
                                {attachments.map((att, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-white p-2 rounded border border-gray-200">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-gray-800 truncate">{att.name}</p>
                                                {att.size && <p className="text-xs text-gray-500">{(att.size / 1024 / 1024).toFixed(2)} MB</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {att.url && att.url !== "#" && (
                                                <a 
                                                    href={att.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => removeAttachment(idx)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar: Attendance & Actions */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-700">Attendance</h4>
                        <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            <span>Manage List</span>
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-4">
                        Manage patient attendance and encode screening results for this activity.
                    </p>

                    <button
                        onClick={() => navigate("/rhu/application/mass-screening/view/attendance", {
                            state: { record: form }
                        })}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <ClipboardList className="w-4 h-4" />
                        Manage Attendance
                    </button>
                </div>

                {/* Quick Info / Readonly */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System Info</h4>
                   <div className="space-y-3">
                        <div>
                            <span className="text-xs text-gray-500 block">Mass ID</span>
                            <span className="text-sm font-mono text-gray-800">{form.id}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block">Status</span>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(statusValue)}`}>
                                {statusValue || "N/A"}
                            </span>
                        </div>
                   </div>
                </div>
            </div>
        </div>

        <div className="flex justify-around print:hidden mt-2">
             <Link
               to="/rhu/application/mass-screening"
               className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md hover:bg-gray-50 transition-colors"
             >
               Back
             </Link>
             <button
               onClick={() => setModalOpen(true)}
               disabled={saving}
               className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
             >
               {saving ? 'Saving...' : 'Save Changes'}
             </button>
        </div>
      </div>
    </>
  );
};

export default ViewMassScreening;