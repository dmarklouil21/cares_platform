import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";

const PatientMasterListEdit = () => {
  const location = useLocation();
  const patient = location.state?.patient || {};
  const navigate = useNavigate();

  const [form, setForm] = useState(patient);
  const [historicalUpdates, setHistoricalUpdates] = useState(patient.historical_updates || []);

  const [newUpdate, setNewUpdate] = useState([
    {
      date: "",
      note: "",
    }
  ]);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });
  // Loading Modal 
  const [loading, setLoading] = useState(false);
  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Status Change?");
  const [modalAction, setModalAction] = useState(null); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "city") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        barangay: "", // Reset barangay when city changes
      }));
    } else if (name.startsWith("emergencyContact")) {
      const [contactKey, field] = name.split(".");
      const index = contactKey === "emergencyContact1" ? 0 : 1;

      setForm((prev) => {
        const updatedContacts = [...prev.emergency_contacts];
        updatedContacts[index] = {
          ...updatedContacts[index],
          [field]: value,
        };
        return {
          ...prev,
          emergency_contacts: updatedContacts,
        };
      });
    } else if (name.startsWith("cancer_diagnosis")) {
      const field = name.split("_").slice(2).join("_"); // Extract field name after "cancer_diagnosis"
      setForm((prev) => {
        const updatedDiagnosis = [...prev.diagnosis];
        updatedDiagnosis[0] = {
          ...updatedDiagnosis[0],
          [field]: value,
        };
        return {
          ...prev,
          diagnosis: updatedDiagnosis,
        };
      });
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "children" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleHistoricalUpdateChange = (index, e) => {
    const { name, value } = e.target;
    const updatedUpdates = [...newUpdate];
    updatedUpdates[index] = {
      ...updatedUpdates[index],
      [name]: value,
    };
    setNewUpdate(updatedUpdates);
    // setErrors((prev) => ({ ...prev, [`${name}_${index}`]: undefined }));
  };

  // const addHistoricalUpdate = () => {
  //   if (!newUpdate.date || !newUpdate.note) {
  //     setNotification("Please fill both date and note fields");
  //     setTimeout(() => setNotification(""), 2000);
  //     return;
  //   }

  //   setHistoricalUpdates((prev) => [...prev, newUpdate]);
  //   setNewUpdate({ date: "", note: "" });
  //   setNotification("Update added successfully");
  //   setTimeout(() => setNotification(""), 2000);
  // };
  const addHistoricalUpdate = () => {
    setNewUpdate([
      ...newUpdate,
      {
        date: "",
        note: "",
      },
    ]);
  };

  const removeNewHistoricalUpdate = (index) => {
    setNewUpdate((prev) => prev.filter((_, i) => i !== index));
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

    historicalUpdates.push(...newUpdate.filter(update => update.date && update.note));

    setForm(prev => ({
      ...prev,
      historical_updates: historicalUpdates,
    }));

    setModalText("Are you sure you want to save this changes?");
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
    // if (!validate()) return;
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try {
        setLoading(true);
        const response = await api.patch(`/patient/update/${patient.patient_id}/`, form);
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Changes save successfully.",
        });
        setShowModal(true);
        navigate("/Admin/patient/AdminPatientMasterList");
      } catch (error) {
        let errorMessage = "Something went wrong while submitting the form."; 

        if (error.response && error.response.data) {
          // DRF ValidationError returns an object with arrays of messages
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          } 
        }
        setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: errorMessage,
        });
        setShowModal(true);
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };
  
  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalAction(null);
          setModalText("");
        }}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal open={loading} text="Submitting changes..." />

      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Edit Patient Record</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-full w-full p-5 flex flex-col justify-between overflow-auto gap-5"
      >
        <div className="border border-black/15 p-3 bg-white rounded-sm mb-4">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Basic Information</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Column 1 */}
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">First Name:</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
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
                <label className="block text-gray-700 mb-1">Birthdate:</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  required
                />
              </div>

               <div>
                <label className="block text-gray-700 mb-1">Civil Status:</label>
                <select
                  name="civil_status"
                  value={form.civil_status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="">Select Civil Status</option>
                  <option value="single">Single</option>
                  <option value="co-habitation">Co-Habitation</option>
                  <option value="separated">Separated</option>
                  <option value="widower">Widower</option>
                  <option value="married">Married</option>
                  <option value="annulled">Annulled</option>
                </select>
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
                <label className="block text-gray-700 mb-1">
                  Number of Children:
                </label>
                <input
                  type="text"
                  name="number_of_children"
                  value={form.number_of_children}
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
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contact and Address Information Section */}
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Contact and Address Information</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Permanent Address:</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">City/Municipality:</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
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
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Email:</label>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Mobile Number:</label>
                <input
                  type="text"
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Additional Info</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Source of Information (Where did you here about RAFI-EJACC?):</label>
                <input
                  type="text"
                  name="source_of_information"
                  value={form.source_of_information}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Other RAFI program you availed:</label>
                <input
                  type="text"
                  name="other_rafi_programs_availed"
                  value={form.other_rafi_programs_availed}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Socioeconomic Info Section */}
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Socioeconomic Info</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Highest Educational Attainment:</label>
                <input
                  type="text"
                  name="highest_educational_attainment"
                  value={form.highest_educational_attainment}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Source of Income:</label>
                <input
                  type="text"
                  name="source_of_income"
                  value={form.source_of_income}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Occupation:</label>
                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Income:</label>
                <input
                  type="text"
                  name="monthly_income"
                  value={form.monthly_income}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Section */}
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
            <h1 className="text-md font-bold">Emergency Contacts</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Name:</label>
                <input
                  type="text"
                  name="emergencyContact1.name"
                  value={form.emergency_contacts[0].name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Relationship to Patient:</label>
                <input
                  type="text"
                  name="emergencyContact1.relationship_to_patient"
                  value={form.emergency_contacts[0].relationship_to_patient}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Landline Number:</label>
                <input
                  type="text"
                  name="emergencyContact1.landline_number"
                  value={form.emergency_contacts[0].landline_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Address:</label>
                <input
                  type="text"
                  name="emergencyContact1.address"
                  value={form.emergency_contacts[0].address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email Address:</label>
                <input
                  type="text"
                  name="emergencyContact1.email"
                  value={form.emergency_contacts[0].email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Mobile Number::</label>
                <input
                  type="text"
                  name="emergencyContact1.mobile_number"
                  value={form.emergency_contacts[0].mobile_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Name:</label>
                <input
                  type="text"
                  name="emergencyContact2.name"
                  value={form.emergency_contacts[1].name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Relationship to Patient:</label>
                <input
                  type="text"
                  name="emergencyContact2.relationship_to_patient"
                  value={form.emergency_contacts[1].relationship_to_patient}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Landline Number:</label>
                <input
                  type="text"
                  name="emergencyContact2.landline_number"
                  value={form.emergency_contacts[1].landline_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Address:</label>
                <input
                  type="text"
                  name="emergencyContact2.address"
                  value={form.emergency_contacts[1].address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email Address:</label>
                <input
                  type="text"
                  name="emergencyContact2.email"
                  value={form.emergency_contacts[1].email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Mobile Number::</label>
                <input
                  type="text"
                  name="emergencyContact2.mobile_number"
                  value={form.emergency_contacts[1].mobile_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
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
                  name="cancer_diagnosis_date_diagnosed"
                  value={form.diagnosis[0]?.date_diagnosed}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 mb-1">Diagnosis:</label>
                <input
                  type="text"
                  name="cancer_diagnosis_diagnosis"
                  value={form.diagnosis[0]?.diagnosis}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 mb-1">
                  Cancer Stage:
                </label>
                <select
                  name="cancer_diagnosis_cancer_stage"
                  value={form.diagnosis[0]?.cancer_stage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="">Select Stage</option>
                  <option value="I">Stage I</option>
                  <option value="II">Stage II</option>
                  <option value="III">Stage III</option>
                  <option value="IV">Stage IV</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 mb-1">
                  Cancer Site:
                </label>
                <input
                  type="text"
                  name="cancer_diagnosis_cancer_site"
                  value={form.diagnosis[0]?.cancer_site}
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
            {newUpdate.map((update, index) => (
              <div key={index} className="flex flex-col gap-3 border-b pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Update #{index + 1}</h3>
                  {newUpdate.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNewHistoricalUpdate(index)}
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
                      name="date"
                      value={update.date}
                      onChange={(e) => handleHistoricalUpdateChange(index, e)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                    />
                    {/* {errors[`update_date_${index}`] && (
                      <span className="text-red-500 text-xs">
                        {errors[`update_date_${index}`]}
                      </span>
                    )} */}
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 mb-1">Notes:</label>
                    <textarea
                      name="note"
                      value={update.note}
                      onChange={(e) => handleHistoricalUpdateChange(index, e)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                      rows="3"
                    />
                    {/* {errors[`notes_${index}`] && (
                      <span className="text-red-500 text-xs">
                        {errors[`notes_${index}`]}
                      </span>
                    )} */}
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
