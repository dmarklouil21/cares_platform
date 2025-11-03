import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import Notification from "src/components/Notification";
import LoadingModal from "src/components/Modal/LoadingModal";
import SystemLoader from "src/components/SystemLoader";

const PatientPreScreeningForm = () => {
  const location = useLocation();
  const record = location.state;
  const navigate = useNavigate();
  const [patient, setPatient] = useState("");
  const [pre_screening_form, setPre_screening_form] = useState("");
  const [historicalUpdates, setHistoricalUpdates] = useState([]);
  const photoUrl = location.state?.photoUrl;

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
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setPatient(record.formData);
      setPre_screening_form(record.formData.pre_screening_form);
      // setHistoricalUpdates(record.formData.historical_updates);
    }
  }, [record]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPre_screening_form((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (groupName, value) => {
    setPre_screening_form((prev) => {
      const currentValues = prev[groupName] || [];

      const exists = currentValues.some((v) => v.name === value);

      const updatedValues = exists
        ? currentValues.filter((v) => v.name !== value) // remove object
        : [...currentValues, { name: value }]; // add object

      return {
        ...prev,
        [groupName]: updatedValues,
      };
    });
  };

  const isChecked = (groupName, name) =>
    (pre_screening_form?.[groupName] || []).some((item) => item.name === name);

  const handleSave = async (e) => {
    e.preventDefault();

    // if (historicalUpdates.length > 0) {
    //   patient.historical_updates = historicalUpdates.filter(
    //     (h) => h.date && h.note
    //   );
    // }
    const form = document.getElementById("pre-screening-form"); 
    const formElements = form.elements;

    const newErrors = {}; // collect all errors here

    const checkboxGroupsInput = [
      {
        name: "diagnosis_basis",
        message: "Select at least one diagnosis basis.",
      },
      {
        name: "primary_sites",
        message: "Select at least one primary site.",
      },
      {
        name: "distant_metastasis_sites",
        message: "Select 'None' if no distant metastasis.",
      },
      {
        name: "adjuvant_treatments_received",
        message: "Select 'None' if none received.",
      },
      {
        name: "other_source_treatments",
        message: "Select 'None' if none received.",
      },
    ];

    checkboxGroupsInput.forEach((group) => {
      const boxes = Array.from(formElements).filter(
        (el) => el.name && el.name.startsWith(group.name) && el.type === "checkbox"
      );
      const isChecked = boxes.some((el) => el.checked);
      if (!isChecked) {
        newErrors[group.name] = group.message;
      }
    });

    const textFields = [
      { name: "referred_from", message: "Referred from is required." },
      {
        name: "referring_doctor_or_facility",
        message: "Name of referring doctor/facility is required.",
      },
      {
        name: "reason_for_referral",
        message: "Reason for referral is required.",
      },
      { name: "chief_complaint", message: "Chief complaint is required." },
      {
        name: "date_of_consultation",
        message: "Date of consultation/admission is required.",
      }, 
      { name: "date_of_diagnosis", message: "Date of diagnosis is required." },
      { name: "multiple_primaries", message: "This field is required." },
      { name: "histology", message: "Histology is required." },
      { name: "laterality", message: "This field is required." },
      { name: "staging", message: "Staging is required." },
      { name: "tnm_system", message: "This field is required." },
      { name: "final_diagnosis", message: "Final diagnosis is required." },
      { name: "final_diagnosis_icd10", message: "This field is required." },
      { name: "treatment_purpose", message: "This field is required." },
      { name: "primary_assistance_by_ejacc", message: "Put 'None' if none recieved." },
    ];

    textFields.forEach((field) => {
      const input = formElements[field.name];
      if (input && !input.value.trim()) {
        newErrors[field.name] = field.message;
      }
    });

    if (formElements["date_of_consultation"].value > new Date().toISOString().split('T')[0])
        newErrors["date_of_consultation"] = "Date should not be in the future.";
    if (formElements["date_of_diagnosis"].value > new Date().toISOString().split('T')[0])
        newErrors["date_of_diagnosis"] = "Date should not be in the future.";
    if (formElements["date_of_assistance"].value > new Date().toISOString().split('T')[0])
        newErrors["date_of_assistance"] = "Date should not be in the future.";
    
    if (!pre_screening_form.date_of_assistance) {
        setPre_screening_form({...pre_screening_form, date_of_assistance: null})
      // if (!data.cancer_data["date_of_assistance"])
      //           data.cancer_data["date_of_assistance"] = null
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("Validation errors:", newErrors);
      return;
    }

    setModalText("Save changes?");
    setModalDesc("Make sure all your inputs are correct!");
    setModalAction({ type: "submit" });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      setModalOpen(false);
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("cancer_data", JSON.stringify(pre_screening_form));
        formData.append("general_data", JSON.stringify(patient));
        formData.append("photo_url", photoUrl);

        const response = await api.patch(
          `/patient/update/${patient.patient_id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // setModalInfo({
        //   type: "success",
        //   title: "Success!",
        //   message: "Your form was submitted.",
        // });
        // setShowModal(true);
        navigate("/admin/patient/master-list");
      } catch (error) {
        // setModalInfo({
        //   type: "error",
        //   title: "Failed to save changes",
        //   message: "Something went wrong while submitting the form.",
        // });
        // setShowModal(true);
        let errorMessage = "Something went wrong while submitting the form.";

        if (error.response && error.response.data) {
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          } else if (error.response.data.detail)
            errorMessage = error.response.data.detail;
        }
        setNotification(errorMessage);
        setNotificationType("error");
        console.error("Error submitting a request:", error);
      } finally {
        setLoading(false);
      }
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
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
      {/* <LoadingModal open={loading} text="Submitting changes..." /> */}
      {loading && <SystemLoader />}
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center bg-[#F8F9FA] overflow-auto">
        {/* <div className=" h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Edit Patient</h1>
          <div>
            <Link to={`/admin/patient/edit/${patient.patient_id}`}>
              <img
                src="/images/back.png"
                alt="Back button icon"
                className="h-6"
              />
            </Link>
          </div>
        </div> */}
        <div className="h-full w-full flex flex-col justify-between">
          <form
            id="pre-screening-form"
            className="border border-black/15 p-3 bg-white rounded-sm"
            // onSubmit={handleSave}
          >
            <div className="mb-6 mt-8 border-b border-gray-200 px-5">
              <h2 className="text-md font-bold tracking-wide uppercase pb-1">
                Cancer Data
              </h2>
            </div>

            <div className="flex flex-col gap-8 p-4">
              <div className="flex flex-row gap-8">
                <div className="flex flex-col gap-3 w-1/2">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Referred From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="referred_from"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.referred_from}
                      onChange={handleInputChange}
                    />
                    {errors.referred_from && (
                      <span className="text-red-500 text-xs">
                        {errors.referred_from}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Reason for Referral <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="reason_for_referral"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.reason_for_referral}
                      onChange={handleInputChange}
                    ></textarea>
                    {errors.reason_for_referral && (
                      <span className="text-red-500 text-xs">
                        {errors.reason_for_referral}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Date of Consultation / Admission <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="date_of_consultation"
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50 pl-10"
                        placeholder="Select date"
                        value={pre_screening_form?.date_of_consultation}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.date_of_consultation && (
                      <span className="text-red-500 text-xs">
                        {errors.date_of_consultation}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-1/2">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Name of Referring Doctor / Facility <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="referring_doctor_or_facility"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.referring_doctor_or_facility}
                      onChange={handleInputChange}
                    />
                    {errors.referring_doctor_or_facility && (
                      <span className="text-red-500 text-xs">
                        {errors.referring_doctor_or_facility}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Chief Complaint <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      type="text"
                      name="chief_complaint"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.chief_complaint}
                      onChange={handleInputChange}
                    />
                    {errors.chief_complaint && (
                      <span className="text-red-500 text-xs">
                        {errors.chief_complaint}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Date of Diagnosis <span className="text-red-500">*</span>
                    </label> 
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="date_of_diagnosis"
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50 pl-10 pl-10"
                        placeholder="Select date"
                        value={pre_screening_form?.date_of_diagnosis}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.date_of_diagnosis && (
                      <span className="text-red-500 text-xs">
                        {errors.date_of_diagnosis}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <h1 id="details_title" className="text-md font-bold">
                  Diagnosis
                </h1>
                <p className="text-sm">
                  Most Valid Basis of Diagnosis <span className="text-red-500">*</span> {" "}
                  {errors.diagnosis_basis && (
                    <span className="text-red-500 text-xs">
                      {errors.diagnosis_basis}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-x-10 gap-y-5">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_nonMicroscopic"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "None Microscopic")}
                      onChange={() =>
                        handleCheckboxChange(
                          "diagnosis_basis",
                          "None Microscopic"
                        )
                      }
                    />
                    <label className="text-sm">Non Microscopic</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_deathCertificatesOnly"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Death Certificates Only"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "diagnosis_basis",
                          "Death Certificates Only"
                        )
                      }
                    />
                    <label className="text-sm ">Death Certificates Only</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_clinicalInvestigation"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Clinical Investigation"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "diagnosis_basis",
                          "Clinical Investigation"
                        )
                      }
                    />
                    <label className="text-sm ">Clinical Investigation</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_specificTumorMarkers"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Specific Tumor Markers"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "diagnosis_basis",
                          "Specific Tumor Markers"
                        )
                      }
                    />
                    <label className="text-sm ">Specific Tumors Makers</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_microscopic"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Microscopic")}
                      onChange={() =>
                        handleCheckboxChange("diagnosis_basis", "Microscopic")
                      }
                    />
                    <label className="text-sm ">Microscopic</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_cytologyHematology"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Cytology or Hermotology"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "diagnosis_basis",
                          "Cytology or Hermotology"
                        )
                      }
                    />
                    <label className="text-sm ">Cytology or Hermotology</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_histologyMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Histology of Metastasis"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "diagnosis_basis",
                          "Histology of Metastasis"
                        )
                      }
                    />
                    <label className="text-sm ">Histology of Metastasis</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_histologyPrimary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Histology of Primary"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "diagnosis_basis",
                          "Histology of Primary"
                        )
                      }
                    />
                    <label className="text-sm ">Histology of Primary</label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm">
                  Multiple Primaries <span className="text-red-500">*</span> {" "}
                  {errors.multiple_primaries && (
                    <span className="text-red-500 text-xs">
                      {errors.multiple_primaries}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-x-10 gap-y-5 w-fit">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={1}
                      className="w-3.5 h-3.5"
                      checked={pre_screening_form?.multiple_primaries == 1}
                      onChange={handleInputChange}
                    />
                    <label className="text-sm ">{1}</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={2}
                      className="w-3.5 h-3.5"
                      checked={pre_screening_form?.multiple_primaries == 2}
                      onChange={handleInputChange}
                    />
                    <label className="text-sm ">{2}</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={3}
                      className="w-3.5 h-3.5"
                      checked={pre_screening_form?.multiple_primaries == 3}
                      onChange={handleInputChange}
                    />
                    <label className="text-sm ">{3}</label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm">
                  Primary Sites <span className="text-red-500">*</span> {" "}
                  {errors.primary_sites && (
                    <span className="text-red-500 text-xs">
                      {errors.primary_sites}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-10 gap-y-5">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_colon"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Colon")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Colon")
                      }
                    />
                    <label className="text-sm ">Colon</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_brain"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Brain")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Brain")
                      }
                    />
                    <label className="text-sm  ">Brain</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_bladder"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Bladder")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Bladder")
                      }
                    />
                    <label className="text-sm  ">Bladder</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_skin"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Skin")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Skin")
                      }
                    />
                    <label className="text-sm  ">Skin</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_kidney"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Kidney")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Kidney")
                      }
                    />
                    <label className="text-sm  ">Kidney</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_testis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Testis")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Testis")
                      }
                    />
                    <label className="text-sm  ">Testis</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_liver"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Liver")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Liver")
                      }
                    />
                    <label className="text-sm  ">Liver</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_corpusUteri"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Corpus Uteri")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Corpus Uteri")
                      }
                    />
                    <label className="text-sm  ">Corpus Uteri</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_urinary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Urinary")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Urinary")
                      }
                    />
                    <label className="text-sm  ">Urinary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_prostate"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Prostate")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Prostate")
                      }
                    />
                    <label className="text-sm  ">Prostate</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_nasopharnyx"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Nasopharnyx")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Nasopharnyx")
                      }
                    />
                    <label className="text-sm  ">Nasopharnyx</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_oralCavity"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Oral Cavity")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Oral Cavity")
                      }
                    />
                    <label className="text-sm  ">Oral Cavity</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_ovary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Ovary")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Ovary")
                      }
                    />
                    <label className="text-sm  ">Ovary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_lung"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Lung")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Lung")
                      }
                    />
                    <label className="text-sm  ">Lung</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_gull"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Gull")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Gull")
                      }
                    />
                    <label className="text-sm  ">Gull</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_thyroid"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Thyroid")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Thyroid")
                      }
                    />
                    <label className="text-sm  ">Thyroid</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_rectum"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Rectum")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Rectum")
                      }
                    />
                    <label className="text-sm  ">Rectum</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_blood"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Blood")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Blood")
                      }
                    />
                    <label className="text-sm  ">Blood</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_stomach"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Stomach")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Stomach")
                      }
                    />
                    <label className="text-sm  ">Stomach</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_pancreas"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Pancreas")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Pancreas")
                      }
                    />
                    <label className="text-sm  ">Pancreas</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_esophagus"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Esophagus")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Esophagus")
                      }
                    />
                    <label className="text-sm  ">Esophagus</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_breast"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Breast")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Breast")
                      }
                    />
                    <label className="text-sm  ">Breast</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_uterineCervix"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Uterine Cervix")}
                      onChange={() =>
                        handleCheckboxChange("primary_sites", "Uterine Cervix")
                      }
                    />
                    <label className="text-sm  ">Uterine Cervix</label>
                  </div>
                </div>
                <div>
                  <p className="text-sm">
                    Other's, specify:
                    <input
                      type="text"
                      name="primary_sites_other"
                      className="border-b-[1px] focus:outline-none"
                      value={pre_screening_form?.primary_sites_other}
                      onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm">
                  Laterality <span className="text-red-500">*</span> {" "}
                  {errors.laterality && (
                    <span className="text-red-500 text-xs">
                      {errors.laterality}
                    </span>
                  )}
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="left"
                      name="laterality"
                      className="peer hidden"
                      value="Left"
                      checked={pre_screening_form?.laterality === "Left"}
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="left"
                      className="relative w-4 h-4 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-2 peer-checked:before:h-2 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span className="text-sm">Left</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="right"
                      name="laterality"
                      className="peer hidden"
                      value="Right"
                      checked={pre_screening_form?.laterality === "Right"}
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="right"
                      className="relative w-4 h-4 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-2 peer-checked:before:h-2 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span className="text-sm">Right</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="notsated"
                      name="laterality"
                      className="peer hidden"
                      value="Not Stated"
                      checked={pre_screening_form?.laterality === "Not Stated"}
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="notsated"
                      className="relative w-4 h-4 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-2 peer-checked:before:h-2 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span className="text-sm">Not stated</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="bilateral"
                      name="laterality"
                      className="peer hidden"
                      value="Bilateral"
                      checked={pre_screening_form?.laterality === "Bilateral"}
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="bilateral"
                      className="relative w-4 h-4 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-2 peer-checked:before:h-2 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span className="text-sm">Bilateral</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="mild"
                      name="laterality"
                      className="peer hidden"
                      value="Mild"
                      checked={pre_screening_form?.laterality === "Mild"}
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="mild"
                      className="relative w-4 h-4 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-2 peer-checked:before:h-2 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span className="text-sm">Mild</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                <div className="flex gap-2 col-span-2 flex-col">
                  <label className="text-sm">Histology(Morphology) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="histology"
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    value={pre_screening_form?.histology}
                    onChange={handleInputChange}
                  />
                  {errors.histology && (
                    <span className="text-red-500 text-xs">
                      {errors.histology}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-col">
                  <label className="text-sm">Staging <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      name="staging"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.staging}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="In-Situ">In-Situ</option>
                      <option value="Localized">Localized</option>
                      <option value="Direct Extension">Direct Extension</option>
                      <option value="Regional Lymph Node">
                        Regional Lymph Node
                      </option>
                      <option value="3+4">3+4</option>
                      <option value="Distant Metastasis">
                        Distant Metastasis
                      </option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                  {errors.staging && (
                    <span className="text-red-500 text-xs">
                      {errors.staging}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-col">
                  <label className="text-sm 700 h-8">TNM System <span className="text-red-500">*</span></label>
                  <div className="text-sm flex gap-2 items-center">
                    T
                    <input
                      type="text"
                      id="tInput"
                      name="t_system"
                      maxLength="1"
                      className="border-b outline-none px-2 w-[20%] text-center"
                      value={pre_screening_form?.t_system}
                      onChange={handleInputChange}
                    />
                    N
                    <input
                      type="text"
                      id="nInput"
                      name="n_system"
                      maxLength="1"
                      className="border-b outline-none px-2 w-[20%] text-center"
                      value={pre_screening_form?.n_system}
                      onChange={handleInputChange}
                    />
                    M
                    <input
                      type="text"
                      id="mInput"
                      name="m_system"
                      maxLength="1"
                      className="border-b outline-none px-2 w-[20%] text-center"
                      value={pre_screening_form?.m_system}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.tnm_system && (
                    <span className="text-red-500 text-xs">
                      {errors.tnm_system}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm">
                  Distant Metastasis Sites <span className="text-red-500">*</span> {" "}
                  {errors.distant_metastasis_sites && (
                    <span className="text-red-500 text-xs">
                      {errors.distant_metastasis_sites}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-x-10 gap-y-5">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_none"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "None")}
                      onChange={() =>
                        handleCheckboxChange("distant_metastasis_sites", "None")
                      }
                    />
                    <label className="text-sm">None</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_distantLymphNodes"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "distant_metastasis_sites",
                        "Destant Lymph Nodes"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "distant_metastasis_sites",
                          "Destant Lymph Nodes"
                        )
                      }
                    />
                    <label className="text-sm">Distant Lymph Nodes</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_bone"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Bone")}
                      onChange={() =>
                        handleCheckboxChange("distant_metastasis_sites", "Bone")
                      }
                    />
                    <label className="text-sm">Bone</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_liverPleura"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "distant_metastasis_sites",
                        "Liver(Pleura)"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "distant_metastasis_sites",
                          "Liver(Pleura)"
                        )
                      }
                    />
                    <label className="text-sm">Liver(Pleura)</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_kidneyMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Kidney")}
                      onChange={() =>
                        handleCheckboxChange(
                          "distant_metastasis_sites",
                          "Kidney"
                        )
                      }
                    />
                    <label className="text-sm">Kidney</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_brainMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Brain")}
                      onChange={() =>
                        handleCheckboxChange(
                          "distant_metastasis_sites",
                          "Brain"
                        )
                      }
                    />
                    <label className="text-sm">Brain</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_ovaryMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Ovary")}
                      onChange={() =>
                        handleCheckboxChange(
                          "distant_metastasis_sites",
                          "Ovary"
                        )
                      }
                    />
                    <label className="text-sm">Ovary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_skinMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Skin")}
                      onChange={() =>
                        handleCheckboxChange("distant_metastasis_sites", "Skin")
                      }
                    />
                    <label className="text-sm">Skin</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_prostateMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "distant_metastasis_sites",
                        "Prostate"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "distant_metastasis_sites",
                          "Prostate"
                        )
                      }
                    />
                    <label className="text-sm">Prostate</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_unknownMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Unknown")}
                      onChange={() =>
                        handleCheckboxChange(
                          "distant_metastasis_sites",
                          "Unknown"
                        )
                      }
                    />
                    <label className="text-sm">Unknown</label>
                  </div>
                </div>
                <div>
                  <p className="text-sm">
                    Other's, specify:
                    <input
                      type="text"
                      name="distant_metastasis_sites_other"
                      className="border-b-[1px] focus:outline-none"
                      value={pre_screening_form?.distant_metastasis_sites_other}
                      onChange={handleInputChange}
                    />
                  </p>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm">Final Diagnosis <span className="text-red-500">*</span></label>
                    <textarea
                      name="final_diagnosis"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.final_diagnosis}
                      onChange={handleInputChange}
                    />
                    {errors.final_diagnosis && (
                      <span className="text-red-500 text-xs">
                        {errors.final_diagnosis}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm">
                      Final Diagnosis: ICD-10 Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="final_diagnosis_icd10"
                      className="-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.final_diagnosis_icd10}
                      onChange={handleInputChange}
                    />
                    {errors.final_diagnosis_icd10 && (
                      <span className="text-red-500 text-xs">
                        {errors.final_diagnosis_icd10}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <h1 className="text-md font-bold">Treatment</h1>
                <p className="text-sm">
                  Treatment Purposes <span className="text-red-500">*</span> {" "}
                  {errors.treatment_purpose && (
                    <span className="text-red-500 text-xs">
                      {errors.treatment_purpose}
                    </span>
                  )}
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="curativeComplete"
                      name="treatment_purpose"
                      value="Curative-Complete"
                      className="peer hidden"
                      checked={
                        pre_screening_form?.treatment_purpose ===
                        "Curative-Complete"
                      }
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="curativeComplete"
                      className="relative w-4 h-4 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-2 peer-checked:before:h-2 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span className="text-sm">Curative-Complete</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="curativeIncomplete"
                      name="treatment_purpose"
                      value="Curative-Incomplete"
                      className="peer hidden"
                      checked={
                        pre_screening_form?.treatment_purpose ===
                        "Curative-Incomplete"
                      }
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="curativeIncomplete"
                      className="relative w-4 h-4 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-2 peer-checked:before:h-2 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span className="text-sm">Curative-Incomplete</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="palliative"
                      name="treatment_purpose"
                      value="Palliative Only"
                      className="peer hidden"
                      checked={
                        pre_screening_form?.treatment_purpose ===
                        "Palliative Only"
                      }
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="palliative"
                      className="relative w-4 h-4 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-2 peer-checked:before:h-2 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span className="text-sm">Palliative Only</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm">
                    Other's, specify:
                    <input
                      type="text"
                      name="treatment_purpose_other"
                      className="border-b-[1px] focus:outline-none"
                      value={pre_screening_form?.treatment_purpose_other}
                      onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
              <div className="flex gap-5 w-full">
                <div className="flex gap-2 flex-col w-full">
                  <label className="text-sm">
                    Primary Assistance by RAFI-ELACC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="primary_assistance_by_ejacc"
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    value={pre_screening_form?.primary_assistance_by_ejacc}
                    onChange={handleInputChange}
                  />
                  {errors.primary_assistance_by_ejacc && (
                    <span className="text-red-500 text-xs">
                      {errors.primary_assistance_by_ejacc}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-col w-full">
                  <label className="text-sm">Date of Assistance</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="date"
                      name="date_of_assistance"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50 pl-10"
                      placeholder="Select date"
                      value={pre_screening_form?.date_of_assistance}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.date_of_assistance && (
                    <span className="text-red-500 text-xs">
                      {errors.date_of_assistance}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm">
                  Planned Additional/Adjuvant Treatment/s actually received from
                  RAFI-EJACC <span className="text-red-500">*</span> {" "}
                  {errors.adjuvant_treatments_received && (
                    <span className="text-red-500 text-xs">
                      {errors.adjuvant_treatments_received}
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="surgery"
                      name="adjuvant_treatments_received_surgery"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Surgery"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "adjuvant_treatments_received",
                          "Surgery"
                        )
                      }
                    />
                    <label htmlFor="surgery" className="text-sm">
                      Surgery
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="radiotherapy"
                      name="adjuvant_treatments_received_radiotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Radiotherapy"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "adjuvant_treatments_received",
                          "Radiotherapy"
                        )
                      }
                    />
                    <label htmlFor="radiotherapy" className="text-sm">
                      Radiotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="chemotherapy"
                      name="adjuvant_treatments_received_chemotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Chemotherapy"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "adjuvant_treatments_received",
                          "Chemotherapy"
                        )
                      }
                    />
                    <label htmlFor="chemotherapy" className="text-sm">
                      Chemotherapy
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="immunotherapy"
                      name="adjuvant_treatments_received_immunotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Immunotherapy/Cytrotherapy"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "adjuvant_treatments_received",
                          "Immunotherapy/Cytrotherapy"
                        )
                      }
                    />
                    <label htmlFor="immunotherapy" className="text-sm">
                      Immunotherapy/Cytrotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="hormonal"
                      name="adjuvant_treatments_received_hormonal"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Hormonal"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "adjuvant_treatments_received",
                          "Hormonal"
                        )
                      }
                    />
                    <label htmlFor="hormonal" className="text-sm">
                      Hormonal
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="none"
                      name="adjuvant_treatments_received_noneTreatment"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "None"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "adjuvant_treatments_received",
                          "None"
                        )
                      }
                    />
                    <label htmlFor="none" className="text-sm">
                      None
                    </label>
                  </div>
                </div>
                <div>
                  <p className="text-sm">
                    Other's:
                    <input
                      type="text"
                      name="adjuvant_treatments_other"
                      className="border-b-[1px] focus:outline-none"
                      value={pre_screening_form?.adjuvant_treatments_other}
                      onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm">
                  Treatment/s received from other sources <span className="text-red-500">*</span> {" "}
                  {errors.other_source_treatments && (
                    <span className="text-red-500 text-xs">
                      {errors.other_source_treatments}
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="surgeryOther"
                      name="other_source_treatments_surgeryOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Surgery")}
                      onChange={() =>
                        handleCheckboxChange(
                          "other_source_treatments",
                          "Surgery"
                        )
                      }
                    />
                    <label htmlFor="surgeryOther" className="text-sm">
                      Surgery
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="radiotherapyOther"
                      name="other_source_treatments_radiotherapyOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "other_source_treatments",
                        "Radiotherapy"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "other_source_treatments",
                          "Radiotherapy"
                        )
                      }
                    />
                    <label htmlFor="radiotherapyOther" className="text-sm">
                      Radiotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="chemotherapyOther"
                      name="other_source_treatments_chemotherapyOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "other_source_treatments",
                        "Chemotherapy"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "other_source_treatments",
                          "Chemotherapy"
                        )
                      }
                    />
                    <label htmlFor="chemotherapyOther" className="text-sm">
                      Chemotherapy
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="immunotherapyOther"
                      name="other_source_treatments_immunotherapyOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "other_source_treatments",
                        "Immunotherapy/Cytrotherapy"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "other_source_treatments",
                          "Immunotherapy/Cytrotherapy"
                        )
                      }
                    />
                    <label htmlFor="immunotherapyOther" className="text-sm">
                      Immunotherapy/Cytrotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="other_source_treatments_hormonalOther"
                      name="hormonalOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Hormonal")}
                      onChange={() =>
                        handleCheckboxChange(
                          "other_source_treatments",
                          "Hormonal"
                        )
                      }
                    />
                    <label htmlFor="hormonalOther" className="text-sm">
                      Hormonal
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="noneOther"
                      name="other_source_treatments_noneOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "None")}
                      onChange={() =>
                        handleCheckboxChange(
                          "other_source_treatments",
                          "None"
                        )
                      }
                    />
                    <label htmlFor="noneOther" className="text-sm">
                      None
                    </label>
                  </div>
                </div>
                <div>
                  <p className="text-sm">
                    Other's:
                    <input
                      type="text"
                      name="other_source_treatments_other"
                      className="border-b-[1px] focus:outline-none"
                      value={pre_screening_form?.other_source_treatments_other}
                      onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
            </div>
          </form>
          <div className="w-full flex justify-around mt-5">
            <button
              type="button"
              className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
              onClick={() => {
                console.log("Patient ID: ", patient?.patient_id);
                navigate(`/admin/patient/edit/${patient.patient_id}`);
              }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
            >
              Save
            </button>
          </div>
          <br />
        </div>
        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
};
export default PatientPreScreeningForm;
