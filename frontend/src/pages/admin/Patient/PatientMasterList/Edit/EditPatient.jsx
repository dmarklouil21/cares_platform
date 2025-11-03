import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

const DEFAULT_CONTACT = {
  name: "",
  relationship_to_patient: "",
  landline_number: "",
  address: "",
  email: "",
  mobile_number: "",
};

function ensureTwoContacts(arr) {
  const out = Array.isArray(arr) ? [...arr] : [];
  while (out.length < 2) out.push({ ...DEFAULT_CONTACT });
  return out.slice(0, 2).map((c) => ({ ...DEFAULT_CONTACT, ...c }));
}

function normalizePatient(p = {}) {
  return {
    ...p,
    // keep strings controlled
    first_name: p.first_name ?? "",
    middle_name: p.middle_name ?? "",
    last_name: p.last_name ?? "",
    suffix: p.suffix ?? "",
    date_of_birth: p.date_of_birth ?? "",
    civil_status: p.civil_status ?? "",
    number_of_children: p.number_of_children ?? "",
    sex: p.sex ?? "Male",
    address: p.address ?? "",
    city: p.city ?? "",
    barangay: p.barangay ?? "",
    email: p.email ?? "",
    mobile_number: p.mobile_number ?? "",
    highest_educational_attainment: p.highest_educational_attainment ?? "",
    source_of_income: p.source_of_income ?? "",
    occupation: p.occupation ?? "",
    monthly_income: p.monthly_income ?? "",
    source_of_information: p.source_of_information ?? "",
    other_rafi_programs_availed: p.other_rafi_programs_availed ?? "",
    emergency_contacts: ensureTwoContacts(p.emergency_contacts),
    diagnosis:
      Array.isArray(p.diagnosis) && p.diagnosis.length > 0 ? p.diagnosis : [{}],
    historical_updates: Array.isArray(p.historical_updates)
      ? p.historical_updates
      : [],
    photo_url: p.photo_url ?? null,
  };
}

