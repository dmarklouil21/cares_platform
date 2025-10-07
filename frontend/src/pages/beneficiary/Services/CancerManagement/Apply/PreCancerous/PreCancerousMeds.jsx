import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitPreCancerousMeds } from "src/api/precancerous";

// Reusable confirmation modal
function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-base font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/70"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-400"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Top-center notification (auto-hides; no close button)
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

const initialForm = {
  // Header card fields
  lgu_name: "",
  date: "",
  contact_number: "",
  prepared_by: "",
  approved_by: "",
  // Patient fields (No. & Patient No. removed)
  last_name: "",
  first_name: "",
  middle_initial: "",
  date_of_birth: "",
  interpretation_of_result: "",
};

const PreCancerousMeds = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "submit" | "back"
  const [notification, setNotification] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const openSubmit = () => {
    setModalType("submit");
    setModalOpen(true);
  };

  const openBack = () => {
    setModalType("back");
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (modalType === "submit") {
      try {
        setSubmitting(true);
        setErrorMsg("");
        await submitPreCancerousMeds(form);
        setForm(initialForm);
        setNotification("Submitted successfully.");
        setTimeout(() => setNotification(""), 3000);
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.non_field_errors?.[0] ||
          "Submission failed. Please try again.";
        setErrorMsg(msg);
        setNotification(msg);
        setTimeout(() => setNotification(""), 4000);
      } finally {
        setSubmitting(false);
      }
    } else if (modalType === "back") {
      navigate("/Beneficiary/services/cancer-management");
    }
    setModalOpen(false);
    setModalType(null);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setModalType(null);
  };

  const isSubmitDisabled =
    !form.lgu_name ||
    !form.date ||
    !form.prepared_by ||
    !form.approved_by ||
    !form.last_name ||
    !form.first_name ||
    !form.date_of_birth ||
    !form.interpretation_of_result;

  return (
    <div className="w-full h-screen bg-gray overflow-auto">
      {/* Modals & Notifications */}
      <ConfirmationModal
        open={modalOpen}
        text={
          modalType === "submit"
            ? "Submit this Request Pre-Cancerous Meds form?"
            : "Leave this page? Unsaved changes will be lost."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Notification message={notification} />

      {/* Content */}
      <div className="py-6 p-5 md:px-10 bg-gray">
        <h2 className="text-xl font-semibold mb-6">
          Cancer Management & Treatment Assistance
        </h2>

        <div className="flex flex-col gap-7 w-full bg-white rounded-2xl py-10 p-5 md:px-8">
          <h3 className="text-2xl font-bold text-secondary">
            Pre-cancerous Meds
          </h3>
          <p className="text-gray2 mb-2">
            Please complete the fields below. Fields marked with * are required.
          </p>

          {/* Card: Request Pre-Cancerous Meds */}
          <div className="rounded-md border border-black/10 overflow-hidden">
            <div className="border-b border-black/10 px-5 py-3">
              <h4 className="text-lg font-semibold">
                Request Pre-Cancerous Meds
              </h4>
            </div>

            {/* Header Fields */}
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <label className="flex flex-col gap-1">
                <span className="font-medium">LGU Name *</span>
                <input
                  name="lgu_name"
                  value={form.lgu_name}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                  placeholder="e.g., City of Cebu"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium">Date *</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium">Contact Number</span>
                <input
                  name="contact_number"
                  value={form.contact_number}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                  placeholder="e.g., 032-123-4567"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium">Prepared by *</span>
                <input
                  name="prepared_by"
                  value={form.prepared_by}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                  placeholder="Enter preparer's name"
                />
              </label>

              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="font-medium">Approved by *</span>
                <input
                  name="approved_by"
                  value={form.approved_by}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                  placeholder="Enter approver's name"
                />
              </label>
            </div>

            {/* Patient Info Section */}
            <div className="border-t border-black/10 px-5 py-3 bg-gray/10">
              <h5 className="font-semibold text-sm">Patient Information</h5>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <span className="font-medium">Last Name *</span>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                  placeholder="Enter last name"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium">First Name *</span>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                  placeholder="Enter first name"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium">Middle Initial</span>
                <input
                  name="middle_initial"
                  value={form.middle_initial}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                  placeholder="e.g., A."
                  maxLength={2}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-medium">Date of Birth *</span>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="font-medium">Interpretation of Result *</span>
                <select
                  name="interpretation_of_result"
                  value={form.interpretation_of_result}
                  onChange={onChange}
                  className="border rounded-md px-3 py-2 bg-white"
                >
                  <option value="">Select…</option>
                  <option>Negative</option>
                  <option>ASC-US</option>
                  <option>HPV Positive</option>
                  <option>Unsatisfactory</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-around gap-3 pt-2">
            <Link
              to="/Beneficiary/services/cancer-management"
              className="text-center bg-white text-black w-[35%] py-2 px-6 border border-black/30 hover:border-black/50 rounded-md"
            >
              Back
            </Link>
            <button
              onClick={openSubmit}
              disabled={isSubmitDisabled || submitting}
              className={`text-center font-bold w-[35%] py-2 px-6 rounded-md ${
                isSubmitDisabled || submitting
                  ? "bg-primary/40 text-white cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/80"
              }`}
              title={
                isSubmitDisabled
                  ? "Please fill all required fields"
                  : submitting
                  ? "Submitting..."
                  : ""
              }
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* <div className="h-16 bg-secondary" /> */}
    </div>
  );
};

export default PreCancerousMeds;
