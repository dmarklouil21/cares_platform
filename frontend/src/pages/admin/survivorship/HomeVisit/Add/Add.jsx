import React, { useState, useRef, useMemo, useEffect, use } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";

import api from "src/api/axiosInstance";

import SystemLoader from "src/components/SystemLoader";

/* =========================
   Searchable Select (inline)
   ========================= */
const SearchableSelect = ({
  label = "Patient Name",
  placeholder = "Search patient...",
  options = [],
  value = null,
  onChange,
  errors = {}
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  const filtered = useMemo(() => {
    if (!q) return options;
    const s = q.toLowerCase();
    return options.filter(
      (o) =>
        o.full_name.toLowerCase().includes(s) ||
        (o.email && o.email.toLowerCase().includes(s))
    );
  }, [q, options]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="w-full" ref={ref}>
      <label className="text-sm font-medium block mb-1">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <button
          type="button"
          className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-left"
          onClick={() => setOpen((o) => !o)}
        >
          {value ? value.full_name : "Select patient"}
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow">
            <div className="p-2 border-b border-gray-200">
              <input
                autoFocus
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <ul className="max-h-56 overflow-auto">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No results</li>
              )}
              {filtered.map((opt) => (
                <li
                  key={opt.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <div className="text-sm font-medium">{opt.full_name}</div>
                  <div className="text-xs text-gray-500">{opt.email}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {errors.patient && !value && (
        <span className="text-red-500 text-xs">
          {errors.patient}
        </span>
      )}
      {value && (
        <p className="text-xs text-gray-500 mt-1">
          Selected: <span className="font-medium">{value.full_name}</span>{" "}
          <span className="text-gray-400">({value.email})</span>
        </p>
      )}
    </div>
  );
};

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  rows,
  errors = {},
  readOnly=false,
  required=false,
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
      {rows ? (
        <textarea
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
          readOnly={readOnly}
        />
      )}
      {errors[name] && (
        <span className="text-red-500 text-xs">
          {errors[name]} 
        </span>
      )}
    </div>
  );
}

const HomeVisitAdd = () => {
  const [form, setForm] = useState({
    patient_id: "",
    purpose_of_visit: "",
    // findings: "",
    // recommendations: "",
    prepared_by: "",
    approved_by: "",
    status: "Pending",
    well_being_data: {}
  });

  const location = useLocation();
  const record = location?.state;

  const [patientTable, setPatientTable] = useState([]);
  const [patient, setPatient] = useState(null); // from SAMPLE_PATIENTS
  const [errors, setErrors] = useState({});
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [wellBeingData, setWellBeingData] = useState(null);

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("info");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const required = ["patient_id"];

  const fetchData = async () => {
    try {
      const response = await api.get("/patient/list/");
      setPatientTable(response.data);
      console.log("Responses: ", response.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (record?.form) {
      setForm(record.form);
    }
    if (record?.wellBeingData) {
      // setWellBeingData(record.wellBeningData);
      setForm((prev) => {
        return {
          ...prev,
          well_being_data: record.wellBeingData
        }
      })
      setPatient(record.patient);
    }
  }, [record]);
  console.log("Wellbeing Data: ", form.well_being_data);
  console.log("Record: ", record);

  const validate = () => {
    const newErrors = {};
    // Required fields
    const requiredFields = {
      prepared_by: "This field is required.",
      approved_by: "This field is required.",
      purpose_of_visit: "This field is required.",
    };

    // Validate form fields
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!form[field] || !form[field].toString().trim()) {
        newErrors[field] = message;
      }
    });
    if (!patient)
      newErrors["patient"] = "Select a patient."

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // const v = validate();
    // if (Object.keys(v).length) {
    //   setErrors(v);
    //   return;
    // }
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Errors: ", validationErrors);
      return;
    }

    setErrors({});
    
    setForm((prev) => {
      return {
        ...prev,
        patient_id: patient.patient_id
      }
    })
    setModalText("Add this home visit?");
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);
    setLoading(true);
    try {
      console.log("Form Submitted: ", form);
      await api.post("survivorship/home-visit/create/", form);
      navigate("/admin/survivorship");
    } catch (error) {
      let errorMessage = "Something went wrong while submitting the form.";
      console.log("Errors: ", error)
      if (error.response && error.response.data) {
        if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors[0];
        } else if (error.response.data.detail){
          errorMessage = error.response.data.detail;
        }
      }
      setNotification(errorMessage);
      setNotificationType("error");
      setTimeout(() => setNotification(""), 3000);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalText("");
  };

  const handleAddWellbeingForm = () => {
    navigate("/admin/survivorship/add/well-being-form", { 
      state: { form, patient }
      }
    )
  };

  return (
    <>
     {loading && <SystemLoader />}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc="Please confirm before proceeding."
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      <Notification message={notification} type={notificationType} />

      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center bg-gray overflow-auto">
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

        {/* <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Add home visit</h1>
        </div> */}

        <form
          onSubmit={handleSubmit}
          className="h-fit w-full flex flex-col gap-4"
        >
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Patient Home Visit</h2>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Input
                label="Patient ID"
                name="patient_id"
                value={patient?.patient_id}
                onChange={handleChange}
                placeholder="e.g., S-10231"
                // error={errors.patient_id}
                readOnly={true}
              />
              <SearchableSelect
                label="Patient Name"
                options={patientTable}
                value={patient}
                onChange={setPatient}
                errors={errors}
              />
              <Input
                label="Prepared by"
                name="prepared_by"
                value={form.prepared_by}
                onChange={handleChange}
                placeholder="e.g., Nurse Alma Cruz"
                errors={errors}
                required={true}
              />
              <Input
                label="Approved by"
                name="approved_by"
                value={form.approved_by}
                onChange={handleChange}
                placeholder="e.g., Dr. Thea Ramos"
                errors={errors}
                required={true}
              />
            </div>
          </div>

          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Narrative</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Input
                label="Purpose of Visit"
                name="purpose_of_visit"
                value={form.purpose_of_visit}
                onChange={handleChange}
                placeholder="Enter purpose"
                rows={3}
                errors={errors}
                required={true}
              />
              {/* <Input
                label="Findings/Observation"
                name="findings"
                value={form.findings}
                onChange={handleChange}
                placeholder="Enter findings"
                rows={4}
              />
              <Input
                label="Recommendations"
                name="recommendations"
                value={form.recommendations}
                onChange={handleChange}
                placeholder="Enter recommendations"
                rows={3}
              /> */}
            </div>
          </div>

          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Additionl Option</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex gap-2">
                <span className="font-medium w-40">Wellbeing Form</span>
                <button 
                  // to={"/admin/survivorship/add/well-being-form"}
                  // state={patient}
                  onClick={handleAddWellbeingForm}
                  className="text-blue-700 cursor-pointer"
                >
                  {Object.keys(form.well_being_data).length === 0 ? (
                    "Add"
                  ) : "Edit"
                  }
                </button>
              </div>
            </div>
          </div>
{/* Stop here for now */}
          <div className="w-full flex justify-around pb-6">
            <Link
              className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
              to="/admin/survivorship"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default HomeVisitAdd;
