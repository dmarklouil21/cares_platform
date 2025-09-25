import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

const SAMPLE_DETAILS = {
  "HV-101": {
    patientName: "Lara Mendoza",
    diagnosis: "Breast CA post-op",
    date: "2025-10-05",
    time: "09:10 AM",
    purpose: "Wound assessment and pain management",
    findings: "Incision clean and dry, VAS 3/10, afebrile, no erythema",
    recommendations:
      "Continue dressings q48h, Paracetamol 500 mg PRN, review in 1 week",
    preparedBy: "Nurse Alma Cruz",
    approvedBy: "Dr. Thea Ramos",
  },
  "HV-102": {
    patientName: "Rico Balagtas",
    diagnosis: "Colon CA on chemo",
    date: "2025-10-02",
    time: "02:20 PM",
    purpose: "Toxicity monitoring and hydration counseling",
    findings: "Mild nausea, no mucositis, BP 118/76, HR 78",
    recommendations:
      "Small frequent meals, Ondansetron PRN, encourage fluids 2L/day",
    preparedBy: "Nurse Joel Tan",
    approvedBy: "Dr. Allan Sy",
  },
  "HV-103": {
    patientName: "Mika Salvador",
    diagnosis: "Thyroid nodules",
    date: "2025-09-28",
    time: "11:00 AM",
    purpose: "Medication adherence check and education",
    findings: "On Levothyroxine, no palpitations, weight stable",
    recommendations: "Continue current dose, TSH repeat in 8 weeks",
    preparedBy: "Nurse Ria Gomez",
    approvedBy: "Dr. Benjie Yu",
  },
  "HV-104": {
    patientName: "Jomar Uy",
    diagnosis: "Cervical lymphadenopathy",
    date: "2025-10-06",
    time: "04:35 PM",
    purpose: "Symptom review and referral coordination",
    findings: "Tender right cervical nodes, afebrile, mild dysphagia",
    recommendations: "Warm compress, NSAID short course, ENT consult booked",
    preparedBy: "Nurse Kaye Lim",
    approvedBy: "Dr. Paula Cruz",
  },
};

const FALLBACK = {
  patientName: "—",
  diagnosis: "—",
  date: "—",
  time: "—",
  purpose: "—",
  findings: "—",
  recommendations: "—",
  preparedBy: "—",
  approvedBy: "—",
};

const Toast = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray2 text-white px-4 py-2 rounded shadow flex items-center gap-2">
        <img
          src="/images/logo_white_notxt.png"
          alt="logo"
          className="h-[20px]"
        />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
};

