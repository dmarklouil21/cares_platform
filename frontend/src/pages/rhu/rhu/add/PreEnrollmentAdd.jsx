import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";

const PatientMasterListAdd = () => {
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    suffix: "",
    sex: "",
    civil_status: "",
    number_of_children: 0,
    address: "",
    city: "",
    barangay: "",
    mobile_number: "",
    email: "",
    status: "validated",
    source_of_information: "",
    other_rafi_programs_availed: "",
    highest_educational_attainment: "",
    occupation: "",
    source_of_income: "",
    monthly_income: "",
    registered_by: "rhu",
    emergency_contacts: [
      {
        name: "",
        address: "",
        relationship_to_patient: "",
        email: "",
        landline_number: "",
        mobile_number: "",
      },
      {
        name: "",
        address: "",
        relationship_to_patient: "",
        email: "",
        landline_number: "",
        mobile_number: "",
      },
    ],
    diagnosis: [{
      diagnosis: "",
      date_diagnosed: "",
      cancer_stage: "",
      cancer_site: "",
    }],
    historical_updates: [],
  });

  const [historicalUpdates, setHistoricalUpdates] = useState([
    {
      date: "",
      note: "",
    },
  ]);

  // const [notification, setNotification] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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

  const validate = () => {
    const newErrors = {};
    if (!form.first_name.trim())
      newErrors.first_name = "First name is required.";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!form.birthdate) newErrors.birthdate = "Birthdate is required.";
    if (!form.sex) newErrors.sex = "Sex is required.";
    if (!form.barangay) newErrors.barangay = "Barangay is required.";
    if (!form.lgu) newErrors.lgu = "LGU is required.";

    // Validate historical updates
    // historicalUpdates.forEach((update, index) => {
    //   if (!update.update_date)
    //     newErrors[`update_date_${index}`] = "Update date is required.";
    //   if (!update.notes.trim())
    //     newErrors[`notes_${index}`] = "Notes are required.";
    // });

    return newErrors;
  };

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
        date: "",
        note: "",
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
    // if (Object.keys(validationErrors).length > 0) {
    //   setErrors(validationErrors);
    //   return;
    // }
    setForm(prev => ({
      ...prev,
      historical_updates: historicalUpdates,
    }));

    setModalText("Are you sure you want to add this data?");
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try {
        console.log("Form Data:", form);
        setLoading(true);
        const response = await api.post("/patient/pre-enrollment/", form);
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Patient added successfully.",
        });
        setShowModal(true);
        navigate("/Rhu/rhu/pre-enrollment/");
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
      <LoadingModal open={loading} text="Submitting your data..." />

      {/* {notification && (
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
      )} */}

      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Add Patient</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="h-full w-full p-5 flex flex-col justify-between overflow-auto gap-5"
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
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  />
                  {errors.date_of_birth && (
                    <span className="text-red-500 text-xs">
                      {errors.date_of_birth}
                    </span>
                  )}
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
                  {errors.civil_status && (
                    <span className="text-red-500 text-xs">{errors.civil_status}</span>
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
                  <label className="block text-gray-700 mb-1">sex:</label>
                  <select
                    name="sex"
                    value={form.sex}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                  >
                    <option value="">Select Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.sex && (
                    <span className="text-red-500 text-xs">{errors.sex}</span>
                  )}
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
                  {errors.address && (
                    <span className="text-red-500 text-xs">{errors.address}</span>
                  )}
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
                  {errors.city && (
                    <span className="text-red-500 text-xs">{errors.city}</span>
                  )}
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
                  {errors.barangay && (
                    <span className="text-red-500 text-xs">
                      {errors.barangay}
                    </span>
                  )}
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
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {errors.email}
                    </span>
                  )}
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
                    value={form.diagnosis.date_diagnosed}
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
                    name="cancer_diagnosis_diagnosis"
                    value={form.diagnosis.diagnosis}
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
                    name="cancer_diagnosis_cancer_stage"
                    value={form.diagnosis.cancer_stage}
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
                    name="cancer_diagnosis_cancer_site"
                    value={form.diagnosis.cancer_site}
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
                        name="date"
                        value={update.date}
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
                        name="note"
                        value={update.note}
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
