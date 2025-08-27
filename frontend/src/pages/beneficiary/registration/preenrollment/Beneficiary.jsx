import { use, useEffect, useState } from "react";
import { useAuth } from "src/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import barangayData from "src/constants/barangayData";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";

function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-1 left-1/2 bg-amber-100 transform -translate-x-1/2 z-50">
      <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3 animate-fade-in">
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

export default function PatinetProfileForm() {
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

  const navigate = useNavigate();
  const { user } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setModalText('Submit this form?');
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try {
        setLoading(true);
        const response = await api.post("/beneficiary/pre-enrollment/", formData);
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Your form was submitted.",
        });
        setShowModal(true);
        navigate("/Beneficiary");
      } catch (error) {
        let errorMessage = "Something went wrong while submitting the form."; 

        if (error.response && error.response.data) {
          // DRF ValidationError returns an object with arrays of messages
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          } //else if (typeof error.response.data === "string") {
            //errorMessage = error.response.data; // for plain text errors
          //}
        }
        setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: errorMessage,
        });
        setShowModal(true);
        /* setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: "Something went wrong while submitting the form.",
        });
        setShowModal(true); */
        // if (error.response && error.response.data && error.response.data.exists) {
        //   setNotification("You already registered as beneficiary");
        //   setTimeout(() => setNotification(""), 3500);
        //   return;
        // }
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  }

  return (
    <>
      {/* <Notification
        message={notification}
        onClose={() => setNotification("")}
      /> */}
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
      <div className="h-screen w-[75%] flex flex-col gap-12 bg-gray py-12 px-12 overflow-auto">
        <div className="w-full flex justify-between px-9">
          <h1 className="font-bold text-2xl">Patient Profile</h1>
          <div className="flex text-right flex-col">
            <p className="text-sm">STEP 01/02</p>
            <h1 className="font-bold text-black">General Data</h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-9 flex flex-col gap-10 rounded-2xl"
        >
          {/* Patient Name Section */}
          <h1 className="font-bold text-2xl">Patient Name</h1>
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            {/* First Name */}
            <div className="flex gap-2 flex-col">
              <label className="text-gray2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2"
              />
            </div>

            {/* Middle Name */}
            <div className="flex gap-2 flex-col">
              <label className="text-black">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2"
              />
            </div>

            {/* Last Name */}
            <div className="flex gap-2 flex-col">
              <label className="text-black">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2"
              />
            </div>

             {/* Suffix */}
            <div className="flex gap-2 flex-col">
              <label className="text-black">Suffix</label>
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2"
              />
            </div>

            {/* Date of Birth */}
            <div className="flex gap-2 flex-col">
              <label className="text-black">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/src/assets/images/input_icons/datebirth.svg"
                    alt="Date of Birth Icon"
                  />
                </div>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                  placeholder="Select date"
                />
              </div>
            </div>

            {/* Age */}
            {/* <div className="flex gap-2 flex-col">
              <label className="text-black">Age</label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2"
              />
            </div> */}

            {/* Sex */}
            <div className="flex gap-2 flex-col">
              <label className="text-black">Sex</label>
              <div className="relative">
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
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
            </div>

            {/* Civil Status */}
            <div className="flex gap-2 flex-col">
              <label className="text-black">Civil Status</label>
              <div className="relative">
                <select
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
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
            </div>

            {/* Number of Children */}
            <div className="flex gap-2 flex-col">
              <label className="text-black">Number of Children</label>
              <input
                id="children-input"
                type="number"
                name="number_of_children"
                value={formData.number_of_children}
                onChange={handleChange}
                className="border-black border-[1px] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
              />
            </div>
          </div>

          {/* Contact & Address Section */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <h1 className="font-bold text-2xl">Contact & Address</h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                {/* Permanent Address */}
                <div className="flex gap-2 flex-col col-span-2">
                  <label className="text-black">
                    Permanent Address (Number & Street)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* City/Municipality */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">City/Municipality</label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
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
                </div>

                {/* Barangay */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Barangay</label>
                  <div className="relative">
                    <select
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
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
                </div>

                {/* Contact Number */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">
                    Landline Number/Mobile Number
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
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Email</label>
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
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="ejacc@gmail.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="flex flex-col gap-5">
              <h1 className="font-bold text-2xl">Additional Info</h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                {/* Source of Information */}
                <div className="flex gap-2 flex-col col-span-2">
                  <label className="text-black">
                    Source of Information (Where did you hear about
                    RAFI-EJACC?):
                  </label>
                  <textarea
                    name="source_of_information"
                    value={formData.source_of_information}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 h-36 w-[60%] resize-none"
                  />
                </div>

                {/* Other RAFI Programs */}
                <div className="flex gap-2 flex-col col-span-2">
                  <label className="text-black">
                    Other RAFI programs you availed:
                  </label>
                  <textarea
                    name="other_rafi_programs_availed"
                    value={formData.other_rafi_programs_availed}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2 h-36 w-[60%] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Socioeconomic Info Section */}
            <div className="flex flex-col gap-5">
              <h1 className="font-bold text-2xl">Socioeconomic Info</h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                {/* Education */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">
                    Highest Educational Attainment
                  </label>
                  <input
                    type="text"
                    name="highest_educational_attainment"
                    value={formData.highest_educational_attainment}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Occupation */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Income Source */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Source of Income</label>
                  <input
                    type="text"
                    name="source_of_income"
                    value={formData.source_of_income}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Income */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Income</label>
                  <input
                    type="number"
                    name="monthly_income"
                    value={formData.monthly_income}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact 1 Section */}
            <div className="flex flex-col gap-5">
              <h1 className="font-bold text-2xl">Emergency Contact 1</h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                {/* Name */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Name</label>
                  <input
                    type="text"
                    name="emergencyContact1.name"
                    value={formData.emergency_contacts[0].name}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Address */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Address</label>
                  <input
                    type="text"
                    name="emergencyContact1.address"
                    value={formData.emergency_contacts[0].address}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Relationship */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Relationship to Patient</label>
                  <input
                    type="text"
                    name="emergencyContact1.relationship_to_patient"
                    value={
                      formData.emergency_contacts[0].relationship_to_patient
                    }
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Email */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Email</label>
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
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="ejacc@gmail.com"
                    />
                  </div>
                </div>

                {/* Landline */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Landline Number</label>
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
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Phone Number</label>
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
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact 2 Section */}
            <div className="flex flex-col gap-5">
              <h1 className="font-bold text-2xl">Emergency Contact 2</h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                {/* Name */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Name</label>
                  <input
                    type="text"
                    name="emergencyContact2.name"
                    value={formData.emergency_contacts[1].name}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Address */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Address</label>
                  <input
                    type="text"
                    name="emergencyContact2.address"
                    value={formData.emergency_contacts[1].address}
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Relationship */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Relationship to Patient</label>
                  <input
                    type="text"
                    name="emergencyContact2.relationship_to_patient"
                    value={
                      formData.emergency_contacts[1].relationship_to_patient
                    }
                    onChange={handleChange}
                    className="border-black border-[1px] rounded-md p-2"
                  />
                </div>

                {/* Email */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Email</label>
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
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="ejacc@gmail.com"
                    />
                  </div>
                </div>

                {/* Landline */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Landline Number</label>
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
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-2 flex-col">
                  <label className="text-black">Phone Number</label>
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
                      className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex w-full justify-between gap-9">
            <Link
              to="/NoteBeneficiary"
              className=" border py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-[#749AB6] text-center font-bold text-white py-2 w-full border-[1px] border-[#749AB6] hover:border-[#C5D7E5] hover:bg-[#C5D7E5] rounded-md cursor-pointer"
            >
              Submit
            </button>
          </div>
          {/* <div className="flex justify-end w-full mt-10">
            <button
              type="submit"
              className="text-center font-bold bg-primary text-white py-2 w-[45%] border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            >
              Submit
            </button>
          </div> */}
        </form>
      </div>
    </>
  );
}