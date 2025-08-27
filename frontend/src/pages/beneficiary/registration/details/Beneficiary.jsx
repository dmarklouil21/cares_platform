import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";

const Info101 = () => {
  const navigate = useNavigate();

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

  const [showPopup, setShowPopup] = useState(false);
  const [animationClass, setAnimationClass] = useState("bounce-in");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = Object.values(formData).every((val) =>
      typeof val === "boolean" ? val === true : val.trim() !== ""
    );
    if (!isValid) {
      alert("Please fill in all fields and agree to the privacy notice.");
      return;
    }
    setSubmitting(true);
    try {
      // Map frontend fields to backend expected fields
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.birthDate,
        age: formData.age,
        email: formData.email,
        phone_number: formData.phone,
        address: formData.address,
        lgu: formData.lgu,
      };
      await api.post("/api/registration/register/", payload);
      setAnimationClass("bounce-in");
      setShowPopup(true);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Registration failed. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOk = () => {
    setAnimationClass("bounce-out");
    setTimeout(() => {
      setShowPopup(false);
      navigate("/beneficiary-login");
    }, 400); // same as bounce-out animation time
  };

  return (
      <div className=" lg:w-[75%] flex flex-col  bg-gray py-12  overflow-auto h-screen md:min-h-screen gap-3 md:gap-12 md:px-12 px-5">
      <div className="w-full flex justify-between px-9">
        <h1 className="font-bold text-[12px] md:text-2xl">
          Beneficiary registration
        </h1>
        <div className="flex text-right flex-col">
          <p className="text-[10px] md:text-sm">STEP 01/01</p>
          <h1 className="font-bold text-gray-600 text-[12px] md:text-[16px]">
            Info
          </h1>
        </div>
      </div>

      <form
        id="beneficiary-form"
        onSubmit={handleSubmit}
        className="bg-white p-5 md:p-9 flex flex-col gap-8 rounded-2xl"
      >
        <h1 className="font-bold md:text-2xl">Personal Details</h1>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:gap-x-10  ">
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
            <label className=" text-[12px] md:text-[16px]">Last Name</label>
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
            <label className="text-[12px] md:text-[16px]">Date of Birth</label>
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
            <label className=" text-[12px] md:text-[16px]">Age</label>
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
            <label className=" text-[12px] md:text-[16px]">Email</label>
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
            <label className="text-gray-600  text-[12px] md:text-[16px]">
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

          <div className="flex justify-end gap-2 flex-col  text-[12px] md:text-[16px] ">
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
            <label className=" text-[12px] md:text-[16px]">Address</label>
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
            to="/beneficiary-login"
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

      {showPopup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            className={`bg-white py-5 px-20 rounded-xl shadow-xl text-center flex flex-col items-center gap-5 ${animationClass}`}
          >
            <h2 className="text-2xl font-bold text-primary">CHECK SMS</h2>
            <p className="text-center">
              Please check your messages. We’ve sent you an email and password
              <br />
              to your mobile number, use them to log in and reset your password.
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
  );
};

export default Info101;
