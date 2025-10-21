import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

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
    registered_by: "rafi",
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
    // diagnosis: [],
    // historical_updates: [],
  });

  // const [diagnosis, setDiagnosis] = useState([
  //   {
  //     date_diagnosed: "",
  //     diagnosis: "",
  //     cancer_site: "",
  //     cancer_stage: "",
  //   },
  // ]);

  // const [historicalUpdates, setHistoricalUpdates] = useState([
  //   {
  //     date: "",
  //     note: "",
  //   },
  // ]);

  // 2×2 photo preview (UI only; no data changes)
  const [photoUrl, setPhotoUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  function handle2x2Change(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setImageFile(file);
  }

  // cleanup the blob URL to avoid leaks
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

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

    // Required fields
    const requiredFields = {
      first_name: "First name is required.",
      last_name: "Last name is required.",
      date_of_birth: "Birthdate is required.",
      sex: "Sex is required.",
      civil_status: "Civil status is required.",
      barangay: "Barangay is required.",
      address: "Address is required.",
      email: "Email is required.",
      city: "City/Municipality is required.",
      mobile_number: "Mobile number is required.",
      source_of_information: "Source of information is required.",
      highest_educational_attainment: "Educational attainment is required.",
      occupation: "Occupation is required.",
      source_of_income: "Source of income is required.",
      monthly_income: "Monthly income is required.",
    };

    // Validate form fields
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!form[field] || !form[field].toString().trim()) {
        newErrors[field] = message;
      }
    });

    // Validate photo
    if (!photoUrl) {
      newErrors.photoUrl = "2×2 photo is required.";
    }

    // Validate emergency contacts
    form.emergency_contacts.forEach((contact, index) => {
      if (!contact.name.trim()) {
        newErrors[`emergency_contact_${index}_name`] = "Contact name is required.";
      }
      if (!contact.relationship_to_patient.trim()) {
        newErrors[`emergency_contact_${index}_relationship`] = "Relationship is required.";
      }
      if (!contact.address.trim()) {
        newErrors[`emergency_contact_${index}_address`] = "Address is required.";
      }
      if (!contact.mobile_number.trim()) {
        newErrors[`emergency_contact_${index}_mobile_number`] = "Mobile number is required.";
      }
    });

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

  // const handleDiagnosisChange = (index, e) => {
  //   const { name, value } = e.target;
  //   const updatedDiagnosis = [...diagnosis];
  //   updatedDiagnosis[index] = {
  //     ...updatedDiagnosis[index],
  //     [name]: value,
  //   };
  //   setDiagnosis(updatedDiagnosis);
  //   // setErrors((prev) => ({ ...prev, [`${name}_${index}`]: undefined }));
  // };

  // const handleHistoricalUpdateChange = (index, e) => {
  //   const { name, value } = e.target;
  //   const updatedUpdates = [...historicalUpdates];
  //   updatedUpdates[index] = {
  //     ...updatedUpdates[index],
  //     [name]: value,
  //   };
  //   setHistoricalUpdates(updatedUpdates);
  //   setErrors((prev) => ({ ...prev, [`${name}_${index}`]: undefined }));
  // };

  // const addHistoricalUpdate = () => {
  //   setHistoricalUpdates([
  //     ...historicalUpdates,
  //     {
  //       date: "",
  //       note: "",
  //     },
  //   ]);
  // };

  // const removeHistoricalUpdate = (index) => {
  //   if (historicalUpdates.length > 1) {
  //     const updatedUpdates = historicalUpdates.filter((_, i) => i !== index);
  //     setHistoricalUpdates(updatedUpdates);
  //   }
  // };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const validationErrors = validate();
  //   // if (Object.keys(validationErrors).length > 0) {
  //   //   setErrors(validationErrors);
  //   //   return;
  //   // }
  //   // setForm(prev => ({
  //   //   ...prev,
  //   //   historical_updates: historicalUpdates,
  //   // }));
  //   if (diagnosis.length > 0) {
  //     form.diagnosis = diagnosis.filter(
  //       (d) => d.date_diagnosed && d.diagnosis && d.cancer_site && d.cancer_stage
  //     );
  //   }
  //   if (historicalUpdates.length > 0) {
  //       form.historical_updates = historicalUpdates.filter(
  //       (h) => h.date && h.note
  //     );
  //   }

  //   setModalText("Are you sure you want to add this data?");
  //   setModalAction({ type: "submit" });
  //   setModalOpen(true);
  // };

  // const handleModalConfirm = async () => {
  //   if (modalAction?.type === "submit") {
  //     try {
  //       setModalOpen(false);
  //       setLoading(true);
  //       const response = await api.post("/patient/pre-enrollment/", form);
  //       setModalInfo({
  //         type: "success",
  //         title: "Success!",
  //         message: "Patient added successfully.",
  //       });
  //       setShowModal(true);
  //       navigate("/Admin/patient/AdminPatientMasterList");
  //     } catch (error) {
  //       let errorMessage = "Something went wrong while submitting the form.";

  //       if (error.response && error.response.data) {
  //         // DRF ValidationError returns an object with arrays of messages
  //         if (error.response.data.non_field_errors) {
  //           errorMessage = error.response.data.non_field_errors[0];
  //         }
  //       }
  //       setModalInfo({
  //         type: "error",
  //         title: "Submission Failed",
  //         message: errorMessage,
  //       });
  //       setShowModal(true);
  //       console.error("Error submitting form:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   setModalOpen(false);
  //   setModalAction(null);
  //   setModalText("");
  // };

  // to="/admin/patient/add/cancer-data"
  //           state={{
  //             formData: form,
  //             photoUrl: imageFile
  //           }}
  const handleNext = () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Validation errors:", validationErrors);
      return;
    }

    navigate(`/admin/patient/add/cancer-data`, {
      state: {
        formData: form,
        photoUrl: imageFile,
      },
    });
  };

  return (
    <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center bg-gray overflow-auto">
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        // onConfirm={handleModalConfirm}
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

      {/* <div className=" h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Add Patient</h1>
        <div>
          <Link to={"/admin/patient/master-list"}>
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </Link>
        </div>
      </div> */}

      <form
        // onSubmit={handleSubmit}
        className="h-full w-full flex flex-col justify-between gap-5 bg[#F8F9FA]"
      >
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between py-3 px-5 items-start md:items-center gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold">PATIENT PROFILE</h1>
              <p className="text-sm text-gray-600">
                Patient ID: <span className="font-semibold">{"N/A"}</span>
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* 2x2 Upload */}
              <label
                htmlFor="photo2x2"
                className="relative w-[120px] h-[120px] border-2 border rounded-md flex items-center justify-center text-xs text-gray-500 cursor-pointer overflow-hidden hover:bg-gray-50 transition"
                title="Upload 2×2 photo"
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="2×2 preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="p-2 text-center leading-tight">
                    {errors.photoUrl ? (
                      <span className="text-red-500 text-xs">
                        {errors.photoUrl}
                      </span>
                    ) : (
                      <>
                        Upload 2×2 photo
                        <br />
                        <span className="text-[11px] opacity-70">JPG/PNG</span>
                      </>
                    )}
                  </span>
                )}
                <input
                  id="photo2x2"
                  type="file"
                  accept="image/*"
                  onChange={handle2x2Change}
                  className="hidden"
                />
              </label>
              {/* <div className="w-[120px] h-[120px] border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={''}
                  alt="2x2 ID"
                  className="w-full h-full object-cover"
                />
              </div> */}
              {/* Logo */}
              <img
                src="/images/logo_black_text.png"
                alt="rafi logo"
                className="h-30 md:h-30 object-contain"
              />
            </div>
          </div>

          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Personal Information
            </h2>
          </div>

          {/* Basic Information Section */}
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  First Name:
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
                {errors.first_name && (
                  <span className="text-red-500 text-xs">
                    {errors.first_name}
                  </span>
                )}
              </div>
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Middle Name:
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={form.middle_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Birthdate:
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
                {errors.date_of_birth && (
                  <span className="text-red-500 text-xs">
                    {errors.date_of_birth}
                  </span>
                )}
              </div>
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Civil Status:
                </label>
                <select
                  name="civil_status"
                  value={form.civil_status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
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
                  <span className="text-red-500 text-xs">
                    {errors.civil_status}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Last Name:
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
                {errors.last_name && (
                  <span className="text-red-500 text-xs">
                    {errors.last_name}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Suffix:
                </label>
                <input
                  type="text"
                  name="suffix"
                  value={form.suffix}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Number of Children:
                </label>
                <input
                  type="text"
                  name="number_of_children"
                  value={form.number_of_children}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Sex:</label>
                <select
                  name="sex"
                  value={form.sex}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
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

          {/* Contact and Address Information Section */}
          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Contact & Address
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Permanent Address:
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.address && (
                  <span className="text-red-500 text-xs">{errors.address}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  City/Municipality:
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.city && (
                  <span className="text-red-500 text-xs">{errors.city}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Barangay:
                </label>
                <input
                  type="text"
                  name="barangay"
                  value={form.barangay}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
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
                <label className="text-sm font-medium block mb-1">Email:</label>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">{errors.email}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Mobile Number:
                </label>
                <input
                  type="text"
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.mobile_number && (
                  <span className="text-red-500 text-xs">
                    {errors.mobile_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Additional Info
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Source of Information (Where did you here about RAFI-EJACC?):
                </label>
                <input
                  type="text"
                  name="source_of_information"
                  value={form.source_of_information}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.source_of_information && (
                  <span className="text-red-500 text-xs">
                    {errors.source_of_information}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Other RAFI program you availed:
                </label>
                <input
                  type="text"
                  name="other_rafi_programs_availed"
                  value={form.other_rafi_programs_availed}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Socioeconomic Info Section */}
          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Socioeconomic Info
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Highest Educational Attainment:
                </label>
                <input
                  type="text"
                  name="highest_educational_attainment"
                  value={form.highest_educational_attainment}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.highest_educational_attainment && (
                  <span className="text-red-500 text-xs">
                    {errors.highest_educational_attainment}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Source of Income:
                </label>
                <input
                  type="text"
                  name="source_of_income"
                  value={form.source_of_income}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.source_of_income && (
                  <span className="text-red-500 text-xs">
                    {errors.source_of_income}
                  </span>
                )}
              </div>
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Occupation:
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.occupation && (
                  <span className="text-red-500 text-xs">
                    {errors.occupation}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Income:
                </label>
                <input
                  type="text"
                  name="monthly_income"
                  value={form.monthly_income}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Emergency Contacts
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">Name:</label>
                <input
                  type="text"
                  name="emergencyContact1.name"
                  value={form.emergency_contacts[0].name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors[`emergency_contact_0_name`] && (
                  <span className="text-red-500 text-xs">{errors[`emergency_contact_0_name`]}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Relationship to Patient:
                </label>
                <input
                  type="text"
                  name="emergencyContact1.relationship_to_patient"
                  value={form.emergency_contacts[0].relationship_to_patient}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors[`emergency_contact_0_relationship`] && (
                  <span className="text-red-500 text-xs">{errors[`emergency_contact_0_relationship`]}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Landline Number:
                </label>
                <input
                  type="text"
                  name="emergencyContact1.landline_number"
                  value={form.emergency_contacts[0].landline_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Address:
                </label>
                <input
                  type="text"
                  name="emergencyContact1.address"
                  value={form.emergency_contacts[0].address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors[`emergency_contact_0_address`] && (
                  <span className="text-red-500 text-xs">{errors[`emergency_contact_0_address`]}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Email Address:
                </label>
                <input
                  type="text"
                  name="emergencyContact1.email"
                  value={form.emergency_contacts[0].email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Mobile Number::
                </label>
                <input
                  type="text"
                  name="emergencyContact1.mobile_number"
                  value={form.emergency_contacts[0].mobile_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors[`emergency_contact_0_mobile_number`] && (
                  <span className="text-red-500 text-xs">{errors[`emergency_contact_0_mobile_number`]}</span>
                )}
              </div>
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">Name:</label>
                <input
                  type="text"
                  name="emergencyContact2.name"
                  value={form.emergency_contacts[1].name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors[`emergency_contact_1_name`] && (
                  <span className="text-red-500 text-xs">{errors[`emergency_contact_1_name`]}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Relationship to Patient:
                </label>
                <input
                  type="text"
                  name="emergencyContact2.relationship_to_patient"
                  value={form.emergency_contacts[1].relationship_to_patient}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors[`emergency_contact_1_relationship`] && (
                  <span className="text-red-500 text-xs">{errors[`emergency_contact_1_relationship`]}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Landline Number:
                </label>
                <input
                  type="text"
                  name="emergencyContact2.landline_number"
                  value={form.emergency_contacts[1].landline_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Address:
                </label>
                <input
                  type="text"
                  name="emergencyContact2.address"
                  value={form.emergency_contacts[1].address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors[`emergency_contact_1_address`] && (
                  <span className="text-red-500 text-xs">{errors[`emergency_contact_1_address`]}</span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Email Address:
                </label>
                <input
                  type="text"
                  name="emergencyContact2.email"
                  value={form.emergency_contacts[1].email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Mobile Number::
                </label>
                <input
                  type="text"
                  name="emergencyContact2.mobile_number"
                  value={form.emergency_contacts[1].mobile_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors[`emergency_contact_1_mobile_number`] && (
                  <span className="text-red-500 text-xs">{errors[`emergency_contact_1_mobile_number`]}</span>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          {/* <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Medical Information
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Date Diagnosed:
                </label>
                <input
                  type="date"
                  name="cancer_diagnosis_date_diagnosed"
                  value={form.diagnosis.date_diagnosed}
                  onChange={(e) => handleDiagnosisChange(0, e)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.date_diagnosed && (
                  <span className="text-red-500 text-xs">
                    {errors.date_diagnosed}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Diagnosis:</label>
                <input
                  type="text"
                  name="cancer_diagnosis_diagnosis"
                  value={form.diagnosis.diagnosis}
                  onChange={(e) => handleDiagnosisChange(0, e)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.diagnosis && (
                  <span className="text-red-500 text-xs">
                    {errors.diagnosis}
                  </span>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Cancer Stage:
                </label>
                <select
                  name="cancer_diagnosis_cancer_stage"
                  value={form.diagnosis.cancer_stage}
                  onChange={(e) => handleDiagnosisChange(0, e)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
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
            </div>
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">Cancer Site</label>
                <input
                  type="text"
                  name="cancer_diagnosis_cancer_site"
                  value={form.diagnosis.cancer_site}
                  onChange={(e) => handleDiagnosisChange(0, e)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
                {errors.cancer_site && (
                  <span className="text-red-500 text-xs">
                    {errors.cancer_site}
                  </span>
                )}
              </div>
            </div>
          </div> */}

          {/* Historical Updates Section */}
          {/* <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Patient Historical Updates
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {historicalUpdates.map((update, index) => (
              <div key={index} className="flex flex-col gap-3 border-b pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold">Update #{index + 1}</h3>
                  {historicalUpdates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHistoricalUpdate(index)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-sm font-medium block mb-1">
                      Update Date:
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={update.date}
                      onChange={(e) => handleHistoricalUpdateChange(index, e)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                    {errors[`update_date_${index}`] && (
                      <span className="text-red-500 text-xs">
                        {errors[`update_date_${index}`]}
                      </span>
                    )}
                  </div>
                  <div className="w-1/2">
                    <label className="text-sm font-medium block mb-1">
                      Notes:
                    </label>
                    <textarea
                      name="note"
                      value={update.note}
                      onChange={(e) => handleHistoricalUpdateChange(index, e)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
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
          </div>s */}
        </div>

        <div className="w-full flex justify-around">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black rounded-md"
            to="/admin/patient/master-list"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleNext}
            className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md cursor-pointer"
          >
            Next
          </button>
        </div>
        <br />
      </form>
    </div>
  );
};

export default PatientMasterListAdd;
