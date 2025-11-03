import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "src/context/AuthContext";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";

const PreScreeningForm = () => {
  // Notification Modal
  const navigate = useNavigate();
  const location = useLocation();
  const generalData = location.state?.formData;
  const photoUrl = location.state?.photoUrl;
  const state = location.state;
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
  const [modalDesc, setModalDesc] = useState("Please confirm before proceeding.");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [notificationMessage, setNotificationMessage] = useState(
    location.state?.message || ""
  );

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = document.getElementById("pre-screening-form"); 
    const formElements = form.elements;

    const newErrors = {}; // collect all errors here

    // --- Checkbox groups to validate ---
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
      {
        name: "consentAgreement",
        message: "Agree to the Data and privacy notice.",
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

    // --- Text / textarea / date inputs to validate ---
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
      { name: "primary_assistance_by_ejacc", message: "This field is required." },
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

    // --- If any errors exist, stop submission ---
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setModalText('Make sure all your inputs are correct!');
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try {
        const form = document.getElementById("pre-screening-form"); 
        const formElements = form.elements;

        const data = {
          general_data: generalData,
          cancer_data: {},
        };

        const checkboxGroups = [
          "diagnosis_basis",
          "primary_sites",
          "distant_metastasis_sites",
          "adjuvant_treatments_received",
          "other_source_treatments"
        ];

        checkboxGroups.forEach((group) => {
          data.cancer_data[group] = [];
        });

        for (let i = 0; i < formElements.length; i++) {
          const element = formElements[i];
          const { name, id, type, checked, value } = element;

          if (name) {
            const isCheckboxGroup = checkboxGroups.find((group) => name.startsWith(group));
            if (type === "checkbox" && isCheckboxGroup && checked) {
              data.cancer_data[isCheckboxGroup].push({ name: value });
            } else if (type === "radio" && checked) {
              data.cancer_data[name] = value;
            } else if (type !== "checkbox" && type !== "radio") {
              data.cancer_data[name] = value;
              if (!data.cancer_data["date_of_assistance"])
                data.cancer_data["date_of_assistance"] = null
            }
          } else if (id) {
            data.cancer_data[id] = value;
          }
        }
        const formData = new FormData()
        formData.append("cancer_data", JSON.stringify(data.cancer_data))
        formData.append("general_data", JSON.stringify(data.general_data))
        formData.append("photoUrl", photoUrl)
  
        setModalOpen(false);
        setLoading(true);
    
        const response = await api.post("/beneficiary/pre-enrollment/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        navigate("/beneficiary");

      } catch (error) {
        let errorMessage = "Something went wrong while submitting the form."; 

        if (error.response && error.response.data) {
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
            // setNotificationMessage(error.response.data.non_field_errors[0])
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }
        // setModalInfo({
        //   type: "error",
        //   title: "Submission Failed",
        //   message: errorMessage,
        // });
        // setShowModal(true);

        // setNotificationMessage(notificationMessage);
        setNotification(errorMessage);
        setNotificationType("error");
        // navigate(location.pathname, { replace: true, state: {} });
        setTimeout(() => setNotification(""), 2000);
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleTNMInput = (e) => {
    // Limit input to 1 character
    if (e.target.value.length > 1) {
      e.target.value = e.target.value.slice(0, 1);
    }
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
      <Notification message={notification} type={notificationType} />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      {/* <LoadingModal open={loading} text="Submitting your data..." /> */}
      {loading && <SystemLoader />}
      <div className="h-screen w-full lg:w-[75%] flex flex-col gap-3 md:gap-12 bg-gray py-12 px-5 overflow-auto">
        <form
          id="pre-screening-form"
          onSubmit={handleSubmit}
          className="bg-white p-9 flex flex-col gap-10 rounded-2xl"
        >
          <div>
            <h2 className="text-md font-bold border-b pb-1 mb-5">CANCER DATA</h2>
            {/* <p className="text-sm text-gray-600 italic">
              Note: Please put <span className="font-semibold">"NA"</span> for not applicable fields.
            </p>
            <br /> */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <div className="flex gap-2 flex-col">
                <label>Referred From</label>
                <input
                  type="text"
                  name="referred_from"
                  className="border-[#6B7280] border-[1px] rounded-md p-2"
                />
                {errors.referred_from && (
                  <span className="text-red-500 text-xs">
                    {errors.referred_from}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-col">
                <label>Name of Referring Doctor / Facility</label>
                <input
                  type="text"
                  name="referring_doctor_or_facility"
                  className="border-[#6B7280] border-[1px] rounded-md p-2"
                />
                {errors.referring_doctor_or_facility && (
                  <span className="text-red-500 text-xs">
                    {errors.referring_doctor_or_facility}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-col">
                <label>Reason for Referral</label>
                <textarea
                  name="reason_for_referral"
                  className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                ></textarea>
                {errors.reason_for_referral && (
                  <span className="text-red-500 text-xs">
                    {errors.reason_for_referral}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-col">
                <label>Chief Complaint</label>
                <textarea
                  name="chief_complaint"
                  className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                ></textarea>
                {errors.chief_complaint && (
                  <span className="text-red-500 text-xs">
                    {errors.chief_complaint}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-col">
                <label>Date of Consultation / Admission</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
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
                    className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    placeholder="Select date"
                  />
                </div>
                {errors.date_of_consultation && (
                  <span className="text-red-500 text-xs">
                    {errors.date_of_consultation}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-col">
                <label>Date of Diagnosis</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
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
                    className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    placeholder="Select date"

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
            <h1 id="details_title" className="font-bold">
              Diagnosis
            </h1>
            <p className="text-[#6B7280]">
              Most Valid Basis of Diagnosis {" "}
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
                  value="None Microscopic"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Non Microscopic</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="diagnosis_basis_deathCertificatesOnly"
                  value="Death Certificates Only"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Death Certificates Only</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="diagnosis_basis_clinicalInvestigation"
                  value="Clinical Investigation"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Clinical Investigation</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="diagnosis_basis_specificTumorMarkers"
                  value="Specific Tumor Markers"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Specific Tumors Makers</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="diagnosis_basis_microscopic"
                  value="Microscopic"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Microscopic</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="diagnosis_basis_cytologyHematology"
                  value="Cytology or Hematology"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Cytology or Hermotology</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="diagnosis_basis_histologyMetastasis"
                  value="Histology of Metastasis"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Histology of Metastasis</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="diagnosis_basis_histologyPrimary"
                  value="Histology of Primary"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Histology of Primary</label>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-[#6B7280]">
              Multiple Primaries {" "}
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
                  className="w-4 h-4"
                />
                <label>{1}</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="radio"
                  name="multiple_primaries"
                  value={2}
                  className="w-4 h-4"
                />
                <label>{2}</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="radio"
                  name="multiple_primaries"
                  value={3}
                  className="w-4 h-4"
                />
                <label>{3}</label>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-[#6B7280]">
              Primary Sites {" "}
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
                  value="Colon"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Colon</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_brain"
                  value="Brain"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Brain</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_bladder"
                  value="Bladder"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Bladder</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_skin"
                  value="Skin"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Skin</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_kidney"
                  value="Kidney"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Kidney</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_testis"
                  value="Testis"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Testis</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_liver"
                  value="Liver"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Liver</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_corpusUteri"
                  value="Corpus Uteri"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Corpus Uteri</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_urinary"
                  value="Urinary"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Urinary</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_prostate"
                  value="Prostate"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Prostate</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_nasopharnyx"
                  value="Nasopharnyx"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Nasopharnyx</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_oralCavity"
                  value="Oral Cavity"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Oral Cavity</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_ovary"
                  value="Ovary"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Ovary</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_lung"
                  value="Lung"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Lung</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_gull"
                  value="Gull"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Gull</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_thyroid"
                  value="Thyroid"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Thyroid</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_rectum"
                  value="Rectum"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Rectum</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_blood"
                  value="Blood"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Blood</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_stomach"
                  value="Stomach"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Stomach</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_pancreas"
                  value="Pancreas"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Pancreas</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_esophagus"
                  value="Esophagus"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Esophagus</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_breast"
                  value="Breast"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Breast</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="primary_sites_uterineCervix"
                  value="Uterine Cervix"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Uterine Cervix</label>
              </div>
            </div>
            <div>
              <p>
                Other's, specify
                <input
                  type="text"
                  name="primary_sites_other"
                  className="border-b-[1px] border-[#000]"
                />
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-[#6B7280]">
              Laterality {" "}
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
                  value="Left"
                  className="peer hidden"
                />
                <label
                  htmlFor="left"
                  className="relative w-5 h-5 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-3 peer-checked:before:h-3 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                ></label>
                <span>Left</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="radio"
                  id="right"
                  name="laterality"
                  value="Right"
                  className="peer hidden"
                />
                <label
                  htmlFor="right"
                  className="relative w-5 h-5 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-3 peer-checked:before:h-3 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                ></label>
                <span>Right</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="radio"
                  id="notsated"
                  name="laterality"
                  value="Not Stated"
                  className="peer hidden"
                />
                <label
                  htmlFor="notsated"
                  className="relative w-5 h-5 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-3 peer-checked:before:h-3 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                ></label>
                <span>Not Stated</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="radio"
                  id="bilateral"
                  name="laterality"
                  value="Bilateral"
                  className="peer hidden"
                />
                <label
                  htmlFor="bilateral"
                  className="relative w-5 h-5 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-3 peer-checked:before:h-3 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                ></label>
                <span>Bilateral</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="radio"
                  id="mild"
                  name="laterality"
                  value="Mild"
                  className="peer hidden"
                />
                <label
                  htmlFor="mild"
                  className="relative w-5 h-5 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-3 peer-checked:before:h-3 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                ></label>
                <span>Mild</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <div className="flex gap-2 col-span-2 flex-col">
              <label className="text-[#6B7280]">Histology(Morphology)</label>
              <input
                type="text"
                name="histology"
                className="border-[#6B7280] border-[1px] rounded-md p-2"
              />
              {errors.histology && (
                <span className="text-red-500 text-xs">
                  {errors.histology}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-col">
              <label className="">Staging</label>
              <div className="relative">
                <select
                  name="staging"
                  className="border-[#6B7280] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
                >
                  <option value="" disabled selected>
                    Select
                  </option>
                  <option value="In-Situ">In-Situ</option>
                  <option value="Localized">Localized</option>
                  <option value="Direct Extension">Direct Extension</option>
                  <option value="Regional Lymph Node">
                    Regional Lymph Node
                  </option>
                  <option value="3+4">3+4</option>
                  <option value="Distant Metastasis">Distant Metastasis</option>
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
              <label className="text-[#6B7280] h-10">TNM System</label>
              <div className="flex gap-2 items-center">
                T
                <input
                  type="text"
                  name="t_system"
                  id="tInput"
                  maxLength="1"
                  onInput={handleTNMInput}
                  className="border-b outline-none px-2 w-[20%] text-center"
                  required
                />
                N
                <input
                  type="text"
                  name="n_system"
                  id="nInput"
                  maxLength="1"
                  onInput={handleTNMInput}
                  className="border-b outline-none px-2 w-[20%] text-center"
                  required
                />
                M
                <input
                  type="text"
                  name="m_system"
                  id="mInput"
                  maxLength="1"
                  onInput={handleTNMInput}
                  className="border-b outline-none px-2 w-[20%] text-center"
                  required
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
            <p className="text-[#6B7280]">
              Sites of Distant Metastasis {" "}
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
                  value="None"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>None</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_distantLymphNodes"
                  value="Destant Lymph Nodes"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Destant Lymph Nodes</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_bone"
                  value="Bone"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Bone</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_liverPleura"
                  value="Liver(Pleura)"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Liver(Pleura)</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_kidneyMetastasis"
                  value="Kidney"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Kidney</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_brainMetastasis"
                  value="Brain"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Brain</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_ovaryMetastasis"
                  value="Ovary"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Ovary</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_skinMetastasis"
                  value="Skin"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Skin</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_prostateMetastasis"
                  value="Prostate"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Prostate</label>
              </div>
              <div className="flex gap-5 justify-center items-center w-fit">
                <input
                  type="checkbox"
                  name="distant_metastasis_sites_unknownMetastasis"
                  value="Unknown"
                  className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label>Unknown</label>
              </div>
            </div>
            <div>
              <p>
                Other's, specify
                <input
                  type="text"
                  name="distant_metastasis_sites_other"
                  className="border-b-[1px] border-[#000]"
                />
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-5">
                <label className="text-sm text-[#6B7280]">
                  Final Diagnosis
                </label>
                <textarea
                  name="final_diagnosis"
                  className="border-[#6B7280] border-[1px] rounded-md p-2 h-36 w-[60%] resize-none"
                ></textarea>
                {errors.final_diagnosis && (
                  <span className="text-red-500 text-xs">
                    {errors.final_diagnosis}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-5 w-[50%]">
                <label className="text-sm text-[#6B7280]">
                  Final Diagnosis: ICD-10 Code
                </label>
                <input
                  type="text"
                  name="final_diagnosis_icd10"
                  className="border-[#6B7280] border-[1px] rounded-md p-2"
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
            <h1 className="font-bold">Treatment</h1>
            <p className="text-[#6B7280] text-sm">
              Treatment Purposes {" "}
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
                />
                <label
                  htmlFor="curativeComplete"
                  className="relative w-5 h-5 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-3 peer-checked:before:h-3 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                ></label>
                <span>Curative-Complete</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="radio"
                  id="curativeIncomplete"
                  name="treatment_purpose"
                  value="Curative-Incomplete"
                  className="peer hidden"
                />
                <label
                  htmlFor="curativeIncomplete"
                  className="relative w-5 h-5 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-3 peer-checked:before:h-3 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                ></label>
                <span>Curative-Incomplete</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="radio"
                  id="palliative"
                  name="treatment_purpose"
                  value="Palliative Only"
                  className="peer hidden"
                />
                <label
                  htmlFor="palliative"
                  className="relative w-5 h-5 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-3 peer-checked:before:h-3 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                ></label>
                <span>Palliative Only</span>
              </div>
            </div>
            <div>
              <p className="text-[#6B7280] text-sm">
                Other's, specify
                <input
                  type="text"
                  name="treatment_purpose_other"
                  className="border-b-[1px] border-[#000]"
                />
              </p>
            </div>
          </div>
          <div className="flex gap-5 w-full">
            <div className="flex gap-2 flex-col w-full">
              <label className="text-[#6B7280] text-sm">
                Primary Assistance given by RAFI-ELACC
              </label>
              <input
                type="text"
                name="primary_assistance_by_ejacc"
                className="border-[#6B7280] border-[1px] rounded-md p-2"
              />
              {errors.primary_assistance_by_ejacc && (
                <span className="text-red-500 text-xs">
                  {errors.primary_assistance_by_ejacc}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-col w-full">
              <label className="text-[#6B7280] text-sm">
                Date of Assistance
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                  className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                  placeholder="Select date"
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
            <p className="text-sm text-[#6B7280]">
              Planned Additional/Adjuvant Treatment/s actually received from
              RAFI-EJACC {" "}
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
                  value="Surgery"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label htmlFor="surgery" className="text-[#374151] text-sm">
                  Surgery
                </label>
              </div>
              <div className="flex items-center gap-2 w-fit">
                <input
                  type="checkbox"
                  id="radiotherapy"
                  name="adjuvant_treatments_received_radiotherapy"
                  value="Radiotherapy"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="radiotherapy"
                  className="text-[#374151] text-sm"
                >
                  Radiotherapy
                </label>
              </div>
              <div className="flex items-center gap-2 w-fit">
                <input
                  type="checkbox"
                  id="chemotherapy"
                  name="adjuvant_treatments_received_chemotherapy"
                  value="Chemotherapy"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="chemotherapy"
                  className="text-[#374151] text-sm"
                >
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
                  value="Immunotherapy/Cytrotherapy"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="immunotherapy"
                  className="text-[#374151] text-sm"
                >
                  Immunotherapy/Cytrotherapy
                </label>
              </div>
              <div className="flex items-center gap-2 w-fit">
                <input
                  type="checkbox"
                  id="hormonal"
                  name="adjuvant_treatments_received_hormonal"
                  value="Hormonal"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label htmlFor="hormonal" className="text-[#374151] text-sm">
                  Hormonal
                </label>
              </div>
              <div className="flex items-center gap-2 w-fit">
                <input
                  type="checkbox"
                  id="none"
                  name="adjuvant_treatments_received_noneTreatment"
                  value="Unknown"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label htmlFor="unknown" className="text-[#374151] text-sm">
                  None
                </label>
              </div>
            </div>
            <div>
              <p className="text-[#6B7280] text-sm">
                Other's, specify
                <input
                  type="text"
                  name="adjuvant_treatments_other"
                  className="border-b-[1px] border-[#000] focus:outline-none"
                />
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#6B7280]">
              Treatment/s received from other sources {" "}
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
                  value="Surgery"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="surgeryOther"
                  className="text-[#374151] text-sm"
                >
                  Surgery
                </label>
              </div>
              <div className="flex items-center gap-2 w-fit">
                <input
                  type="checkbox"
                  id="radiotherapyOther"
                  name="other_source_treatments_radiotherapyOther"
                  value="Radiotherapy"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="radiotherapyOther"
                  className="text-[#374151] text-sm"
                >
                  Radiotherapy
                </label>
              </div>
              <div className="flex items-center gap-2 w-fit">
                <input
                  type="checkbox"
                  id="chemotherapyOther"
                  name="other_source_treatments_chemotherapyOther"
                  value="Chemotherapy"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="chemotherapyOther"
                  className="text-[#374151] text-sm"
                >
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
                  value="Immunotherapy/Cytrotherapy"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="immunotherapyOther"
                  className="text-[#374151] text-sm"
                >
                  Immunotherapy/Cytrotherapy
                </label>
              </div>
              <div className="flex items-center gap-2 w-fit">
                <input
                  type="checkbox"
                  id="hormonalOther"
                  name="other_source_treatments_hormonalOther"
                  value="Hormonal"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="hormonalOther"
                  className="text-[#374151] text-sm"
                >
                  Hormonal
                </label>
              </div>
              <div className="flex items-center gap-2 w-fit">
                <input
                  type="checkbox"
                  id="noneOther"
                  name="other_source_treatments_noneOther"
                  value="Unknown"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label
                  htmlFor="noneOther"
                  className="text-[#374151] text-sm"
                >
                  None
                </label>
              </div>
            </div>
            <div>
              <p className="text-[#6B7280] text-sm">
                Other's, specify
                <input
                  type="text"
                  name="other_source_treatments_other"
                  className="border-b-[1px] border-[#000] focus:outline-none"
                />
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-5">
            <h1 className="font-bold">Consent and Privacy</h1>
            <div className="flex justify-center items-center gap-2">
              <input
                type="checkbox"
                name="consentAgreement"
                className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
              />
              <label className="underline">
                Form notice & Data privacy notice
              </label>
              {errors.consentAgreement && (
                <span className="text-red-500 text-xs">
                  {errors.consentAgreement}
                </span>
              )}
            </div>
          </div>
          <div className="flex w-full justify-between gap-8">
            <Link
              to="/beneficiary/pre-enrollment"
              className=" border  py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
            >
              Back
            </Link>
            <button
              type="submit"
              className="bg-[#749AB6] text-center font-bold text-white py-2 w-full border-[1px] border-[#749AB6] hover:border-[#C5D7E5] hover:bg-[#C5D7E5] rounded-md cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PreScreeningForm;
