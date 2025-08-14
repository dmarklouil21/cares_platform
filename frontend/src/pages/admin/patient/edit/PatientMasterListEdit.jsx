import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Modal component for confirmation
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

// Notification component for showing popup messages
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

const PatientMasterListEdit = () => {
  const location = useLocation();
  const patient = location.state?.patient || {};
  const navigate = useNavigate();

  const [form, setForm] = useState({
    patient_id: patient.patient_id || "",
    name: patient.name || "",
    last_name: patient.last_name || "",
    middle_name: patient.middle_name || "",
    suffix: patient.suffix || "",
    birthdate: patient.birthdate || "",
    sex: patient.sex || "Male",
    barangay: patient.barangay || "",
    lgu: patient.lgu || "",
    date_diagnosed: patient.date_diagnosed || "",
    diagnosis: patient.diagnosis || "",
    cancer_stage: patient.cancer_stage || "",
    cancer_site: patient.cancer_site || "",
  });

  const [historicalUpdates, setHistoricalUpdates] = useState(
    patient.historical_updates || []
  );
  const [newUpdate, setNewUpdate] = useState({
    date: "",
    note: "",
  });
  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);

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
    setTimeout(() => setNotification(""), 2000);
  };

  const removeHistoricalUpdate = (index) => {
    setHistoricalUpdates((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    // Add validation logic here if needed
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const updatedPatient = {
      ...form,
      historical_updates: historicalUpdates,
    };

    setModalText(
      "Are you sure you want to save changes to this patient record?"
    );
    setModalAction({ type: "save", data: updatedPatient });
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (modalAction?.type === "save") {
      // Print the updated data to console
      console.log("Updated patient data:", modalAction.data);

      // Show success notification
      setNotification("Patient record updated successfully!");
      setTimeout(() => {
        setNotification("");
        navigate("/Admin/patient/view/AdminPatientMasterListView", {
          state: { patient: modalAction.data },
        });
      }, 2000);
    }
    setModalOpen(false);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
  };

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
        <h1 className="text-md font-bold">Edit Patient Record</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-full w-full p-5 flex flex-col justify-between overflow-auto"
      >
        <div className="border border-black/15 p-3 bg-white rounded-sm mb-4">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Patient Information</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Column 1 */}
            <div className="space-y-3">
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
                  required
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
            to="/Admin/patient/AdminPatientMasterList"
            state={{ patient: patient }} // Pass the original patient data back
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

export default PatientMasterListEdit;
