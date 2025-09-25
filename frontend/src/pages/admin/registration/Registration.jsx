import React, { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal"; // kept, but not used actively

// 🚫 Removed axios/api usage: UI-only flow
// import api from "src/api/axiosInstance";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    age: "",
    email: "",
    phone: "",
    isResident: "",
    lgu: "",
    address: "",
    agreed: false,
  });

  // UI state
  const [submitting] = useState(false); // static; no real submit
  const [loading] = useState(false); // static; no real loading

  // Confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText] = useState("Create this admin account?");
  const [confirmDesc] = useState(
    "This is a UI-only demo. No data will be saved."
  );

  // Notification
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "Registration submitted (UI only).",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Basic validation (keeps your previous rule that checkbox must be checked)
  const validate = () => {
    const allFilled = Object.values(formData).every((val) =>
      typeof val === "boolean" ? val === true : String(val).trim() !== ""
    );
    if (!allFilled) {
      setModalInfo({
        type: "info",
        title: "Incomplete Form",
        message: "Please fill in all fields and agree to the privacy notice.",
      });
      setShowModal(true);
      return false;
    }
    return true;
  };

  // 🚫 UI-only submit: open confirm instead of calling API
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  // ✅ Confirmed: show success toast; no backend, no navigation
  const handleConfirm = () => {
    setConfirmOpen(false);
    setModalInfo({
      type: "success",
      title: "Registration Submitted",
      message: "Your registration has been recorded (UI only).",
    });
    setShowModal(true);

    // Optional: clear the form
    // setFormData({
    //   firstName: "", lastName: "", birthDate: "", age: "",
    //   email: "", phone: "", isResident: "", lgu: "", address: "", agreed: false
    // });

    // Optional: navigate somewhere
    // navigate("/admin-login");
  };

  return (
    <>
      {/* Modals */}
      <ConfirmationModal
        open={confirmOpen}
        title={confirmText}
        desc={confirmDesc}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      {/* Kept for parity; not actually used since no backend */}
      <LoadingModal open={loading} text="Submitting your data..." />

      <div className="lg:w-[75%] flex flex-col bg-gray py-12 overflow-auto h-screen md:min-h-screen gap-3 md:gap-12 md:px-12 px-5">
        <div className="w-full flex justify-between px-9">
          <h1 className="font-bold text-[12px] md:text-2xl">
            Admin registration
          </h1>
        </div>

        <form
          id="beneficiary-form"
          onSubmit={handleSubmit}
          className="bg-white p-5 md:p-9 flex flex-col gap-8 rounded-2xl"
        >
          <h1 className="font-bold md:text-2xl">Personal Details</h1>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:gap-x-10">
            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                required
                className="border border-gray-600 rounded-md p-2 text-[12px] md:text-[16px]"
              />
            </div>

            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                required
                className="border border-gray-600 rounded-md p-2 text-[12px] md:text-[16px]"
              />
            </div>

            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/src/assets/images/input_icons/datebirth.svg"
                    alt="Date Icon"
                    className="md:w-5 md:h-5 w-4 h-4"
                  />
                </div>
                <input
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  type="date"
                  required
                  className="bg-white border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">Age</label>
              <input
                name="age"
                value={formData.age}
                onChange={handleChange}
                type="text"
                required
                className="border border-gray-600 rounded-md p-2 text-[12px] md:text-[16px]"
              />
            </div>

            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    src="/src/assets/images/input_icons/email.svg"
                    alt="Email Icon"
                    className="md:w-5 md:h-5 w-4 h-4"
                  />
                </div>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  className="bg-white border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                  placeholder="ejacc@gmail.com"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-col">
              <label className="text-gray-600 text-[12px] md:text-[16px]">
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
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  required
                  className="bg-white border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 text-[12px] md:text-[16px]"
                  placeholder="123-456-7890"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-col">
              <label className="text-[12px] md:text-[16px]">
                Are you a resident of Cebu (province)?
              </label>
              <p className="text-[8px] md:text-[11px] text-gray-400">
                Our cancer care services are currently limited to residents of
                Cebu.
              </p>
              <div className="relative">
                <select
                  name="isResident"
                  value={formData.isResident}
                  onChange={handleChange}
                  required
                  className="border border-gray-600 w-full rounded-md p-2 bg-white appearance-none pr-8 text-[12px] md:text-[16px]"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
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

            <div className="flex justify-end gap-2 flex-col text-[12px] md:text-[16px]">
              <label>LGU</label>
              <input
                name="lgu"
                value={formData.lgu}
                onChange={handleChange}
                type="text"
                required
                className="border border-gray-600 rounded-md p-2"
              />
            </div>

            <div className="flex gap-2 flex-col col-span-2">
              <label className="text-[12px] md:text-[16px]">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                type="text"
                required
                className="border border-gray-600 rounded-md p-2 text-[12px] md:text-[16px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <input
                name="agreed"
                type="checkbox"
                checked={formData.agreed}
                onChange={handleChange}
                required
                className="accent-primary"
              />
              <p
                className="underline text-[10px] md:text-[12px] cursor-pointer"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, agreed: !prev.agreed }))
                }
              >
                Form notice & Data privacy notice
              </p>
            </div>
          </div>

          <div className="flex justify-between w-full">
            <Link
              to="/admin-login"
              className="text-black text-center py-2 w-[45%] border hover:bg-gray border-black hover:border-white rounded-md"
            >
              BACK
            </Link>
            <button
              type="submit"
              className="text-center font-bold bg-primary text-white py-2 w-[45%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              disabled={submitting}
            >
              {submitting ? "SUBMITTING..." : "SUBMIT"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Registration;
