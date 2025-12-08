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
  ClipboardList,
  AlertCircle
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
  const [statusValue, setStatusValue] = useState(selected?.status || "Pending");
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
        setStatusValue(data.status || "Pending");
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
      setStatusValue(data.status);

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
                  {form.title || "Activity Details"}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                   ID: <span className="font-mono text-gray-700">{form.id}</span>
                </p>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(statusValue)}`}>
                {statusValue}
              </span>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
              
              {/* Left Column: Form Details (2/3) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Activity Details */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" /> Activity Info
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Activity Title</label>
                        <input 
                            name="title"
                            value={form.title} 
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Enter title"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
                            <input 
                                type="date"
                                name="date"
                                value={form.date} 
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Beneficiaries</label>
                            <input 
                                name="beneficiaries"
                                value={form.beneficiaries} 
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Target audience"
                            />
                        </div>
                    </div>
                  </div>
                </div>

                {/* Narrative Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> Narrative & Needs
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                        <textarea 
                            name="description"
                            rows={4}
                            value={form.description} 
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Describe the activity..."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">RAFI Support Need</label>
                        <div className="bg-yellow-50/50 rounded-md p-1">
                            <textarea 
                                name="supportNeed"
                                rows={3}
                                value={form.supportNeed} 
                                onChange={handleChange}
                                className="w-full border border-yellow-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Specify support needed..."
                            />
                        </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Attendance & Attachments (1/3) */}
              <div className="lg:col-span-1 space-y-8">
                
                {/* Attendance Card */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" /> Attendance
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        Manage patient attendance for this mass screening event. Ensure all participants are recorded.
                    </p>
                    <button
                        onClick={() => navigate("/rhu/application/mass-screening/view/attendance", {
                            state: { record: form }
                        })}
                        className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 py-2 px-4 rounded text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <ClipboardList className="w-4 h-4 text-primary" />
                        Check Attendance
                    </button>
                  </div>
                </div>

                {/* Attachments Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                      <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                        <Upload className="w-4 h-4 text-gray-400" /> Attachments
                      </h3>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                      >
                        + Add
                      </button>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                  </div>

                  <div className="flex flex-col gap-3">
                    {attachments.length === 0 ? (
                        <div className="text-center p-4 bg-gray-50 rounded border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400">No files attached.</p>
                        </div>
                    ) : (
                        attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{att.name}</p>
                                        {att.size && <p className="text-[10px] text-gray-400">{(att.size / 1024 / 1024).toFixed(2)} MB</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {att.url && att.url !== "#" && (
                                        <a 
                                            href={att.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                    <button 
                                        onClick={() => removeAttachment(idx)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-around print:hidden mt-6">
              <Link
                to="/rhu/application/mass-screening"
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                Back
              </Link>
              <button
                onClick={() => setModalOpen(true)}
                disabled={saving}
                className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
              >
                {/* <Save className="w-4 h-4" /> */}
                {saving ? 'Saving...' : 'Save Changes'}
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

export default ViewMassScreening;