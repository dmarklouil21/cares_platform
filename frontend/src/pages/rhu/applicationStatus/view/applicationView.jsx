import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";

/* Notification (no close button) */
function Notification({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 -translate-x-1/2 z-50 transition-all duration-500">
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

const applicationView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Accept: state is the record itself OR inside { record } / { item }
  const selected =
    (location.state &&
      (location.state.record || location.state.item || location.state)) ||
    null;

  /* ------------------------- Editable form state ------------------------- */
  const [form, setForm] = useState({
    id: selected?.id ?? "",
    title: selected?.title ?? "",
    date: selected?.date ?? "",
    beneficiaries: selected?.beneficiaries ?? "",
    description: selected?.description ?? "",
    supportNeed: selected?.supportNeed ?? "",
  });

  const onChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const status = (selected?.status || "").toLowerCase(); // "pending" | "approved"
  const statusClasses =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  const handleCheckAttendance = () => {
    const defaultPatients = [
      { name: "Juan Dela Cruz", result: "" },
      { name: "Maria Santos", result: "" },
      { name: "Pedro Reyes", result: "" },
      { name: "Ana Bautista", result: "" },
      { name: "Jose Ramirez", result: "" },
    ];
    navigate("/rhu/application/view/applicationAttendance", {
      state: {
        record: form, // pass edited values forward
        patients: selected?.patients ?? defaultPatients,
      },
    });
  };

  /* ------------------- Editable attachments (with samples) ------------------- */
  const sampleAttachments = [
    { name: "Program Proposal.pdf", size: 284_512, url: "#" },
    { name: "Attendance Template.xlsx", size: 96_404, url: "#" },
    { name: "RHU Endorsement.docx", size: 178_230, url: "#" },
  ];

  // Normalize initial attachments
  const initialAtt = (
    Array.isArray(selected?.attachments) && selected.attachments.length
      ? selected.attachments
      : sampleAttachments
  ).map((a) =>
    typeof a === "string"
      ? { name: a.split("/").pop(), url: a }
      : { name: a.name, size: a.size, url: a.url, file: a.file }
  );

  const [attachments, setAttachments] = useState(initialAtt);
  const fileInputRef = useRef(null);
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const next = [];
    for (const f of files) {
      if (f.size > MAX_SIZE) {
        setNotif(`"${f.name}" exceeds 10MB limit.`);
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
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => {
      const copy = [...prev];
      const item = copy[idx];
      if (item?.url?.startsWith("blob:")) URL.revokeObjectURL(item.url);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const openAttachment = (att) => {
    const url = att?.url;
    if (!url || url === "#") {
      console.log("Attachment clicked (no real URL yet):", att?.name);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ---------------- Save Changes: modal + notification ---------------- */
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [notif, setNotif] = useState("");
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(""), 2500);
    return () => clearTimeout(t);
  }, [notif]);

  const handleSaveClick = () => setShowSaveConfirm(true);
  const confirmSave = () => {
    setShowSaveConfirm(false);
    console.log("Changes saved:", {
      form,
      attachments: attachments.map((a) => ({
        name: a.name,
        size: a.size,
        url: a.url?.slice(0, 50) + (a.url?.length > 50 ? "…" : ""),
        isLocalFile: !!a.file,
      })),
    });
    setNotif("Changes saved successfully.");
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray relative">
      <Notification message={notif} />

      {/* Top bar */}
      <div className="bg-white w-full py-1 px-5 flex h-[10%] justify-between items-end">
        <h1 className="text-md font-bold h-full flex items-center">RHU</h1>
      </div>

      {/* Content */}
      <div className="w-full flex-1 py-5 flex flex-col justify-start gap-5 px-5 overflow-auto">
        <h2 className="text-xl font-bold text-left w-full pl-5">
          Mass Screening — View
        </h2>

        <div className="flex flex-col bg-white w-full rounded-2xl shadow-md px-5 py-5 gap-5">
          {!selected ? (
            <div className="text-center text-gray-500 py-8">
              Record not found.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Mass Screening Details
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${statusClasses}`}
                >
                  {status === "approved" ? "Approved" : "Pending"}
                </span>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField label="Mass ID" value={form.id} />
                <LabeledInput
                  label="Title"
                  value={form.title}
                  onChange={onChange("title")}
                />
                <LabeledInput
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={onChange("date")}
                />
                <LabeledInput
                  label="Target Beneficiaries"
                  value={form.beneficiaries}
                  onChange={onChange("beneficiaries")}
                />
                <LabeledTextArea
                  label="Description"
                  value={form.description}
                  onChange={onChange("description")}
                />
                <LabeledTextArea
                  label="RAFI support need"
                  value={form.supportNeed}
                  onChange={onChange("supportNeed")}
                />
              </div>

              {/* -------------------- Editable Attachments -------------------- */}
              <div>
                <div className="text-gray2 text-sm mb-1">Attachments</div>

                <div className="flex flex-col gap-2">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 border rounded-md border-primary py-2"
                    >
                      <button
                        type="button"
                        title={`Open ${att.name}`}
                        onClick={() => openAttachment(att)}
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                      >
                        <img
                          src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                          alt=""
                          className="h-5 w-7"
                        />
                        <div className="text-left">
                          <div className="text-sm font-medium">{att.name}</div>
                          {typeof att.size === "number" && (
                            <div className="text-xs text-gray-500">
                              {formatBytes(att.size)}
                            </div>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-3">
                        <a
                          href={att.url === "#" ? undefined : att.url}
                          target={att.url === "#" ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (att.url === "#") {
                              e.preventDefault();
                              console.log(
                                "Download clicked (no real URL yet):",
                                att.name
                              );
                            }
                          }}
                          className="text-sm text-blue-600 underline"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add files */}
                <div className="mt-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      fileInputRef.current?.click()
                    }
                    className="w-full bg-primary/10 rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-center py-8 cursor-pointer select-none"
                  >
                    <div className="bg-primary px-1 py-2 rounded-full mb-2">
                      <img
                        src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                        alt="Upload"
                        className="h-5 w-7"
                      />
                    </div>
                    <span className="font-semibold">Add files</span>
                    <div className="text-xs text-gray-500 mt-1">
                      Size limit: 10MB each
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
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
                  />
                </div>
              </div>
              {/* ------------------------------------------------------------- */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveClick}
                  className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCheckAttendance}
                  className="px-4 py-2 rounded-md bg-primary text-white font-semibold"
                >
                  Check Attendance
                </button>
              </div>
            </>
          )}
        </div>

        <div className="w-full flex justify-end">
          <Link
            to="/Rhu/application"
            className="px-4 py-2 rounded-md w-[30%] text-center bg-primary text-white font-semibold"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-[min(420px,92vw)] rounded-xl shadow-xl p-6 z-50 text-center">
            <h4 className="text-lg font-semibold mb-2">Save changes?</h4>
            <p className="text-sm text-gray2 mb-6">
              This will apply your updates to this record.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                className="px-4 py-2 rounded-md border border-gray2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSave}
                className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold"
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

export default applicationView;

/* ----------------------------- Small helpers ----------------------------- */
function formatBytes(b) {
  if (typeof b !== "number") return null;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <div className="text-gray2 text-sm mb-1">{label}</div>
      <div className="border border-gray-200 rounded-md px-4 py-2 bg-gray-50">
        {value ?? "—"}
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-gray2 text-sm mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="border border-gray-200 rounded-md px-4 py-2 w-full outline-none"
      />
    </div>
  );
}

function LabeledTextArea({ label, value, onChange, full = false }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-gray2 text-sm mb-1 block">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        className="border border-gray-200 rounded-md px-4 py-2 w-full outline-none resize-none"
      />
    </div>
  );
}
