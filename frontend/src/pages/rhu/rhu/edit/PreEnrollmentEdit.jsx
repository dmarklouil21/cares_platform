import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";

/* ──────────────────────────────────────────────────────────────
   Simple Confirmation Modal
────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────
   Simple Top Notification (toast-like)
────────────────────────────────────────────────────────────── */
function Notification({ message, onClose }) {
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

/* ──────────────────────────────────────────────────────────────
   Utilities
────────────────────────────────────────────────────────────── */
function splitNameParts(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0)
    return { first: "", middle: "", last: "", suffix: "" };

  const suffixes = new Set(["Jr", "Jr.", "Sr", "Sr.", "III", "IV", "V"]);
  let suffix = "";
  let arr = [...parts];

  // pull suffix if present at the end
  if (arr.length > 1 && suffixes.has(arr[arr.length - 1])) {
    suffix = arr.pop();
  }

  const first = arr[0] || "";
  const last = arr.length > 1 ? arr[arr.length - 1] : "";
  const middle = arr.length > 2 ? arr.slice(1, -1).join(" ") : "";

  return { first, middle, last, suffix };
}

/* ──────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────── */
const RhuPreEnrollmentEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { preenrollment_id: idParam } = useParams();

  // Sample detailed data (fallback if state is missing/incomplete)
  const samplePatients = [
    {
      preenrollment_id: "PE-001",
      patient_id: "PT-001",
      name: "Juan",
      middle_name: "Reyes",
      last_name: "Dela Cruz",
      suffix: "Jr.",
      birthdate: "1990-05-15",
      sex: "Male",
      barangay: "Ermita",
      lgu: "Manila",
      date_diagnosed: "2022-01-10",
      diagnosis: "Lung Cancer",
      cancer_stage: "III",
      cancer_site: "Left Lung",
      historical_updates: [
        { date: "2022-01-10", note: "Initial diagnosis confirmed" },
        { date: "2022-02-15", note: "Started chemotherapy" },
        { date: "2022-04-20", note: "First follow-up checkup" },
      ],
    },
    {
      preenrollment_id: "PE-002",
      patient_id: "PT-002",
      name: "Maria",
      middle_name: "Lopez",
      last_name: "Santos",
      birthdate: "1985-08-22",
      sex: "Female",
      barangay: "Kamuning",
      lgu: "Quezon City",
      date_diagnosed: "2021-11-05",
      diagnosis: "Breast Cancer",
      cancer_stage: "II",
      cancer_site: "Right Breast",
      historical_updates: [
        { date: "2021-11-05", note: "Initial mammogram results" },
        { date: "2021-11-20", note: "Biopsy confirmed malignancy" },
      ],
    },
    {
      preenrollment_id: "PE-003",
      patient_id: "PT-003",
      name: "Pedro",
      middle_name: "Martinez",
      last_name: "Gonzales",
      suffix: "Sr.",
      birthdate: "1978-11-30",
      sex: "Male",
      barangay: "San Antonio",
      lgu: "Makati",
      date_diagnosed: "2023-02-18",
      diagnosis: "Colon Cancer",
      cancer_stage: "IV",
      cancer_site: "Colon",
      historical_updates: [
        { date: "2023-02-18", note: "Colonoscopy results" },
        { date: "2023-03-05", note: "Started targeted therapy" },
      ],
    },
    {
      preenrollment_id: "PE-004",
      patient_id: "PT-004",
      name: "Ana",
      middle_name: "Diaz",
      last_name: "Ramos",
      birthdate: "1995-03-10",
      sex: "Female",
      barangay: "San Miguel",
      lgu: "Pasig",
      date_diagnosed: "2022-09-12",
      diagnosis: "Leukemia",
      cancer_stage: "I",
      cancer_site: "Blood",
      historical_updates: [
        { date: "2022-09-12", note: "Blood test results" },
        { date: "2022-10-01", note: "Bone marrow biopsy" },
        { date: "2022-10-15", note: "Started treatment plan" },
      ],
    },
  ];

  // Merge: sample match (by idParam) overlaid by any state patient
  const basePatient = useMemo(() => {
    const statePatient = location.state?.patient;
    const effectiveId =
      idParam || statePatient?.preenrollment_id || statePatient?.patient_id;

    const sampleMatch =
      effectiveId &&
      samplePatients.find(
        (p) =>
          p.preenrollment_id === effectiveId || p.patient_id === effectiveId
      );

    return { ...(sampleMatch || {}), ...(statePatient || {}) };
  }, [idParam, location.state?.patient]);

  // If only full_name provided, parse to fill name fields
  const derived = useMemo(
    () => splitNameParts(basePatient.full_name || ""),
    [basePatient.full_name]
  );

  const [form, setForm] = useState({
    preenrollment_id: basePatient.preenrollment_id || idParam || "",
    patient_id: basePatient.patient_id || "",
    name: basePatient.name || derived.first || "",
    middle_name: basePatient.middle_name || derived.middle || "",
    last_name: basePatient.last_name || derived.last || "",
    suffix: basePatient.suffix || derived.suffix || "",
    birthdate: basePatient.birthdate || "",
    sex: basePatient.sex || "Male",
    barangay: basePatient.barangay || "",
    lgu: basePatient.lgu || "",
    date_diagnosed: basePatient.date_diagnosed || "",
    diagnosis: basePatient.diagnosis || "",
    cancer_stage: basePatient.cancer_stage || "",
    cancer_site: basePatient.cancer_site || "",
  });

  const [historicalUpdates, setHistoricalUpdates] = useState(
    basePatient.historical_updates || []
  );
  const [newUpdate, setNewUpdate] = useState({ date: "", note: "" });
  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);

  /* ─────────────────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setNewUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const addHistoricalUpdate = () => {
    if (!newUpdate.date || !newUpdate.note) {
      setNotification("Please fill both date and note fields");
      setTimeout(() => setNotification(""), 2000);
      return;
    }
    setHistoricalUpdates((prev) => [...prev, newUpdate]);
    setNewUpdate({ date: "", note: "" });
    setNotification("Update added successfully");
    setTimeout(() => setNotification(""), 1500);
  };

  const removeHistoricalUpdate = (index) => {
    setHistoricalUpdates((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    // Minimal sample validation
    if (!form.preenrollment_id) return false;
    if (!form.name || !form.last_name) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setNotification("Please complete required fields.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }

    const updatedPatient = {
      ...basePatient, // keep any fields we didn't expose
      ...form,
      full_name:
        `${form.name} ${
          form.middle_name ? form.middle_name.charAt(0) + "." : ""
        } ${form.last_name}`.trim() + (form.suffix ? ` ${form.suffix}` : ""),
      historical_updates: historicalUpdates,
    };

    setModalText("Are you sure you want to save changes to this record?");
    setModalAction({ type: "save", data: updatedPatient });
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (modalAction?.type === "save") {
      // SAMPLE-ONLY: no API call; just show a toast and navigate to the View page
      console.log(
        "Updated pre-enrollment data (sample only):",
        modalAction.data
      );
      setNotification("Pre-enrollment record updated successfully!");
      setTimeout(() => {
        setNotification("");
        navigate(
          `/Rhu/rhu/view/RhuPreEnrollmentView/${encodeURIComponent(
            modalAction.data.preenrollment_id
          )}`,
          { state: { patient: modalAction.data } }
        );
      }, 1200);
    }
    setModalOpen(false);
  };

  const handleModalCancel = () => setModalOpen(false);

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Edit Pre-Enrollment Record</h1>
        <div className="text-white font-semibold">
          Pre-Enroll ID: {form.preenrollment_id || "N/A"}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-full w-full p-5 flex flex-col justify-between overflow-auto"
      >
        {/* Patient Information */}
        <div className="border border-black/15 p-3 bg-white rounded-sm mb-4">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Patient Information</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Column 1 */}
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">
                  Pre-Enrollment ID:
                </label>
                <input
                  type="text"
                  name="preenrollment_id"
                  value={form.preenrollment_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Patient ID:</label>
                <input
                  type="text"
                  name="patient_id"
                  value={form.patient_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">First Name:</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Middle Name:</label>
                <input
                  type="text"
                  name="middle_name"
                  value={form.middle_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Suffix:</label>
                <input
                  type="text"
                  name="suffix"
                  value={form.suffix}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Birthdate:</label>
                <input
                  type="date"
                  name="birthdate"
                  value={form.birthdate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">Last Name:</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Sex:</label>
                <select
                  name="sex"
                  value={form.sex}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Barangay:</label>
                <input
                  type="text"
                  name="barangay"
                  value={form.barangay}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">LGU:</label>
                <input
                  type="text"
                  name="lgu"
                  value={form.lgu}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Date Diagnosed:
                </label>
                <input
                  type="date"
                  name="date_diagnosed"
                  value={form.date_diagnosed}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Full width fields */}
            <div className="col-span-2 space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">Diagnosis:</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Cancer Stage:
                </label>
                <input
                  type="text"
                  name="cancer_stage"
                  value={form.cancer_stage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Cancer Site:</label>
                <input
                  type="text"
                  name="cancer_site"
                  value={form.cancer_site}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Historical Updates Section */}
        <div className="border border-black/15 p-3 bg-white rounded-sm mb-4">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Historical Updates</h1>
          </div>

          <div className="p-4 space-y-4">
            {/* Add new update form */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Date:</label>
                <input
                  type="date"
                  name="date"
                  value={newUpdate.date}
                  onChange={handleUpdateChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">Note:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="note"
                    value={newUpdate.note}
                    onChange={handleUpdateChange}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none"
                    placeholder="Enter update note"
                  />
                  <button
                    type="button"
                    onClick={addHistoricalUpdate}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-lightblue"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Updates list */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Previous Updates:</h3>
              {historicalUpdates.length === 0 ? (
                <p className="text-gray-500">No updates recorded</p>
              ) : (
                <ul className="space-y-2">
                  {historicalUpdates.map((update, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <div>
                        <span className="font-medium">{update.date}</span>:{" "}
                        {update.note}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHistoricalUpdate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex justify-around">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
            to="/Rhu/rhu/pre-enrollment"
            state={{ patient: basePatient }}
          >
            CANCEL
          </Link>
          <button
            type="submit"
            className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            SAVE CHANGES
          </button>
        </div>
      </form>
    </div>
  );
};

export default RhuPreEnrollmentEdit;
