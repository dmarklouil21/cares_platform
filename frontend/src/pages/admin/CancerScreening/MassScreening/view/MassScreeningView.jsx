// pages/admin/Services/CancerScreening/MassScreeningView.jsx
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export default function MassScreeningView() {
  const location = useLocation();

  // Accept state as the record itself OR inside { record } / { item }
  const selected =
    (location.state &&
      (location.state.record || location.state.item || location.state)) ||
    null;

  // Fallbacks for demo
  const record = {
    id: selected?.id ?? "APP-2025-001",
    title: selected?.title ?? "Cancer Screening",
    venue: selected?.venue ?? "Argao Sports Complex",
    description: selected?.description ?? "Community-Based Cancer Screening",
    beneficiaries: selected?.beneficiaries ?? "200",
    date: selected?.date ?? "2025-04-12",
    supportNeed:
      selected?.supportNeed ??
      "Consumable, Medical Supplies, Laboratory Processing (Cervical Screening, Prostate, Thyroid)",
    status: selected?.status ?? "approved",
  };

  const status = (record.status || "").toLowerCase();
  const statusClasses =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  /* -------------------- Sample attachments (viewable) -------------------- */
  const sampleAttachments = [
    {
      name: "Program Proposal.pdf",
      size: 284_512,
      url: "https://www.africau.edu/images/default/sample.pdf",
    },
    {
      name: "Attendance Template.xlsx",
      size: 96_404,
      url: "https://file-examples.com/storage/fe6a0b263c4f9c4f1a1cc3e/2017/02/file_example_XLSX_10.xlsx",
    },
    {
      name: "RHU Endorsement.docx",
      size: 178_230,
      url: "https://file-examples.com/storage/fe6a0b263c4f9c4f1a1cc3e/2017/02/file-sample_100kB.doc",
    },
  ];

  const attachmentsToShow = useMemo(() => {
    const a = Array.isArray(selected?.attachments) ? selected.attachments : [];
    if (a.length) {
      return a.map((att, i) =>
        typeof att === "string"
          ? { name: att.split("/").pop() || `Attachment ${i + 1}`, url: att }
          : { name: att.name, url: att.url, size: att.size }
      );
    }
    return sampleAttachments;
  }, [selected]);

  // sample attendance to pass forward (view page no longer renders it)
  const samplePatients = [
    { name: "Juan Dela Cruz", result: "BP 120/80 — Normal" },
    { name: "Maria Santos", result: "BP 140/90 — Elevated" },
    { name: "Pedro Reyes", result: "Glucose 95 mg/dL — Normal" },
    { name: "Ana Bautista", result: "Cholesterol 230 — High" },
    { name: "Jose Ramirez", result: "Referred to doctor" },
  ];

  const patientsToPass =
    (Array.isArray(selected?.patients) && selected.patients.length
      ? selected.patients
      : samplePatients) || samplePatients;

  const prettyDate = (iso) => {
    try {
      const d = new Date(`${iso}T00:00:00`);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="h-screen w-full bg-gray flex flex-col">
      {/* Header */}
      <div className="bg-white py-4 px-6 md:px-10 flex items-center justify-between">
        <div className="font-bold">Admin</div>
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src="/images/Avatar.png"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Body */}
      <div className="w-full flex-1 py-6 px-6 md:px-10 flex flex-col gap-6 overflow-auto">
        <div>
          <h2 className="text-2xl font-semibold">
            Request Review - {record.id}
          </h2>
          <p className="text-yellow mt-1">
            Review patient submitted requirements for cancer screening
            qualification.
          </p>
        </div>

        {/* Request Info */}
        <section className="bg-white rounded-2xl border border-gray-200 px-5 md:px-7 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Request Info</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${statusClasses}`}
            >
              {status === "approved" ? "Approved" : "Pending"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-5">
            <InfoRow label="Title" value={record.title} />
            <InfoRow label="Venue" value={record.venue || "—"} />
            <InfoRow label="Description" value={record.description} />
            <InfoRow
              label="Target Beneficiaries"
              value={record.beneficiaries}
            />
            <InfoRow label="Date" value={prettyDate(record.date)} />
            <InfoRow
              label="RAFI support need"
              value={record.supportNeed || "—"}
            />
          </div>
        </section>

        {/* Attachments */}
        <section className="bg-white rounded-2xl border border-gray-200 px-5 md:px-7 py-6">
          <h3 className="font-semibold mb-3">Attachments</h3>
          <AttachmentsList items={attachmentsToShow} />
        </section>

        {/* Actions */}
        <div className="w-full flex flex-col md:flex-row gap-3 justify-end">
          <Link
            to="/admin/cancer-screening/view/mass-attendance-view"
            state={{ patients: patientsToPass, screening: record }}
            className="px-4 py-2 rounded-md md:w-[30%] text-center bg-secondary text-white font-semibold"
          >
            Attendance
          </Link>

          <Link
            to="/admin/cancer-screening/mass-screening"
            className="px-4 py-2 rounded-md md:w-[30%] text-center bg-primary text-white font-semibold"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ Small components ------------------------ */

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <div className="text-lightblue text-sm font-semibold">{label}</div>
      <div className="mt-1">{value ?? "—"}</div>
    </div>
  );
}

function AttachmentsList({ items }) {
  const formatBytes = (b) => {
    if (typeof b !== "number") return null;
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const open = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((att, i) => (
        <div
          key={i}
          role="button"
          tabIndex={0}
          onClick={() => open(att.url)}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && open(att.url)
          }
          className="flex items-center justify-between px-3 py-2 border border-primary rounded-md cursor-pointer hover:bg-gray-50"
          title={`Open ${att.name}`}
        >
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/services/cancerscreening/upload_icon.svg"
              alt=""
              className="h-5 w-7"
            />
            <div className="text-sm">
              <div className="font-medium">{att.name}</div>
              {typeof att.size === "number" && (
                <div className="text-xs text-gray-500">
                  {formatBytes(att.size)}
                </div>
              )}
            </div>
          </div>
          <a
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline"
            onClick={(e) => e.stopPropagation()}
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
