// src/pages/treatment/BeneficiaryPostTreatmentApply.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

// After success, we'll go here
const SUCCESS_PATH = "/beneficiary/services/cancer-management";

const BeneficiaryPostTreatmentApply = () => {
  const navigate = useNavigate();

  // ----- Applicant (beneficiary) info -----
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");

  // ----- LOA-like details (mirrors Admin fields) -----
  const [date, setDate] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [procedure, setProcedure] = useState("");
  const [preparedBy, setPreparedBy] = useState(""); // UI-only
  const [approvedBy, setApprovedBy] = useState(""); // UI-only

  // ----- Post-treatment lab request -----
  const [labRequest, setLabRequest] = useState("");
  const [labResult, setLabResult] = useState(""); // usually "Pending" from user
  const [schedule, setSchedule] = useState("");

  // ----- UX -----
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState({
    type: "success",
    title: "Success!",
    message: "Request created.",
  });

  // NEW: where to navigate after closing the success notification
  const [afterClosePath, setAfterClosePath] = useState(null);

  // Prefill today for date & schedule
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    if (!date) setDate(`${yyyy}-${mm}-${dd}`);
    if (!schedule) setSchedule(`${yyyy}-${mm}-${dd}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValid = useMemo(() => {
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // email optional but must be valid if filled
    return (
      fullName.trim() &&
      age &&
      address.trim() &&
      date &&
      providerName.trim() &&
      diagnosis.trim() &&
      procedure.trim() &&
      schedule &&
      emailOk
    );
  }, [
    fullName,
    age,
    address,
    date,
    providerName,
    diagnosis,
    procedure,
    schedule,
    email,
  ]);

  const validateOrNotify = () => {
    if (isValid) return true;

    const msg = !fullName.trim()
      ? "Please enter your full name."
      : !age
      ? "Please enter your age."
      : !address.trim()
      ? "Please enter your address."
      : !providerName.trim()
      ? "Please enter Service Provider/Lab Name."
      : !diagnosis.trim()
      ? "Please enter Diagnosis."
      : !procedure.trim()
      ? "Please enter Procedure."
      : !date
      ? "Please set Date."
      : !schedule
      ? "Please set Schedule."
      : "Please complete all required fields.";

    setNotifyInfo({ type: "info", title: "Incomplete", message: msg });
    setAfterClosePath(null); // do NOT navigate on info modal
    setNotifyOpen(true);
    return false;
  };

  const handleSubmit = () => setConfirmOpen(true);

  const doSubmit = () => {
    if (!validateOrNotify()) return;
    setConfirmOpen(false);
    setLoading(true);

    // UI-only payload
    const payload = {
      fullName,
      email,
      age: Number(age),
      address,
      date,
      providerName,
      providerAddress,
      diagnosis,
      procedure,
      labRequest,
      labResult,
      schedule,
      preparedBy,
      approvedBy,
      status: "Pending",
    };
    console.log("[BeneficiaryPostTreatmentApply] mock payload:", payload);

    setTimeout(() => {
      setLoading(false);
      // ✅ Show success on THIS page first, then navigate after OK
      setNotifyInfo({
        type: "success",
        title: "Success!",
        message: "Your post-treatment request was submitted successfully.",
      });
      setAfterClosePath(SUCCESS_PATH); // navigate after closing the success modal
      setNotifyOpen(true);
    }, 600);
  };

  return (
    <>
      <ConfirmationModal
        open={confirmOpen}
        title="Submit this post-treatment request?"
        desc="This is a UI-only flow; no data will be saved to the server."
        onConfirm={doSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
      <NotificationModal
        show={notifyOpen}
        type={notifyInfo.type}
        title={notifyInfo.title}
        message={notifyInfo.message}
        onClose={() => {
          setNotifyOpen(false);
          if (afterClosePath) {
            const to = afterClosePath;
            setAfterClosePath(null);
            navigate(to);
          }
        }}
      />
      <LoadingModal open={loading} text="Submitting your request..." />

      <div className="h-screen w-full flex p-5 gap-4 flex-col justify-start items-center bg-gray overflow-auto">
        {/* Header */}
        <div className="px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">
            Apply: Post-Treatment Laboratory Tests
          </h1>
          <Link to={SUCCESS_PATH}>
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </Link>
        </div>

        {/* Applicant Details */}
        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3">
            <h2 className="text-lg font-semibold">Your Details</h2>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Ana Dela Cruz"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., ana@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 41"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Cebu City"
              />
            </div>
          </div>
        </div>

        {/* LOA Generation (mirrors Admin) */}
        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">LOA Details</h2>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Service Provider/Lab Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g., CHONG HUA HOSPITAL - MANDAUE"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Provider Address
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={providerAddress}
                onChange={(e) => setProviderAddress(e.target.value)}
                placeholder="e.g., Cebu City"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g., Hypertension"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Procedure <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                placeholder="e.g., Basic Metabolic Panel"
              />
            </div>

            {/* UI-only extras to mirror admin page (not required) */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Prepared by
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="e.g., Nurse Jane Rivera"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Approved by
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="e.g., Dr. Ramon Cruz"
              />
            </div>
          </div>
        </div>

        {/* Request Post-Treatment Labs */}
        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3">
            <h2 className="text-lg font-semibold">
              Request Post-Treatment Labs
            </h2>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Laboratory Request
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={labRequest}
                onChange={(e) => setLabRequest(e.target.value)}
                placeholder="e.g., BMP"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Laboratory Result
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={labResult}
                onChange={(e) => setLabResult(e.target.value)}
                placeholder="e.g., Pending / To follow"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Schedule <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col md:flex-row gap-3 justify-between">
          <Link
            className="text-center bg-white text-black py-2 w-full md:w-[30%] border border-black/15 hover:border-black rounded-md"
            to={SUCCESS_PATH}
          >
            BACK
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`text-center font-bold text-white py-2 w-full md:w-[30%] rounded-md shadow ${
              !isValid || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary hover:opacity-90"
            }`}
            title={!isValid ? "Complete required fields" : ""}
          >
            {loading ? "SUBMITTING..." : "SUBMIT REQUEST"}
          </button>
        </div>
      </div>
    </>
  );
};

export default BeneficiaryPostTreatmentApply;
