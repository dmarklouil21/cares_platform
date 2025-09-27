import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LOAPrintTemplate from "../generate/LOAPrintTemplate";

import api from "src/api/axiosInstance";

const FALLBACK = {
  serialNo: "—",
  date: "—",
  providerName: "—",
  providerAddress: "—",
  patientName: "—",
  patientAddress: "—",
  age: "—",
  diagnosis: "—",
  procedure: "—",
  labRequest: "—",
  labResult: "—",
  schedule: "",
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

const Line = () => <hr className="my-3 border-gray-200" />;
const Row = ({ label, value }) => (
  <div className="flex items-start gap-4 py-1">
    <div className="w-56 shrink-0 text-gray-700 font-medium">{label}</div>
    <div className="text-gray-900">{value}</div>
  </div>
);

const fmtDDMMYYYY = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const PostTreatmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({})
  const [status, setStatus] = useState("");

  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    tone: "primary",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/post-treatment/view/${id}/`);
        console.log("Response Data: ", data);
        setData(data);
        setStatus(data.status);
      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const openAccept = () =>
    setConfirm({
      open: true,
      action: "accept",
      tone: "primary",
      title: "Accept this request?",
      body: `This will mark LOA ${data.serialNo} for ${data.patientName} as Approved.`,
    });

  const openReject = () =>
    setConfirm({
      open: true,
      action: "reject",
      tone: "danger",
      title: "Reject this request?",
      body: `This will reject LOA ${data.serialNo} for ${data.patientName}.`,
    });

  const closeConfirm = () =>
    setConfirm({ open: false, action: null, tone: "primary" });
  const handleConfirm = () => {
    setToast(
      confirm.action === "accept" ? "Request approved." : "Request rejected."
    );
    closeConfirm();
  };

  const loaData = {
    patient: {
      full_name: data.patient?.full_name,
      city: data.patient?.city,
      age: data.patient?.age,
      diagnosis: [{ }],
    },
    procedure_name: data.procedure_name,
  };

  const handleGenerate = () => window.print();

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

      <LOAPrintTemplate loaData={loaData} />

      <div className="w-full flex-1 flex flex-col gap-5 p-5 overflow-auto">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-xl font-semibold">Treatment Info</h2>
          <button onClick={() => navigate(-1)}>
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </button>
        </div>

        <div className="bg-white rounded-md shadow border border-black/10 p-6 print:hidden">
          <h3 className="text-md font-semibold mb-3">
            Request Post-Treatment Labs
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-600">
              Viewing ID: <span className="font-mono">{id}</span>
            </div>
            <button
              onClick={handleGenerate}
              className="px-3.5 py-1 text-sm cursor-pointer text-white rounded-md bg-primary hover:opacity-90 print:hidden"
            >
              Generate
            </button>
          </div>
          <Line />
          <Row label="Diagnosis/Impression" value={data.patient?.diagnosis[0]?.diagnosis || "NA"} />
          <Row label="Procedure" value={data.procedure_name} />
          <Row label="Laboratory Request" value={""} />
          <Row label="Laboratory Result" value={""} />
          <Row
            label="Schedule (dd/mm/yyyy)"
            value={fmtDDMMYYYY(data.created_at)}
          />
        </div>

        {/* <div className="bg-white rounded-md shadow border border-black/10 p-6 print:hidden">
          <h3 className="text-lg font-semibold mb-2">LOA GENERATION</h3>
          <Line />
          <Row label="Serial No." value={data.serialNo} />
          <Row label="Date" value={data.date} />
          <Row label="Service Provider/Lab Name" value={data.providerName} />
          <Row
            label="Service Provider/Lab Address"
            value={data.providerAddress}
          />
          <Row label="Patient Name" value={data.patientName} />
          <Row label="Patient Address" value={data.patientAddress} />
          <Row label="Age" value={`${data.age} years old`} />
          <Row label="Diagnosis" value={data.diagnosis} />
          <Row label="Procedure" value={data.procedure} />
          <Row label="Prepared by" value={data.preparedBy} />
          <Row label="Approved by" value={data.approvedBy} />
        </div> */}

        <div className="flex justify-around print:hidden">
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

export default PostTreatmentView;
