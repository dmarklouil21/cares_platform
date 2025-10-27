import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import SystemLoader from "src/components/SystemLoader";

import api from "src/api/axiosInstance";

const Registration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    institution_name: "",
    email: "",
    phone_number: "",
    address: "",
    representative_first_name: "",
    representative_last_name: "",
    agreed: false,
  });

  const [showPopup, setShowPopup] = useState(false);
  const [animationClass, setAnimationClass] = useState("bounce-in");
  const [submitting, setSubmitting] = useState(false);

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
    
  const validate = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = {
      representative_first_name: "First name is required.",
      representative_last_name: "Last name is required.",
      address: "Address is required.",
      institution_name: "Institution name is required.",
      email: "Email is required.",
      phone_number: "Phone number is required.",
      agreed: "You must agree to the privacy notice.",
    };

    // Validate form fields
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] = message;
      }
    });

    // Validate photo
    // if (!photoUrl) {
    //   newErrors.photoUrl = "2×2 photo is required.";
    // }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // const isValid = Object.values(formData).every((val) =>
    //   typeof val === "boolean" ? val === true : val.trim() !== ""
    // );
    // if (!isValid) {
    //   // alert("Please fill in all fields and agree to the privacy notice.");
    //   setModalInfo({
    //     type: "info",
    //     title: "Note",
    //     message: "Please fill in all fields and agree to the privacy notice.",
    //   });
    //   setShowModal(true);
    //   return;
    // }
    // setSubmitting(true);
    setLoading(true);
    try {
      const payload = {
        institution_name: formData.institution_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        first_name: formData.representative_first_name,
        last_name: formData.representative_last_name,
      };
      await api.post("/api/registration/private-register/", payload);
      setAnimationClass("bounce-in");
      setShowPopup(true);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // alert(error.response.data.message);
        setModalInfo({
          type: "error",
          title: "Registration Failed",
          message: error.response.data.message,
        });
        setShowModal(true);
      } else {
        // alert("Registration failed. Please try again later.");
        setModalInfo({
          type: "error",
          title: "Registration Failed",
          message: "Something went wrong while submitting your form",
        });
        setShowModal(true);
      }
    } finally {
      // setSubmitting(false);
      setLoading(false);
    }
  };

  const handleOk = () => {
    setAnimationClass("bounce-out");
    setTimeout(() => {
      setShowPopup(false);
      navigate("/private-login");
    }, 400);
  };

  return (
    <>
      {loading && <SystemLoader />}

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      <div className=" w-full lg:w-[75%] flex flex-col  bg-gray py-12  overflow-auto h-screen lg:min-h-screen gap-3 md:gap-12 md:px-12 px-5">
        {/* <div className="w-full flex justify-between px-9">
          <h1 className="font-bold text-[15px] md:text-2xl">
            Private/Partner Registration
          </h1>
          <div className="flex text-right flex-col">
            <p className="text-[10px] md:text-sm">STEP 01/01</p>
            <h1 className="font-bold text-gray-600 text-[12px] md:text-[16px]">
              Info
            </h1>
          </div>
        </div> */}

        <form
          id="beneficiary-form"
          onSubmit={handleSubmit}
          className="bg-white p-5 md:p-9 flex flex-col gap-8 rounded-2xl "
        >
          <h1 className="font-bold md:text-2xl">Provide Details</h1>

          <div className="grid grid-cols-2 md:gap-x-10 gap-y-5 gap-x-4">
            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">Institution Name</label>
              <input
                name="institution_name"
                value={formData.institution_name}
                onChange={handleChange}
                type="text"
                className="border border-gray-600 rounded-md p-2
                text-[14px] md:text-[16px]
                "
              />
               {errors.institution_name && (
                <span className="text-red-500 text-xs">
                  {errors.institution_name}
                </span>
              )}
            </div>

            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/src/assets/images/input_icons/email.svg"
                    alt="Email Icon"
                    className="w-5 h-5"
                  />
                </div>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  className="bg-white border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                  placeholder="ejacc@gmail.com"
                />
              </div>
               {errors.email && (
                <span className="text-red-500 text-xs">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="flex gap-2 flex-col">
              <label
                className="
              text-[12px] md:text-[16px]
              "
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/src/assets/images/input_icons/mobile.svg"
                    alt="Phone Icon"
                    className="w-5 h-5"
                  />
                </div>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  type="tel"
                  className="bg-white border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5
                  text-[12px] md:text-[16px]

                  "
                  placeholder="123-456-7890"
                />
              </div>
              {errors.phone_number && (
                <span className="text-red-500 text-xs">
                  {errors.phone_number}
                </span>
              )}
            </div>

            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                type="text"
                className="border border-gray-600 rounded-md p-2
                text-[14px] md:text-[16px]
                "
              />
              {errors.address && (
                <span className="text-red-500 text-xs">
                  {errors.address}
                </span>
              )}
            </div>

            <div className="flex gap-2 flex-col">
              <label className=" text-[12px] md:text-[16px]">
                Representative First Name
              </label>
              <input
                name="representative_first_name"
                value={formData.representative_first_name}
                onChange={handleChange}
                type="text"
                className="border border-gray-600 rounded-md p-2"
              />
               {errors.representative_first_name && (
                <span className="text-red-500 text-xs">
                  {errors.representative_first_name}
                </span>
              )}
            </div>

            <div className="flex justify-end gap-2 flex-col">
              <label className=" text-[12px] md:text-[16px]">Last Name</label>
              <input
                name="representative_last_name"
                value={formData.representative_last_name}
                onChange={handleChange}
                type="text"
                className="border border-gray-600 rounded-md p-2"
              />
               {errors.representative_last_name && (
                <span className="text-red-500 text-xs">
                  {errors.representative_last_name}
                </span>
              )}
            </div>

            {/* <div className="flex gap-2 flex-col col-span-2">
              <label className=" text-[12px] md:text-[16px]">
                Official Representative Name
              </label>
              <input
                name="official_representative_name"
                value={formData.official_representative_name}
                onChange={handleChange}
                type="text"
                className="border border-gray-600 rounded-md p-2"
              />
            </div> */}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <input
                name="agreed"
                type="checkbox"
                checked={formData.agreed}
                onChange={handleChange}
                className="accent-primary"
              />
              <div className="flex">
                <p
                  className="underline text-[12px] cursor-pointer"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, agreed: !prev.agreed }))
                  }
                >
                  Form notice & Data privacy notice {" "}
                </p>
                {errors.agreed && (
                  <span className="ml-1 text-red-500 text-xs">
                    {errors.agreed}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between w-full">
            <Link
              to="/private-registration/note"
              className="text-black text-center py-2 w-[45%] border hover:bg-gray border-black hover:border-white rounded-md"
            >
              Back
            </Link>
            <button
              type="submit"
              className="text-center font-bold bg-primary text-white py-2 w-[45%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              disabled={submitting}
            >
              Submit
              {/* {submitting ? "SUBMITTING..." : "SUBMIT"} */}
            </button>
          </div>
        </form>

        {showPopup && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div
              className={`bg-white py-5 px-20 rounded-xl shadow-xl text-center flex flex-col items-center gap-5 ${animationClass}`}
            >
              <h2 className="text-2xl font-bold text-primary">CHECK EMAIL</h2>
              <p className="text-center">
                Please check your email. We've sent you a temporary password.
                <br />
                Use it to log in and reset your password.
              </p>
              <button
                onClick={handleOk}
                className="bg-primary text-white px-6 py-2 rounded hover:bg-lightblue"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Registration;
