import React, { useState, useRef, useMemo, useEffect, use } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import api from "src/api/axiosInstance";

import SystemLoader from "src/components/SystemLoader";

function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-xl font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/50"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Searchable Select (inline)
   ========================= */
const SearchableSelect = ({
  label = "Patient Name",
  placeholder = "Search patient...",
  options = [],
  value = null,
  onChange,
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
      <label className="text-sm font-medium block mb-1">{label}</label>
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
  error,
  readOnly=false
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
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
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

const HomeVisitAdd = () => {
  const [form, setForm] = useState({
    patient_id: "",
    // patientName: "",
    // diagnosis: "",
    // date: "",
    // time: "",
    purpose_of_visit: "",
    findings: "",
    recommendations: "",
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
  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [wellBeingData, setWellBeingData] = useState(null);

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

  /* const validate = () => {
    const e = {};
    required.forEach((k) => {
      if (!String(form[k] || "").trim()) e[k] = "Required";
    });
    return e;
  }; */

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
      alert("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
    
    // setNotification("Home visit added");
    // setTimeout(() => {
    //   setNotification("");
    //   navigate("/admin/survivorship");
    // }, 1500);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalText("");
  };

  const handleAddWellbeingForm = () => {
    navigate("/admin/survivorship/add/well-being-form", { 
      state: { wellBeingData,
        patient
        }
      }
    )
  };

  return (
    <>
     {loading && <SystemLoader />}

      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center bg-gray overflow-auto">
        {notification && (
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
        )}

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
              />
              {/* <Input
                label="Status"
                name="status"
                value={"Pending"}
                // onChange={handleChange}
                placeholder="e.g., Lara Mendoza"
                error={errors.patientName}
              /> */}
              {/* <Input
                label="Date"
                name="date"
                value={form.date}
                onChange={handleChange}
                type="date"
                error={errors.date}
              /> */}
              {/* <Input
                label="Diagnosis"
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="e.g., Breast CA post-op"
                error={errors.diagnosis}
              /> */}
              {/* <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  type="date"
                  error={errors.date}
                />
                <Input
                  label="Time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  type="time"
                  error={errors.time}
                />
              </div> */}
              <Input
                label="Prepared by"
                name="prepared_by"
                value={form.prepared_by}
                onChange={handleChange}
                placeholder="e.g., Nurse Alma Cruz"
              />
              <Input
                label="Approved by"
                name="approved_by"
                value={form.approved_by}
                onChange={handleChange}
                placeholder="e.g., Dr. Thea Ramos"
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
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Enter purpose"
                rows={3}
              />
              <Input
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
              />
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
                  className="text-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-around pb-6">
            <Link
              className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
              to="/admin/survivorship"
            >
              CANCEL
            </Link>
            <button
              type="submit"
              className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            >
              ADD
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default HomeVisitAdd;
