// pages/admin/Services/CancerScreening/MassScreeningView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminMassScreeningDetail } from "../../../../../api/massScreening";

export default function MassScreeningView() {
  const location = useLocation();

  // Accept state as the record itself OR inside { record } / { item }
  const selected =
    (location.state &&
      (location.state.record || location.state.item || location.state)) ||
    null;

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
  const [attachments, setAttachments] = useState(
    Array.isArray(selected?.attachments) ? selected.attachments : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const status = record.status || ""; // Pending | Verified | Rejected | Done
  const statusClasses = (() => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Done":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  })();

  // Fetch admin detail if needed
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
        const atts = Array.isArray(data.attachments) ? data.attachments : [];
        setAttachments(atts);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load record.");
      } finally {
        setLoading(false);
      }
    };
    // If selected looks incomplete, or to ensure fresh data
    if (!selected || !selected.title) run();
  }, [passedId]);

  const attachmentsToShow = useMemo(() => {
    const a = Array.isArray(attachments) ? attachments : [];
    return a.map((att, i) => {
      if (typeof att === "string")
        return {
          name: att.split("/").pop() || `Attachment ${i + 1}`,
          url: att,
        };
      if (att && typeof att === "object" && typeof att.file === "string") {
        return { name: att.file.split("/").pop(), url: att.file };
      }
      return { name: att?.name || `Attachment ${i + 1}`, url: att?.url };
    });
  }, [attachments]);

  // We will not pass sample patients; admin attendance page will fetch from backend

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
    <div className="h-screen w-full bg-gray flex flex-col overflow-auto">
      {/* Body */}
      <div className="w-full flex-1 py-6 px-6 md:px-10 flex flex-col gap-4 overflow-auto">
        <div>
          <h2 className="text-2xl font-semibold">
            Request Review - {record.id}
          </h2>
          {loading && (
            <div className="text-sm text-gray-600 mt-1">Loading…</div>
          )}
          {error && !loading && (
            <div className="text-sm text-red-600 mt-1">{error}</div>
          )}
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
              {status || "—"}
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
            state={{ screening: record }}
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
