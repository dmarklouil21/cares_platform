import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

import barangayData from "src/constants/barangayData";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import { use } from "react";

export default function PatinetProfileForm() {
  const { user } = useAuth();
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
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // user_id: user.user_id,
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
    source_of_information: "",
    other_rafi_programs_availed: "",
    highest_educational_attainment: "",
    occupation: "",
    source_of_income: "",
    monthly_income: "",
    registered_by: "self",
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
  });

  const [notification, setNotification] = useState("");
  const location = useLocation();

  const record = location.state?.formData;

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
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] = message;
      }
    });
    if (formData["date_of_birth"] > new Date().toISOString().split('T')[0])
      newErrors["date_of_birth"] = "Date should not be in the future.";

    // Validate photo
    if (!photoUrl) {
      newErrors.photoUrl = "2×2 photo is required.";
    }

    // Validate emergency contacts
    formData.emergency_contacts.forEach((contact, index) => {
      if (!contact.name.trim()) {
        newErrors[`emergency_contact_${index}_name`] =
          "Contact name is required.";
      }
      if (!contact.relationship_to_patient.trim()) {
        newErrors[`emergency_contact_${index}_relationship`] =
          "Relationship is required.";
      }
      if (!contact.address.trim()) {
        newErrors[`emergency_contact_${index}_address`] =
          "Address is required.";
      }
      if (!contact.mobile_number.trim()) {
        newErrors[`emergency_contact_${index}_mobile_number`] =
          "Mobile number is required.";
      }
      if (!contact.email.trim()) {
        newErrors[`emergency_contact_${index}_email`] = "Email is required.";
      }
    });

    return newErrors;
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        date_of_birth: user.date_of_birth || "",
        address: user.address || "",
        mobile_number: user.phone_number || "",
        email: user.email || "",
        barangay: "", // Reset barangay when city changes
      }));
    }
  }, [user]);

  console.log("User Data: ", user);
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        barangay: "", // Reset barangay when city changes
      }));
    } else if (name.startsWith("emergencyContact")) {
      const [contactKey, field] = name.split(".");
      const index = contactKey === "emergencyContact1" ? 0 : 1;

      setFormData((prev) => {
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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "children" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const getBarangays = () => {
    if (!formData.city) return [];
    return barangayData[formData.city] || [];
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   setModalText("Submit this form?");
  //   setModalAction({ type: "submit" });
  //   setModalOpen(true);
  // };

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

  const handleNext = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    navigate(`/beneficiary/pre-enrollment/cancer-data`, {
      state: {
        formData: formData,
        photoUrl: imageFile,
      },
    });
  };

  return (
    <>
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal open={loading} text="Submitting your data..." />
      <div className="h-screen w-full lg:w-[75%] flex flex-col gap-3 md:gap-12 bg-gray py-12 px-5 overflow-auto">
        <form
          // onSubmit={handleSubmit}
          className="bg-white p-5 md:p-9 flex flex-col gap-8 rounded-2xl "
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Left Side: Title + Note + Date md:text-2xl text-gray-800*/}
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-xl">PATIENT PROFILE</h1>
              <p className="text-sm text-gray-600 italic">
                Note: Please put <span className="font-semibold">"NA"</span> for
                not applicable fields.
              </p>
            </div>

            {/* Right Side: 2x2 Photo + Logo */}
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
                  // <span className="p-2 text-center leading-tight">
                  //   Upload 2×2 photo
                  //   <br />
                  //   <span className="text-[11px] opacity-70">JPG/PNG</span>
                  // </span>
                )}
                <input
                  id="photo2x2"
                  type="file"
                  accept="image/*"
                  onChange={handle2x2Change}
                  className="hidden"
                />
              </label>

              {/* Logo */}
              <img
                src="/images/logo_black_text.png"
                alt="rafi logo"
                className="h-30 md:h-30 object-contain"
              />
            </div>
          </div>

          <h2 className="text-md font-bold border-b pb-1">GENERAL DATA</h2>

          <div className="grid grid-cols-2 md:gap-x-10 gap-3">
            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="border-black  border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
              />
              {errors.first_name && (
                <span className="text-red-500 text-xs">
                  {errors.first_name}
                </span>
              )}
            </div>

            {/* Middle Name */}
            <div className="flex gap-2 flex-col">
              <label className="text-black text-[12px] md:text-[16px]">
                Middle Name
              </label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
              />
            </div>

            {/* Last Name */}
            <div className="flex gap-2 flex-col">
              <label className="text-black text-[12px] md:text-[16px]">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
              />
              {errors.last_name && (
                <span className="text-red-500 text-xs">{errors.last_name}</span>
              )}
            </div>

            {/* Suffix */}
            <div className="flex gap-2 flex-col">
              <label className="text-black text-[12px] md:text-[16px]">
                Suffix
              </label>
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
              />
            </div>

            {/* Date of Birth */}
            <div className="flex gap-2 flex-col">
              <label className="text-black         text-[12px] md:text-[16px]">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/src/assets/images/input_icons/datebirth.svg"
                    alt="Date of Birth Icon"
                    className="md:w-5 md:h-5 w-4 h-4"
                  />
                </div>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                  placeholder="Select date"
                />
              </div>
              {errors.date_of_birth && (
                <span className="text-red-500 text-xs">
                  {errors.date_of_birth}
                </span>
              )}
            </div>

            {/* Age */}
            {/* <div className="flex gap-2 flex-col">
              <label className="text-black        text-[12px] md:text-[16px]">
                Age
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
              />
            </div> */}

            {/* Sex */}
            <div className="flex gap-2 flex-col">
              <label className="text-black text-[12px] md:text-[16px]">
                Sex <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8 text-[12px] md:text-[16px] "
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.sex && (
                <span className="text-red-500 text-xs">{errors.sex}</span>
              )}
            </div>

            {/* Civil Status */}
            <div className="flex gap-2 flex-col">
              <label className="text-black      text-[12px] md:text-[16px]">
                Civil Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8 text-[12px] md:text-[16px]"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="single">Single</option>
                  <option value="co-habitation">Co-Habitation</option>
                  <option value="separated">Separated</option>
                  <option value="widower">Widow/er</option>
                  <option value="married">Married</option>
                  <option value="annulled">Annulled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.civil_status && (
                <span className="text-red-500 text-xs">
                  {errors.civil_status}
                </span>
              )}
            </div>

            {/* Number of Children */}
            <div className="flex gap-2 flex-col">
              <label className="text-black     text-[12px] md:text-[16px]">
                Number of Children
              </label>
              <input
                id="children-input"
                type="number"
                name="number_of_children"
                value={formData.number_of_children}
                onChange={handleChange}
                className="text-[12px] md:text-[16px] border-black border-[1px] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
              />
            </div>
          </div>

          {/* Contact & Address Section */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <h1 className="font-bold">Contact & Address</h1>
              <div className="grid grid-cols-2 md:gap-x-10 gap-3">
                {/* Permanent Address */}
                <div className="flex gap-2 flex-col col-span-2">
                  <label className="text-black    text-[12px] md:text-[16px]">
                    Permanent Address (Number & Street) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors.address && (
                    <span className="text-red-500 text-xs">
                      {errors.address}
                    </span>
                  )}
                </div>

                {/* City/Municipality */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    City/Municipality <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8 text-[12px] md:text-[16px]"
                    >
                      <option value="" disabled>
                        Select City/Municipality
                      </option>
                      {Object.keys(barangayData).map((city) => (
                        <option key={city} value={city}>
                          {city
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.city && (
                    <span className="text-red-500 text-xs">{errors.city}</span>
                  )}
                </div>

                {/* Barangay */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black  text-[12px] md:text-[16px]">
                    Barangay <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8 text-[12px] md:text-[16px]"
                      disabled={!formData.city}
                    >
                      <option value="">
                        {formData.city
                          ? "Select Barangay"
                          : "Select City first"}
                      </option>
                      {getBarangays().map((barangay) => (
                        <option key={barangay} value={barangay}>
                          {barangay}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.barangay && (
                    <span className="text-red-500 text-xs">
                      {errors.barangay}
                    </span>
                  )}
                </div>

                {/* Contact Number */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Landline Number/Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        src="/src/assets/images/input_icons/telephone.svg"
                        alt="Telephone Icon"
                      />
                    </div>
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                    />
                  </div>
                  {errors.mobile_number && (
                    <span className="text-red-500 text-xs">
                      {errors.mobile_number}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex gap-2 flex-col justify-between">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        src="/src/assets/images/input_icons/email.svg"
                        alt="Email Icon"
                      />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                      placeholder="ejacc@gmail.com"
                    />
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-xs">{errors.email}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="flex flex-col gap-5">
              <h1 className="font-bold">Additional Info</h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                {/* Source of Information */}
                <div className="flex gap-2 flex-col col-span-2">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Source of Information (Where did you hear about
                    RAFI-EJACC?): <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="source_of_information"
                    value={formData.source_of_information}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 h-36 resize-none text-[12px] md:text-[16px] w-full md:w-[60%]"
                  />
                  {errors.source_of_information && (
                    <span className="text-red-500 text-xs">
                      {errors.source_of_information}
                    </span>
                  )}
                </div>

                {/* Other RAFI Programs */}
                <div className="flex gap-2 flex-col col-span-2">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Other RAFI programs you availed:
                  </label>
                  <textarea
                    name="other_rafi_programs_availed"
                    value={formData.other_rafi_programs_availed}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 h-36 resize-none text-[12px] md:text-[16px] w-full md:w-[60%]"
                  />
                </div>
              </div>
            </div>

            {/* Socioeconomic Info Section */}
            <div className="flex flex-col gap-5">
              <h1 className="font-bold">Socioeconomic Info</h1>
              <div className="grid grid-cols-2 md:gap-x-10 gap-4">
                {/* Education */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Highest Educational Attainment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="highest_educational_attainment"
                    value={formData.highest_educational_attainment}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors.highest_educational_attainment && (
                    <span className="text-red-500 text-xs">
                      {errors.highest_educational_attainment}
                    </span>
                  )}
                </div>

                {/* Occupation */}
                <div className="flex gap-2 flex-col justify-between">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Occupation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2   text-[12px] md:text-[16px]"
                  />
                  {errors.occupation && (
                    <span className="text-red-500 text-xs">
                      {errors.occupation}
                    </span>
                  )}
                </div>

                {/* Income Source */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]  ">
                    Source of Income <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="source_of_income"
                    value={formData.source_of_income}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors.source_of_income && (
                    <span className="text-red-500 text-xs">
                      {errors.source_of_income}
                    </span>
                  )}
                </div>

                {/* Income */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Income <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="monthly_income"
                    value={formData.monthly_income}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors.monthly_income && (
                    <span className="text-red-500 text-xs">
                      {errors.monthly_income}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact 1 Section */}
            <div className="flex flex-col gap-5">
              <h1 className="font-bold">Emergency Contact 1</h1>
              <div className="grid grid-cols-2 md:gap-x-10 gap-3">
                {/* Name */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact1.name"
                    value={formData.emergency_contacts[0].name}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors[`emergency_contact_0_name`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_name`]}
                    </span>
                  )}
                </div>

                {/* Address */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Address <span className="text-red-500">*</span>
                  </label> 
                  <input
                    type="text"
                    name="emergencyContact1.address"
                    value={formData.emergency_contacts[0].address}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors[`emergency_contact_0_address`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_address`]}
                    </span>
                  )}
                </div>

                {/* Relationship */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Relationship to Patient <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact1.relationship_to_patient"
                    value={
                      formData.emergency_contacts[0].relationship_to_patient
                    }
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors[`emergency_contact_0_relationship`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_relationship`]}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        src="/src/assets/images/input_icons/email.svg"
                        alt="Email Icon"
                      />
                    </div>
                    <input
                      type="email"
                      name="emergencyContact1.email"
                      value={formData.emergency_contacts[0].email}
                      onChange={handleChange}
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                      placeholder="ejacc@gmail.com"
                    />
                  </div>
                  {errors[`emergency_contact_0_email`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_email`]}
                    </span>
                  )}
                </div>

                {/* Landline */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Landline Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        src="/src/assets/images/input_icons/telephone.svg"
                        alt="Telephone Icon"
                      />
                    </div>
                    <input
                      type="tel"
                      name="emergencyContact1.landline_number"
                      value={formData.emergency_contacts[0].landline_number}
                      onChange={handleChange}
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        src="/src/assets/images/input_icons/mobile.svg"
                        alt="Mobile Icon"
                      />
                    </div>
                    <input
                      type="tel"
                      name="emergencyContact1.mobile_number"
                      value={formData.emergency_contacts[0].mobile_number}
                      onChange={handleChange}
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                    />
                  </div>
                  {errors[`emergency_contact_0_mobile_number`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_mobile_number`]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact 2 Section */}
            <div className="flex flex-col gap-5">
              <h1 className="font-bold">Emergency Contact 2</h1>
              <div className="grid grid-cols-2 md:gap-x-10 gap-3">
                {/* Name */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.name"
                    value={formData.emergency_contacts[1].name}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors[`emergency_contact_1_name`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_name`]}
                    </span>
                  )}
                </div>

                {/* Address */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.address"
                    value={formData.emergency_contacts[1].address}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors[`emergency_contact_1_address`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_address`]}
                    </span>
                  )}
                </div>

                {/* Relationship */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Relationship to Patient <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.relationship_to_patient"
                    value={
                      formData.emergency_contacts[1].relationship_to_patient
                    }
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 text-[12px] md:text-[16px]"
                  />
                  {errors[`emergency_contact_1_relationship`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_relationship`]}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        src="/src/assets/images/input_icons/email.svg"
                        alt="Email Icon"
                      />
                    </div>
                    <input
                      type="email"
                      name="emergencyContact2.email"
                      value={formData.emergency_contacts[1].email}
                      onChange={handleChange}
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                      placeholder="ejacc@gmail.com"
                    />
                  </div>
                  {errors[`emergency_contact_1_email`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_email`]}
                    </span>
                  )}
                </div>

                {/* Landline */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Landline Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        src="/src/assets/images/input_icons/telephone.svg"
                        alt="Telephone Icon"
                      />
                    </div>
                    <input
                      type="tel"
                      name="emergencyContact2.landline_number"
                      value={formData.emergency_contacts[1].landline_number}
                      onChange={handleChange}
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black text-[12px] md:text-[16px]">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        src="/src/assets/images/input_icons/mobile.svg"
                        alt="Mobile Icon"
                      />
                    </div>
                    <input
                      type="tel"
                      name="emergencyContact2.mobile_number"
                      value={formData.emergency_contacts[1].mobile_number}
                      onChange={handleChange}
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                    />
                  </div>
                  {errors[`emergency_contact_1_mobile_number`] && (
                    <span className="text-red-500 text-xs">
                      {errors[`emergency_contact_0_mobile_number`]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex w-full justify-between gap-9">
            <Link
              to="/beneficiary/pre-enrollment/note"
              className=" border py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
            >
              Cancel
            </Link>
            <button
              type="button"
              // to="/beneficiary/pre-enrollment/cancer-data"
              onClick={handleNext}
              className="bg-[#749AB6] text-center font-bold text-white py-3 w-full border-[1px] border-[#749AB6] hover:border-[#C5D7E5] hover:bg-[#C5D7E5] rounded-md cursor-pointer"
              // state={{
              //   formData: formData,
              //   photoUrl: imageFile
              // }}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
