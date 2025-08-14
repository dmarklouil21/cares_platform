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

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const PatientMasterListAdd = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
    birthdate: "",
    sex: "",
    barangay: "",
    lgu: "",
    date_diagnosed: "",
    diagnosis: "",
    cancer_stage: "",
    cancer_site: "",
  });

  const [historicalUpdates, setHistoricalUpdates] = useState([
    {
      update_date: "",
      notes: "",
    },
  ]);

  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.first_name.trim())
      newErrors.first_name = "First name is required.";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!form.birthdate) newErrors.birthdate = "Birthdate is required.";
    if (!form.sex) newErrors.sex = "Sex is required.";
    if (!form.barangay) newErrors.barangay = "Barangay is required.";
    if (!form.lgu) newErrors.lgu = "LGU is required.";
    if (!form.date_diagnosed)
      newErrors.date_diagnosed = "Date diagnosed is required.";
    if (!form.diagnosis) newErrors.diagnosis = "Diagnosis is required.";
    if (!form.cancer_stage)
      newErrors.cancer_stage = "Cancer stage is required.";
    if (!form.cancer_site) newErrors.cancer_site = "Cancer site is required.";

    // Validate historical updates
    historicalUpdates.forEach((update, index) => {
      if (!update.update_date)
        newErrors[`update_date_${index}`] = "Update date is required.";
      if (!update.notes.trim())
        newErrors[`notes_${index}`] = "Notes are required.";
    });

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleHistoricalUpdateChange = (index, e) => {
    const { name, value } = e.target;
    const updatedUpdates = [...historicalUpdates];
    updatedUpdates[index] = {
      ...updatedUpdates[index],
      [name]: value,
    };
    setHistoricalUpdates(updatedUpdates);
    setErrors((prev) => ({ ...prev, [`${name}_${index}`]: undefined }));
  };

  const addHistoricalUpdate = () => {
    setHistoricalUpdates([
      ...historicalUpdates,
      {
        update_date: "",
        notes: "",
      },
    ]);
  };

  const removeHistoricalUpdate = (index) => {
    if (historicalUpdates.length > 1) {
      const updatedUpdates = historicalUpdates.filter((_, i) => i !== index);
      setHistoricalUpdates(updatedUpdates);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setModalText("Are you sure you want to add this data?");
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);
    const completeData = {
      ...form,
      historical_updates: historicalUpdates,
    };
    console.log("Complete form data to be submitted:", completeData);
    setNotification("Data added successfully!");
    setTimeout(() => {
      setNotification("");
      navigate("/Admin/patient/AdminPatientMasterList");
    }, 2000);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalText("");
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
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

      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Add Patient</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-full w-full p-5 flex flex-col justify-between overflow-auto"
      >
        <div className="space-y-4">
          {/* Basic Information Section */}
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
              <h1 className="text-md font-bold">Basic Information</h1>
            </div>
            <div className="flex flex-row gap-8 p-4">
              {/* First Column */}
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label className="block text-gray-700 mb-1">
                    First Name:
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  />
                  {errors.first_name && (
                    <span className="text-red-500 text-xs">
                      {errors.first_name}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Middle Name:
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={form.middle_name}
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
                  {errors.birthdate && (
                    <span className="text-red-500 text-xs">
                      {errors.birthdate}
                    </span>
                  )}
                </div>
              </div>

              {/* Second Column */}
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label className="block text-gray-700 mb-1">Last Name:</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  />
                  {errors.last_name && (
                    <span className="text-red-500 text-xs">
                      {errors.last_name}
                    </span>
                  )}
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
                  <label className="block text-gray-700 mb-1">Sex:</label>
                  <select
                    name="sex"
                    value={form.sex}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && (
                    <span className="text-red-500 text-xs">{errors.sex}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
              <h1 className="text-md font-bold">Address Information</h1>
            </div>
            <div className="flex flex-row gap-8 p-4">
              <div className="flex flex-col gap-3 w-full">
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-1">Barangay:</label>
                  <input
                    type="text"
                    name="barangay"
                    value={form.barangay}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  />
                  {errors.barangay && (
                    <span className="text-red-500 text-xs">
                      {errors.barangay}
                    </span>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-1">LGU:</label>
                  <input
                    type="text"
                    name="lgu"
                    value={form.lgu}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  />
                  {errors.lgu && (
                    <span className="text-red-500 text-xs">{errors.lgu}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
              <h1 className="text-md font-bold">Medical Information</h1>
            </div>
            <div className="flex flex-row gap-8 p-4">
              <div className="flex flex-col gap-3 w-full">
                <div className="w-1/2">
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
                  {errors.date_diagnosed && (
                    <span className="text-red-500 text-xs">
                      {errors.date_diagnosed}
                    </span>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-1">Diagnosis:</label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  />
                  {errors.diagnosis && (
                    <span className="text-red-500 text-xs">
                      {errors.diagnosis}
                    </span>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-1">
                    Cancer Stage:
                  </label>
                  <select
                    name="cancer_stage"
                    value={form.cancer_stage}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  >
                    <option value="">Select Stage</option>
                    <option value="I">Stage I</option>
                    <option value="II">Stage II</option>
                    <option value="III">Stage III</option>
                    <option value="IV">Stage IV</option>
                  </select>
                  {errors.cancer_stage && (
                    <span className="text-red-500 text-xs">
                      {errors.cancer_stage}
                    </span>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 mb-1">
                    Cancer Site:
                  </label>
                  <input
                    type="text"
                    name="cancer_site"
                    value={form.cancer_site}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  />
                  {errors.cancer_site && (
                    <span className="text-red-500 text-xs">
                      {errors.cancer_site}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Updates Section */}
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
              <h1 className="text-md font-bold">Historical Updates</h1>
            </div>
            <div className="p-4 space-y-4">
              {historicalUpdates.map((update, index) => (
                <div key={index} className="flex flex-col gap-3 border-b pb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Update #{index + 1}</h3>
                    {historicalUpdates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHistoricalUpdate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 mb-1">
                        Update Date:
                      </label>
                      <input
                        type="date"
                        name="update_date"
                        value={update.update_date}
                        onChange={(e) => handleHistoricalUpdateChange(index, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                      />
                      {errors[`update_date_${index}`] && (
                        <span className="text-red-500 text-xs">
                          {errors[`update_date_${index}`]}
                        </span>
                      )}
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 mb-1">Notes:</label>
                      <textarea
                        name="notes"
                        value={update.notes}
                        onChange={(e) => handleHistoricalUpdateChange(index, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                        rows="3"
                      />
                      {errors[`notes_${index}`] && (
                        <span className="text-red-500 text-xs">
                          {errors[`notes_${index}`]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addHistoricalUpdate}
                className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                + Add Another Update
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-around mt-4">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
            to="/Admin/patient/AdminPatientMasterList"
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

export default PatientMasterListAdd;
