import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";

const Registration = () => {
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

    // Print all form inputs to console
    console.log("Form inputs:", formData);

    // Immediately navigate to login page
    navigate("/Login");

    // Prevent the rest of the form submission logic
    return;

    // The rest of this code will never execute
    const isValid = Object.values(formData).every((val) =>
      typeof val === "boolean" ? val === true : val.trim() !== ""
    );
    if (!isValid) {
      alert("Please fill in all fields and agree to the privacy notice.");
      return;
    }
    setSubmitting(true);
    try {
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
      navigate("/Login");
    }, 400);
  };

  return (
    <div className="h-screen w-[75%] flex flex-col gap-12 bg-gray py-12 px-12 overflow-auto">
      <div className="w-full flex justify-between px-9">
        <h1 className="font-bold text-2xl">RHU Focal Person registration</h1>
        <div className="flex text-right flex-col">
          <p className="text-sm">STEP 01/01</p>
          <h1 className="font-bold text-gray-600">Info</h1>
        </div>
      </div>

      <form
        id="beneficiary-form"
        onSubmit={handleSubmit}
        className="bg-white p-9 flex flex-col gap-8 rounded-2xl"
      >
        <h1 className="font-bold text-2xl">Details</h1>

        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
          <div className="flex gap-2 flex-col">
            <label>LGU</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              type="text"
              required
              className="border border-gray-600 rounded-md p-2"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label>Address</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              type="text"
              required
              className="border border-gray-600 rounded-md p-2"
            />
          </div>
          <div className="flex gap-2 flex-col">
            <label className="text-gray-600">Phone Number</label>
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
                className="bg-white border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                placeholder="123-456-7890"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-col">
            <label>Email</label>
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
                required
                className="bg-white border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                placeholder="ejacc@gmail.com"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <label>Representative First Name</label>
            <input
              name="age"
              value={formData.age}
              onChange={handleChange}
              type="text"
              required
              className="border border-gray-600 rounded-md p-2"
            />
          </div>

          <div className="flex justify-end gap-2 flex-col">
            <label>Last Name</label>
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
            <label>Official Representative Name</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              type="text"
              required
              className="border border-gray-600 rounded-md p-2"
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
              className="underline text-[12px] cursor-pointer"
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
            to="/NoteRhu"
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
              Please check your messages. We've sent you an email and password
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

export default Registration;