const ConfirmModal = ({
  open,
  title,
  body,
  onCancel,
  onConfirm,
  confirmTone = "primary",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white w-[92%] max-w-md rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-700 mb-4">{body}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded text-white ${
              confirmTone === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary/80"
            }`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-start gap-4 py-1">
    <div className="w-40 shrink-0 text-gray-700 font-medium">{label}</div>
    <div className="text-gray-900">{value}</div>
  </div>
);

const SectionDivider = () => <hr className="my-4 border-gray-200" />;

const HomeVisitView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    title: "",
    body: "",
    tone: "primary",
  });
  const data = SAMPLE_DETAILS[id] || FALLBACK;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const openAccept = () =>
    setConfirm({
      open: true,
      action: "accept",
      title: "Accept this request?",
      body: `This will mark the request for ${data.patientName} as Approved.`,
      tone: "primary",
    });

  const openReject = () =>
    setConfirm({
      open: true,
      action: "reject",
      title: "Reject this request?",
      body: `This will reject the request for ${data.patientName}.`,
      tone: "danger",
    });

  const closeConfirm = () =>
    setConfirm({
      open: false,
      action: null,
      title: "",
      body: "",
      tone: "primary",
    });

  const handleConfirm = () => {
    if (confirm.action === "accept") setToast("Request approved.");
    if (confirm.action === "reject") setToast("Request rejected.");
    closeConfirm();
  };

  const generatePdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const M = 48;
    let y = 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("PATIENT HOME VISIT REPORT", width / 2, y, { align: "center" });
    y += 32;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const drawLabelLine = (label, value) => {
      const text = `${label}:`;
      doc.text(text, M, y);
      const startX = M + doc.getTextWidth(text) + 6;
      const endX = width - M;
      doc.setDrawColor(180);
      doc.line(startX, y + 3, endX, y + 3);
      if (value && value !== "—") {
        doc.setTextColor(20);
        doc.text(String(value), startX + 4, y);
        doc.setTextColor(0);
      }
      y += 22;
    };
    drawLabelLine("Name of Patient", data.patientName);
    drawLabelLine("Current Cancer Diagnosis", data.diagnosis);
    drawLabelLine("Date & Time of Visit", `${data.date} ${data.time}`);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Purpose of Visit:", M, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    const bullets = ["Goal setting and education", "Medication support"];
    const maxW = width - M * 2 - 16;
    bullets.forEach((b) => {
      const wrapped = doc.splitTextToSize(b, maxW);
      doc.circle(M + 3, y - 3, 1.5, "F");
      doc.text(wrapped, M + 12, y);
      const h = doc.getTextDimensions(wrapped).h;
      y += h + 8;
    });
    doc.setDrawColor(200);
    doc.line(M, y, width - M, y);
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Findings/ Observations:", M, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    const findingsWrapped = doc.splitTextToSize(
      data.findings || "",
      width - M * 2
    );
    doc.text(findingsWrapped, M, y);
    y += doc.getTextDimensions(findingsWrapped).h + 6;
    const drawRuled = (count, gap = 16) => {
      for (let i = 0; i < count; i++) {
        doc.setDrawColor(210);
        doc.line(M, y, width - M, y);
        y += gap;
      }
    };
    drawRuled(6);
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Recommendations:", M, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    const recoWrapped = doc.splitTextToSize(
      data.recommendations || "",
      width - M * 2
    );
    doc.text(recoWrapped, M, y);
    y += doc.getTextDimensions(recoWrapped).h + 6;
    drawRuled(3);
    y += 24;
    doc.setDrawColor(220, 38, 38);
    doc.line(M, y, M + 200, y);
    doc.line(width - M - 200, y, width - M, y);
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Prepared by:", M, y + 18);
    doc.text("Approved by:", width - M - 200, y + 18);
    doc.setFontSize(10);
    doc.text("EJACC Representative", M, y + 34);
    doc.save(`PatientHomeVisit_${id}.pdf`);
  };

  return (
    <div className="h-screen w-full bg-gray flex flex-col overflow-auto">
      <Toast message={toast} />
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        body={confirm.body}
        confirmTone={confirm.tone}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />
      {/* <div className="bg-white h-[64px] px-5 w-full flex items-center justify-between">
        <h1 className="text-md font-bold">Admin</h1>
      </div> */}
      <div className="w-full h-fit flex flex-col gap-5 p-5 overflow-auto">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-xl font-semibold">Patient Home Visit Report</h2>
          <button onClick={() => navigate(-1)}>
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </button>
        </div>
        <div className="bg-white rounded-md shadow border border-black/10 p-6">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-600">
              Viewing ID: <span className="font-mono">{id}</span>
            </div>
            <button
              onClick={generatePdf}
              className="px-3.5 py-1 text-sm cursor-pointer text-white rounded-md bg-primary hover:opacity-90"
            >
              Generate
            </button>
          </div>
          <Row label="Patient Name" value={data.patientName} />
          <Row label="Diagnosis" value={data.diagnosis} />
          <Row label="Date" value={data.date} />
          <Row label="Time" value={data.time} />
          <SectionDivider />
          <Row label="Purpose" value={data.purpose} />
          <Row label="Findings/Observation" value={data.findings} />
          <Row label="Recommendations" value={data.recommendations} />
          <Row label="Prepared by" value={data.preparedBy} />
          <Row label="Approved by" value={data.approvedBy} />
        </div>
        <div className="flex justify-around">
          <button
            onClick={openAccept}
            className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90"
          >
            Accept
          </button>
          <button
            onClick={openReject}
            className="py-2 w-[30%] bg-red-500 rounded-md text-white hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeVisitView;