const PatientMasterListEdit = () => {
  const { patient_id } = useParams();
  const navigate = useNavigate();

  // const [form, setForm] = useState(null);
  const [form, setForm] = useState({
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
  // const [historicalUpdates, setHistoricalUpdates] = useState([]);

  const [newUpdate, setNewUpdate] = useState([
    {
      date: "",
      note: "",
    },
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

  // 2×2 photo preview (UI only; no data changes)
  const [photoUrl, setPhotoUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [errors, setErrors] = useState({});

  function handle2x2Change(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setImageFile(file);
  }

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const { data } = await api.get(`/patient/details/${patient_id}/`);
        if (!isMounted) return;

        // const normalized = normalizePatient(response.data || {});
        setForm({...data});
        // setHistoricalUpdates(normalized.historical_updates);
        setPhotoUrl(data.photo_url);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [patient_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // city change resets barangay
    if (name === "city") {
      setForm((prev) => ({
        ...prev,
        city: value,
        barangay: "",
      }));
      return;
    }

    // emergency contacts: names like "emergencyContact1.name"
    if (name.startsWith("emergencyContact")) {
      const [contactKey, field] = name.split(".");
      const index = contactKey === "emergencyContact1" ? 0 : 1;

      setForm((prev) => {
        const prevContacts = ensureTwoContacts(prev?.emergency_contacts);
        const updatedContacts = [...prevContacts];
        const current = { ...updatedContacts[index] };
        current[field] = value;
        updatedContacts[index] = current;

        return {
          ...prev,
          emergency_contacts: updatedContacts,
        };
      });
      return;
    }

    // diagnosis fields (if any in other steps)
    if (name.startsWith("cancer_diagnosis")) {
      const field = name.split("_").slice(2).join("_");
      setForm((prev) => {
        const diag =
          Array.isArray(prev?.diagnosis) && prev.diagnosis.length
            ? [...prev.diagnosis]
            : [{}];
        diag[0] = { ...(diag[0] || {}), [field]: value };
        return {
          ...prev,
          diagnosis: diag,
        };
      });
      return;
    }

    // default change
    setForm((prev) => ({
      ...prev,
      [name]: name === "number_of_children" ? parseInt(value, 10) || 0 : value,
    }));
  };

  // const handleHistoricalUpdateChange = (index, e) => {
  //   const { name, value } = e.target;
  //   const updatedUpdates = [...newUpdate];
  //   updatedUpdates[index] = {
  //     ...updatedUpdates[index],
  //     [name]: value,
  //   };
  //   setNewUpdate(updatedUpdates);
  // };

  // const addHistoricalUpdate = () => {
  //   setNewUpdate((prev) => [
  //     ...prev,
  //     {
  //       date: "",
  //       note: "",
  //     },
  //   ]);
  // };

  // const removeNewHistoricalUpdate = (index) => {
  //   setNewUpdate((prev) => prev.filter((_, i) => i !== index));
  // };

  // const removeHistoricalUpdate = (index) => {
  //   setHistoricalUpdates((prev) => prev.filter((_, i) => i !== index));
  // };

  const validate = () => {
    // Add validation logic here if needed
    // return true;
    // Required fields
    const newErrors = {};
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

    if (form["date_of_birth"] > new Date().toISOString().split('T')[0])
      newErrors["date_of_birth"] = "Date should not be in the future.";

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
      if (!contact.email.trim()) {
        newErrors[`emergency_contact_${index}_email`] = "Email is required.";
      }
      if (!contact.mobile_number.trim()) {
        newErrors[`emergency_contact_${index}_mobile_number`] = "Mobile number is required.";
      }
    });

    return newErrors;
  };
  
  const handleNext = () => {
    // if (!validate()) return;

    // const updatedUpdates =
    //   Array.isArray(historicalUpdates) && historicalUpdates.length > 0
    //     ? [...historicalUpdates, ...newUpdate]
    //     : [...newUpdate];

    // setHistoricalUpdates(updatedUpdates);
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    navigate(`/admin/patient/edit/${form?.patient_id}/cancer-data`, {
      state: {
        formData: {
          ...form,
          // historical_updates: updatedUpdates,
        },
        photoUrl: imageFile,
      },
    });
  };

  return (
    <>
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
      <LoadingModal open={loading} text="Submitting changes..." />

      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center bg-[#F8F9FA] overflow-auto">
        <form className="h-full w-full flex flex-col justify-between gap-5 bg[#F8F9FA]">
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between py-3 px-5 items-start md:items-center gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold">PATIENT PROFILE</h1>
                <p className="text-sm text-gray-600">
                  Patient ID:{" "}
                  <span className="font-semibold">
                    {form?.patient_id ?? "N/A"}
                  </span>
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
                      Upload 2×2 photo
                      <br />
                      <span className="text-[11px] opacity-70">JPG/PNG</span>
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
                Basic Information
              </h2>
            </div>

            <div className="flex flex-row gap-8 p-4">
              {/* Column 1 */}
              <div className="flex flex-col gap-3 w-1/2">
                <div className="w-full">
                  <label className="text-sm font-medium block mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form?.first_name ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    required
                  />
                  {errors.first_name && (
                    <span className="text-red-500 text-xs">
                      {errors.first_name}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <label className="text-sm font-medium block mb-1">
                    Middle Name 
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={form?.middle_name ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                  />
                </div>

                <div className="w-full">
                  <label className="text-sm font-medium block mb-1">
                    Birthdate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form?.date_of_birth ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    required
                  />
                  {errors.date_of_birth && (
                    <span className="text-red-500 text-xs">
                      {errors.date_of_birth}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <label className="text-sm font-medium block mb-1">
                    Civil Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="civil_status"
                    value={form?.civil_status ?? ""}
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

              {/* Column 2 */}
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={form?.last_name ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    required
                  />
                  {errors.last_name && (
                    <span className="text-red-500 text-xs">
                      {errors.last_name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Suffix
                  </label>
                  <input
                    type="text"
                    name="suffix"
                    value={form?.suffix ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">
                    Number of Children
                  </label>
                  <input
                    type="text"
                    name="number_of_children"
                    value={String(form?.number_of_children ?? "")}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Sex <span className="text-red-500">*</span></label>
                  <select
                    name="sex"
                    value={form?.sex ?? "Male"}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && (
                    <span className="text-red-500 text-xs">
                      {errors.sex}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact and Address Information Section */}
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="mb-6 mt-8 border-b border-gray-200 px-5">
              <h2 className="text-md font-bold tracking-wide uppercase pb-1">
                Contact and Address Information
              </h2>
            </div>

            <div className="flex flex-row gap-8 p-4">
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Permanent Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form?.address ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100e"
                  />
                  {errors.address && (
                    <span className="text-red-500 text-xs">
                      {errors.address}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    City/Municipality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form?.city ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100e"
                  />
                  {errors.city && (
                    <span className="text-red-500 text-xs">
                      {errors.city}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Barangay <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="barangay"
                    value={form?.barangay ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100e"
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
                  <label className="text-sm font-medium block mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={form?.email ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100e"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {errors.email}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile_number"
                    value={form?.mobile_number ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100e"
                  />
                  {errors.mobile_number && (
                    <span className="text-red-500 text-xs">
                      {errors.mobile_number}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="mb-6 mt-8 border-b border-gray-200 px-5">
              <h2 className="text-md font-bold tracking-wide uppercase pb-1">
                Additional Information
              </h2>
            </div>
            <div className="flex flex-row gap-8 p-4">
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Source of Information (Where did you hear about
                    RAFI-EJACC?) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="source_of_information"
                    value={form?.source_of_information ?? ""}
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
                    value={form?.other_rafi_programs_availed ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Socioeconomic Info Section */}
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="mb-6 mt-8 border-b border-gray-200 px-5">
              <h2 className="text-md font-bold tracking-wide uppercase pb-1">
                Socioeconomic Information
              </h2>
            </div>
            <div className="flex flex-row gap-8 p-4">
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Highest Educational Attainment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="highest_educational_attainment"
                    value={form?.highest_educational_attainment ?? ""}
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
                    Source of Income <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="source_of_income"
                    value={form?.source_of_income ?? ""}
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
                    Occupation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={form?.occupation ?? ""}
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
                    Income 
                  </label>
                  <input
                    type="text"
                    name="monthly_income"
                    value={form?.monthly_income ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="mb-6 mt-8 border-b border-gray-200 px-5">
              <h2 className="text-md font-bold tracking-wide uppercase pb-1">
                Emergency Contacts
              </h2>
            </div>
            <div className="flex flex-row gap-8 p-4">
              {/* Contact #1 */}
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact1.name"
                    value={form?.emergency_contacts?.[0]?.name ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_0_name`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_0_name`]}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Relationship to Patient <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact1.relationship_to_patient"
                    value={
                      form?.emergency_contacts?.[0]?.relationship_to_patient ??
                      ""
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_0_relationship`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_0_relationship`]}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Landline Number 
                  </label>
                  <input
                    type="text"
                    name="emergencyContact1.landline_number"
                    value={form?.emergency_contacts?.[0]?.landline_number ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact1.address"
                    value={form?.emergency_contacts?.[0]?.address ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_0_address`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_0_address`]}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact1.email"
                    value={form?.emergency_contacts?.[0]?.email ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_0_email`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_0_email`]}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact1.mobile_number"
                    value={form?.emergency_contacts?.[0]?.mobile_number ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_0_mobile_number`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_0_mobile_number`]}</span>
                  )}
                </div>
              </div>

              {/* Contact #2 */}
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.name"
                    value={form?.emergency_contacts?.[1]?.name ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_1_name`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_1_name`]}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Relationship to Patient <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.relationship_to_patient"
                    value={
                      form?.emergency_contacts?.[1]?.relationship_to_patient ??
                      ""
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_1_relationship`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_1_relationship`]}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Landline Number 
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.landline_number"
                    value={form?.emergency_contacts?.[1]?.landline_number ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.address"
                    value={form?.emergency_contacts?.[1]?.address ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_1_address`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_1_address`]}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.email"
                    value={form?.emergency_contacts?.[1]?.email ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_1_email`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_0_email`]}</span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact2.mobile_number"
                    value={form?.emergency_contacts?.[1]?.mobile_number ?? ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                  {errors[`emergency_contact_1_mobile_number`] && (
                    <span className="text-red-500 text-xs">{errors[`emergency_contact_1_mobile_number`]}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Updates Section */}
          {/* <div className="border border-black/15 p-3 bg-white rounded-sm">
            <div className="mb-6 mt-8 border-b border-gray-200 px-5">
              <h2 className="text-md font-bold tracking-wide uppercase pb-1">
                Patient Historical Updates
              </h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Add new update form *s/}
              {newUpdate.map((update, index) => (
                <div key={index} className="flex flex-col gap-3 border-b pb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold">Update #{index + 1}</h3>
                    {newUpdate.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNewHistoricalUpdate(index)}
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
                        value={update.date ?? ""}
                        onChange={(e) => handleHistoricalUpdateChange(index, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="text-sm font-medium block mb-1">
                        Notes:
                      </label>
                      <textarea
                        name="note"
                        value={update.note ?? ""}
                        onChange={(e) => handleHistoricalUpdateChange(index, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                        rows="3"
                      />
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

              {/* Updates list *s/}
              <div className="pt-4">
                <div className="mb-6 mt-8 border-b border-gray-200">
                  <h2 className="text-md font-bold tracking-wide uppercase pb-1">
                    Previous Updates
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {!historicalUpdates || historicalUpdates.length === 0 ? (
                    <p className="text-sm">No updates recorded</p>
                  ) : (
                    <ul className="space-y-2">
                      {historicalUpdates.map((update, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center bg-gray-50 p-2 rounded"
                        >
                          <div>
                            <span className="text-sm">
                              {update?.date ?? ""}
                            </span>
                            : {update?.note ?? ""}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeHistoricalUpdate(index)}
                            className="text-sm text-red-500 hover:text-red-700"
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
          </div>s */}

          <div className="w-full flex justify-around">
            <Link
              className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
              to="/admin/patient/master-list"
            >
              CANCEL
            </Link>
            <button
              type="button"
              onClick={handleNext}
              className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            >
              NEXT
            </button>
          </div>
          <br />
        </form>
      </div>
    </>
  );
};

export default PatientMasterListEdit;
