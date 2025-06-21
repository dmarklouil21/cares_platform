import { useState } from "react";
import barangayData from "../../../../constants/barangayData";
import { useNavigate } from "react-router-dom";

export default function PatinetProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    age: "",
    sex: "",
    civilStatus: "",
    children: 0,
    permanentAddress: "",
    cityMunicipality: "",
    barangay: "",
    contactNumber: "",
    email: "",
    informationSource: "",
    otherPrograms: "",
    education: "",
    occupation: "",
    incomeSource: "",
    income: "",
    emergencyContact1: {
      name: "",
      address: "",
      relationship: "",
      email: "",
      landline: "",
      phone: "",
    },
    emergencyContact2: {
      name: "",
      address: "",
      relationship: "",
      email: "",
      landline: "",
      phone: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cityMunicipality") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        barangay: "", // Reset barangay when city changes
      }));
    } else if (name.startsWith("emergencyContact1.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact1: {
          ...prev.emergencyContact1,
          [field]: value,
        },
      }));
    } else if (name.startsWith("emergencyContact2.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact2: {
          ...prev.emergencyContact2,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "children" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const getBarangays = () => {
    if (!formData.cityMunicipality) return [];
    return barangayData[formData.cityMunicipality] || [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    navigate("/Patient");
    // Add your form submission logic here
  };

  return (
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
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="border-black border-[1px] rounded-md p-2"
            />
          </div>

          {/* Middle Name */}
          <div className="flex gap-2 flex-col">
            <label className="text-black">Middle Name</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className="border-black border-[1px] rounded-md p-2"
            />
          </div>

          {/* Last Name */}
          <div className="flex gap-2 flex-col">
            <label className="text-black">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
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
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                placeholder="Select date"
              />
            </div>
          </div>

          {/* Age */}
          <div className="flex gap-2 flex-col">
            <label className="text-black">Age</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="border-black border-[1px] rounded-md p-2"
            />
          </div>

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
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className="border-black w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="single">Single</option>
                <option value="cohabitation">Co-Habitation</option>
                <option value="separated">Separated</option>
                <option value="widow">Widow/er</option>
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
              name="children"
              value={formData.children}
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
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  className="border-black border-[1px] rounded-md p-2"
                />
              </div>

              {/* City/Municipality */}
              <div className="flex gap-2 flex-col">
                <label className="text-black">City/Municipality</label>
                <div className="relative">
                  <select
                    name="cityMunicipality"
                    value={formData.cityMunicipality}
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
                    disabled={!formData.cityMunicipality}
                  >
                    <option value="">
                      {formData.cityMunicipality
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
                    name="contactNumber"
                    value={formData.contactNumber}
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
                  Source of Information (Where did you hear about RAFI-EJACC?):
                </label>
                <textarea
                  name="informationSource"
                  value={formData.informationSource}
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
                  name="otherPrograms"
                  value={formData.otherPrograms}
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
                  name="education"
                  value={formData.education}
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
                  name="incomeSource"
                  value={formData.incomeSource}
                  onChange={handleChange}
                  className="border-black border-[1px] rounded-md p-2"
                />
              </div>

              {/* Income */}
              <div className="flex gap-2 flex-col">
                <label className="text-black">Income</label>
                <input
                  type="text"
                  name="income"
                  value={formData.income}
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
                  value={formData.emergencyContact1.name}
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
                  value={formData.emergencyContact1.address}
                  onChange={handleChange}
                  className="border-black border-[1px] rounded-md p-2"
                />
              </div>

              {/* Relationship */}
              <div className="flex gap-2 flex-col">
                <label className="text-black">Relationship to Patient</label>
                <input
                  type="text"
                  name="emergencyContact1.relationship"
                  value={formData.emergencyContact1.relationship}
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
                    value={formData.emergencyContact1.email}
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
                    name="emergencyContact1.landline"
                    value={formData.emergencyContact1.landline}
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
                    name="emergencyContact1.phone"
                    value={formData.emergencyContact1.phone}
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
                  value={formData.emergencyContact2.name}
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
                  value={formData.emergencyContact2.address}
                  onChange={handleChange}
                  className="border-black border-[1px] rounded-md p-2"
                />
              </div>

              {/* Relationship */}
              <div className="flex gap-2 flex-col">
                <label className="text-black">Relationship to Patient</label>
                <input
                  type="text"
                  name="emergencyContact2.relationship"
                  value={formData.emergencyContact2.relationship}
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
                    value={formData.emergencyContact2.email}
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
                    name="emergencyContact2.landline"
                    value={formData.emergencyContact2.landline}
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
                    name="emergencyContact2.phone"
                    value={formData.emergencyContact2.phone}
                    onChange={handleChange}
                    className="bg-white border border-black text-black text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end w-full mt-10">
          <button
            type="submit"
            className="text-center font-bold bg-primary text-white py-2 w-[45%] border-[1px] border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
          >
            SUBMIT
          </button>
        </div>
      </form>
    </div>
  );
}
