import { useEffect, useRef, useState } from "react";
import { createMassScreening } from "src/api/massScreening";
// import { Link } from "react-router-dom"; // not used

/* Notification (no close button) */
function Notification({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
      <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
        <img
          src="/images/logo_white_notxt.png"
          alt="Rafi Logo"
          className="h-[25px]"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}

const MassScreening = () => {
  const emptyForm = () => ({
    title: "",
    venue: "",
    date: "",
    beneficiaries: "",
    description: "",
    supportNeed: "",
  });

  const [form, setForm] = useState(emptyForm());
  const [showConfirm, setShowConfirm] = useState(false);
  const [notif, setNotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ------------------------- Attachments ------------------------- */
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  // Today in YYYY-MM-DD (local) for date validation and input max
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const todayStr = getTodayStr();

  const formatBytes = (b) => {
    if (!b && b !== 0) return "—";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const accepted = [];
    for (const f of files) {
      if (f.size > MAX_SIZE) {
        setNotif(`"${f.name}" exceeds 10MB limit.`);
        continue;
      }
      accepted.push(f);
    }
    if (accepted.length) setAttachments((prev) => [...prev, ...accepted]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleBrowse = () => fileInputRef.current?.click();
  const removeFile = (idx) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  /* ------------------------ Notification ------------------------ */
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(""), 2500);
    return () => clearTimeout(t);
  }, [notif]);

  /* ---------------------------- Form ---------------------------- */
  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const handleSubmitClick = () => {
    // basic required field check
    if (!form.title || !form.venue || !form.date) {
      setNotif("Please fill out Title, Venue, and Date.");
      return;
    }
    // date must not be earlier than today
    if (form.date < todayStr) {
      setNotif("Date cannot be earlier than today.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      // Final guard: date must not be earlier than today
      if (form.date < todayStr) {
        setNotif("Date cannot be earlier than today.");
        setSubmitting(false);
        return;
      }
      // Build FormData
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("venue", form.venue);
      fd.append("date", form.date);
      if (form.beneficiaries) fd.append("beneficiaries", form.beneficiaries);
      if (form.description) fd.append("description", form.description);
      if (form.supportNeed) fd.append("support_need", form.supportNeed);

      attachments.forEach((file) => {
        fd.append("attachments", file);
      });

      await createMassScreening(fd);

      setShowConfirm(false);
      setNotif("Mass screening request submitted successfully.");
      setForm(emptyForm());
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Failed to submit. Please try again.";
      setNotif(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray overflow-auto relative">
      <Notification message={notif} />

      <div className="py-6 px-10">
        <h2 className="text-xl font-semibold mb-6">Mass Screening Application</h2>

        <div className="flex flex-col gap-3 w-full bg-white rounded-2xl py-7 px-8">
          <h3 className="text-2xl font-bold text-secondary">
            Mass Screening
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col justify-between">
              <label htmlFor="title" className="text-gray2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={onChange("title")}
                className="border border-gray2 py-2 w-full px-5 rounded-md outline-none"
              />
            </div>

            <div className="flex flex-col justify-between">
              <label htmlFor="venue" className="text-gray2">
                Venue
              </label>
              <input
                id="venue"
                type="text"
                value={form.venue}
                onChange={onChange("venue")}
                className="border border-gray2 py-2 w-full px-5 rounded-md outline-none"
              />
            </div>

            <div className="flex flex-col justify-between">
              <label htmlFor="date" className="text-gray2">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={onChange("date")}
                min={todayStr}
                className="border border-gray2 py-2 w-full px-5 rounded-md outline-none"
              />
            </div>

            <div className="flex flex-col justify-between ">
              <label htmlFor="beneficiaries" className="text-gray2">
                Target Beneficiaries
              </label>
              <input
                id="beneficiaries"
                type="text"
                value={form.beneficiaries}
                onChange={onChange("beneficiaries")}
                className="border border-gray2 py-2 w-full px-5 rounded-md outline-none"
              />
            </div>

            <div className="flex flex-col justify-between">
              <label htmlFor="description" className="text-gray2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={onChange("description")}
                className="border border-gray2 py-2 w-full px-2 rounded-md resize-none outline-none"
              />
            </div>

            <div className="flex flex-col justify-between">
              <label htmlFor="supportneed" className="text-gray2">
                RAFI support need
              </label>
              <textarea
                id="supportneed"
                rows={4}
                value={form.supportNeed}
                onChange={onChange("supportNeed")}
                className="border border-gray2 py-2 w-full px-2 rounded-md resize-none outline-none"
              />
            </div>
          </div>

          {/* ------------------------ Upload Attachment ------------------------ */}
          <div className="mt-4">
            <h4 className="text-xl font-semibold mb-3">Upload Attachment</h4>

            <div
              role="button"
              tabIndex={0}
              aria-label="Open file picker to upload attachments"
              onClick={handleBrowse}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && handleBrowse()
              }
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="w-full bg-primary/20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center py-16 cursor-pointer select-none"
            >
              <div className="bg-primary px-1 py-2 rounded-full mb-2">
                <img
                  src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                  alt="Upload"
                  className="h-5 w-7"
                />
              </div>

              <span className="font-semibold">Choose file or drag here</span>
              <div className="text-xs text-gray-500 mt-1">
                Allowed: PDF,{" "}
                <span className="font-semibold">Word (.doc, .docx)</span>,
                Excel, PNG/JPG • Size limit: 10MB
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = ""; // allow picking same file again
                }}
                accept={[
                  ".pdf",
                  ".doc",
                  ".docx",
                  ".xls",
                  ".xlsx",
                  ".png",
                  ".jpg",
                  ".jpeg",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ].join(",")}
                className="hidden"
              />
            </div>

            {/* Selected files */}
            {attachments.length > 0 && (
              <div className="mt-3 border border-gray-200 rounded-md divide-y">
                {attachments.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{f.name}</span>
                      <span className="text-gray-500 ml-2">
                        ({formatBytes(f.size)}) {f.type ? `• ${f.type}` : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* ------------------------------------------------------------------- */}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={submitting}
              className={`bg-primary font-bold text-white w-[40%] py-2 rounded-md mt-4 ${
                submitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* <div className="h-16 bg-secondary"></div> */}

      {showConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-[min(480px,92vw)] rounded-xl shadow-xl p-6 z-50 text-center">
            <h4 className="text-lg font-semibold mb-2">Submit request?</h4>
            <p className="text-sm text-gray2 mb-6">
              This will submit your entries.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md border border-gray2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 rounded-md bg-primary text-white font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MassScreening;
