import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-xl font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/50"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  rows,
  error,
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700">{label}</label>
      {rows ? (
        <textarea
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        />
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

const HomeVisitAdd = () => {
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    diagnosis: "",
    date: "",
    time: "",
    purpose: "",
    findings: "",
    recommendations: "",
    preparedBy: "",
    approvedBy: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const navigate = useNavigate();

  const required = ["patientId", "patientName", "diagnosis", "date", "time"];
  const validate = () => {
    const e = {};
    required.forEach((k) => {
      if (!String(form[k] || "").trim()) e[k] = "Required";
    });
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setModalText("Add this home visit?");
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    setModalOpen(false);
    setNotification("Home visit added");
    setTimeout(() => {
      setNotification("");
      navigate("/admin/survivorship");
    }, 1500);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalText("");
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray overflow-auto">
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      {notification && (
        <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
          <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
            <img
              src="/images/logo_white_notxt.png"
              alt="Rafi Logo"
              className="h-[25px]"
            />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Add home visit</h1>
      </div> */}

      <form
        onSubmit={handleSubmit}
        className="h-full w-full p-5 flex flex-col gap-5 overflow-auto"
      >
        <div className="border border-black/15 p-5 bg-white rounded-sm">
          <div className=" rounded-sm py-3  w-full flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Home Visit Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Patient No."
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              placeholder="e.g., S-10231"
              error={errors.patientId}
            />
            <Input
              label="Patient Name"
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              placeholder="e.g., Lara Mendoza"
              error={errors.patientName}
            />
            <Input
              label="Diagnosis"
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              placeholder="e.g., Breast CA post-op"
              error={errors.diagnosis}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                name="date"
                value={form.date}
                onChange={handleChange}
                type="date"
                error={errors.date}
              />
              <Input
                label="Time"
                name="time"
                value={form.time}
                onChange={handleChange}
                type="time"
                error={errors.time}
              />
            </div>
            <Input
              label="Prepared by"
              name="preparedBy"
              value={form.preparedBy}
              onChange={handleChange}
              placeholder="e.g., Nurse Alma Cruz"
            />
            <Input
              label="Approved by"
              name="approvedBy"
              value={form.approvedBy}
              onChange={handleChange}
              placeholder="e.g., Dr. Thea Ramos"
            />
          </div>
        </div>

        <div className="border border-black/15 p-5 bg-white rounded-sm">
          <div className=" rounded-sm py-3  w-full flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Narrative</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Purpose of Visit"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Enter purpose"
              rows={3}
            />
            <Input
              label="Findings/Observation"
              name="findings"
              value={form.findings}
              onChange={handleChange}
              placeholder="Enter findings"
              rows={4}
            />
            <Input
              label="Recommendations"
              name="recommendations"
              value={form.recommendations}
              onChange={handleChange}
              placeholder="Enter recommendations"
              rows={3}
            />
          </div>
        </div>

        <div className="w-full flex justify-around pb-6">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
            to="/admin/survivorship"
          >
            CANCEL
          </Link>
          <button
            type="submit"
            className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            ADD
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomeVisitAdd;
