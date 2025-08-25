import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "src/context/AuthContext";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";

const PreScreeningForm = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setModalText('Make sure all your inputs are correct!');
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try {
        const form = document.getElementById("pre-screening-form"); 
        const formElements = form.elements;
        const data = {};

        const checkboxGroups = [
          "diagnosis_basis",
          "primary_sites",
          "distant_metastasis_sites",
          "adjuvant_treatments_received",
          "other_source_treatments"
        ];

        checkboxGroups.forEach((group) => {
          data[group] = [];
        });

        for (let i = 0; i < formElements.length; i++) {
          const element = formElements[i];
          const { name, id, type, checked, value } = element;

          if (name) {
            const isCheckboxGroup = checkboxGroups.find((group) => name.startsWith(group));
            if (type === "checkbox" && isCheckboxGroup && checked) {
              data[isCheckboxGroup].push({ name: value });
            } else if (type === "radio" && checked) {
              data[name] = value;
            } else if (type !== "checkbox" && type !== "radio") {
              data[name] = value;
            }
          } else if (id) {
            data[id] = value;
          }
        }

        setLoading(true);
        const response = await api.post("/beneficiary/individual-screening/pre-screening-form/", data);
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Your form was submitted.",
        });
        setShowModal(true);
      } catch (error) {
        /* setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: "Something went wrong while submitting the form.",
        });
        setShowModal(true); */
        let errorMessage = "Something went wrong while submitting the form."; 

        if (error.response && error.response.data) {
          // DRF ValidationError returns an object with arrays of messages
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          } //else if (typeof error.response.data === "string") {
            //errorMessage = error.response.data; // for plain text errors
          //}
        }
        setModalInfo({
          type: "error",
          title: "Submission Failed",
          message: errorMessage,
        });
        setShowModal(true);
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
        text={modalText}
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
      <LoadingModal open={loading} text="Submitting your data..." />
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-6 px-10 flex flex-col flex-1 overflow-auto">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold mb-6">Cancer Screening</h2>
            <p className="font-bold text-gray2 text-sm text-right">Cancer Data</p>
          </div>
          <form
            id="pre-screening-form"
            onSubmit={handleSubmit}
            className="bg-white p-9 flex flex-col gap-10 rounded-2xl"
          >
            <div>
              <h1 id="details_title" className="font-bold text-xl mb-5">
                Pre-Screening Form
              </h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                <div className="flex gap-2 flex-col">
                  <label>Referred From</label>
                  <input
                    type="text"
                    name="referred_from"
                    className="border-[#6B7280] border-[1px] rounded-md p-2"
                  />
                </div>
                <div className="flex gap-2 flex-col">
                  <label>Name of Referring Doctor / Facility</label>
                  <input
                    type="text"
                    name="referring_doctor_or_facility"
                    className="border-[#6B7280] border-[1px] rounded-md p-2"
                  />
                </div>
                <div className="flex gap-2 flex-col">
                  <label>Reason for Referral</label>
                  <textarea
                    name="reason_for_referral"
                    className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                  ></textarea>
                </div>
                <div className="flex gap-2 flex-col">
                  <label>Chief Complaint</label>
                  <input
                    type="text"
                    name="chief_complaint"
                    className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                  />
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
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <h1 id="details_title" className="font-bold text-xl">
                Diagnosis
              </h1>
              <p className="text-[#6B7280]">Most Valid Basis of Diagnosis:</p>
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
              <p className="text-[#6B7280]">Multiple Primaries</p>
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
              <p className="text-[#6B7280]">Primary Sites</p>
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
              <p className="text-[#6B7280]">Laterality</p>
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
                    className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
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
                    className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
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
                    className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
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
                    className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
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
                    className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
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
                  />
                  N
                  <input
                    type="text"
                    name="n_system"
                    id="nInput"
                    maxLength="1"
                    onInput={handleTNMInput}
                    className="border-b outline-none px-2 w-[20%] text-center"
                  />
                  M
                  <input
                    type="text"
                    name="m_system"
                    id="mInput"
                    maxLength="1"
                    onInput={handleTNMInput}
                    className="border-b outline-none px-2 w-[20%] text-center"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-[#6B7280]">Sites of Distant Metastasis</p>
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
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <h1 className="text-2xl font-bold">Treatment</h1>
              <p className="text-[#6B7280] text-sm">Treatment Purposes</p>
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
                    className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
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
                    className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
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
                    className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
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
                  Primary Assistance by RAFI-ELACC
                </label>
                <input
                  type="text"
                  name="primary_assistance_by_ejacc"
                  className="border-[#6B7280] border-[1px] rounded-md p-2"
                />
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
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#6B7280]">
                Planned Additional/Adjuvant Treatment/s actually received from
                RAFI-EJACC
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
                    id="unknown"
                    name="adjuvant_treatments_received_unknownTreatment"
                    value="Unknown"
                    className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                  />
                  <label htmlFor="unknown" className="text-[#374151] text-sm">
                    Unknown
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
                Treatment/s received from other sources
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
                    id="unknownOther"
                    name="other_source_treatments_unknownOther"
                    value="Unknown"
                    className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                  />
                  <label
                    htmlFor="unknownOther"
                    className="text-[#374151] text-sm"
                  >
                    Unknown
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
              <h1 className="text-2xl font-bold">Consent and Privacy</h1>
              <div className="flex justify-center items-center gap-5">
                <input
                  type="checkbox"
                  name="consentAgreement"
                  className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                />
                <label className="underline">
                  Form notice & Data privacy notice
                </label>
              </div>
            </div>
            <div className="flex w-full justify-between gap-8">
              <Link
                to="/Beneficiary/services/cancer-screening"
                className=" border  py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
              >
                Cancel
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
      </div>
    </>
  );
};

export default PreScreeningForm;
