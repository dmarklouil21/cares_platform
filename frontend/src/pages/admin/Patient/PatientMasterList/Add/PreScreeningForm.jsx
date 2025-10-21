import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

const ViewPreScreeningForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const generalData = location.state?.formData;
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

  const [historicalUpdates, setHistoricalUpdates] = useState([]);

  useEffect(() => {
    if (generalData) {
      setHistoricalUpdates(generalData.historical_updates);
    }
  }, [generalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (historicalUpdates.length > 0) {
      generalData.historical_updates = historicalUpdates.filter(
        (h) => h.date && h.note
      );
    }

    setModalText("Submit Form?");
    setModalDesc("Make sure all your inputs are correct!");
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
          "other_source_treatments",
        ];

        checkboxGroups.forEach((group) => {
          data.cancer_data[group] = [];
        });

        for (let i = 0; i < formElements.length; i++) {
          const element = formElements[i];
          const { name, id, type, checked, value } = element;

          if (name) {
            const isCheckboxGroup = checkboxGroups.find((group) =>
              name.startsWith(group)
            );
            if (type === "checkbox" && isCheckboxGroup && checked) {
              data.cancer_data[isCheckboxGroup].push({ name: value });
            } else if (type === "radio" && checked) {
              data.cancer_data[name] = value;
            } else if (type !== "checkbox" && type !== "radio") {
              data.cancer_data[name] = value;
            }
          } else if (id) {
            data.cancer_data[id] = value;
          }
        }
        const formData = new FormData();
        formData.append("cancer_data", JSON.stringify(data.cancer_data));
        formData.append("general_data", JSON.stringify(data.general_data));
        formData.append("photoUrl", photoUrl);
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        setModalOpen(false);
        setLoading(true);

        const response = await api.post("/patient/pre-enrollment/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        navigate("/admin/patient/master-list");
      } catch (error) {
        let errorMessage = "Something went wrong while submitting the form.";

        if (error.response && error.response.data) {
          if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          }
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
      <LoadingModal open={loading} text="Submitting changes..." />
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-between items-center bg-[#F8F9FA] overflow-auto">
        {/* <div className=" h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Add Patient</h1>
          <Link
            to={"/admin/patient/add/general-data"}
            // state={{record: record}}
          >
            <img
              src="/images/back.png"
              alt="Back button icon"
              className="h-6"
            />
          </Link>
        </div> */}
        <div className="h-full w-full flex flex-col justify-between">
          <form
            id="pre-screening-form"
            className="border border-black/15 p-3 bg-white rounded-sm"
            onSubmit={handleSubmit}
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
                      Referred From
                    </label>
                    <input
                      type="text"
                      name="referred_from"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      // value={pre_screening_form?.referred_from}
                      // onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Reason for Referral
                    </label>
                    <textarea
                      name="reason_for_referral"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      // value={pre_screening_form?.reason_for_referral}
                      // onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Date of Consultation / Admission
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
                        // className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                        placeholder="Select date"
                        // value={pre_screening_form?.date_of_consultation}
                        // onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-1/2">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Name of Referring Doctor / Facility
                    </label>
                    <input
                      type="text"
                      name="referring_doctor_or_facility"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      // value={pre_screening_form?.referring_doctor_or_facility}
                      // onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Chief Complaint
                    </label>
                    <textarea
                      type="text"
                      name="chief_complaint"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      // value={pre_screening_form?.chief_complaint}
                      // onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Date of Diagnosis
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
                        // value={pre_screening_form?.date_of_diagnosis}
                        // onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <h1 id="details_title" className="text-md font-bold">
                  Diagnosis
                </h1>
                <p className="text-sm">Most Valid Basis of Diagnosis:</p>
                <div className="grid grid-cols-3 gap-x-10 gap-y-5">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_nonMicroscopic"
                      value="None Microscopic"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("diagnosis_basis", "None Microscopic")}
                      // onChange={() => handleCheckboxChange("diagnosis_basis", "None Microscopic")}
                    />
                    <label className="text-sm">Non Microscopic</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_deathCertificatesOnly"
                      value="Death Certificates Only"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("diagnosis_basis", "Death Certificates Only")}
                      // onChange={() => handleCheckboxChange("diagnosis_basis", "Death Certificates Only")}
                    />
                    <label className=" text-sm">Death Certificates Only</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_clinicalInvestigation"
                      value="Clinical Investigation"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("diagnosis_basis", "Clinical Investigation")}
                      // onChange={() => handleCheckboxChange("diagnosis_basis", "Clinical Investigation")}
                    />
                    <label className=" text-sm">Clinical Investigation</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_specificTumorMarkers"
                      value="Specific Tumor Markers"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("diagnosis_basis", "Specific Tumor Markers")}
                      // onChange={() => handleCheckboxChange("diagnosis_basis", "Specific Tumor Markers")}
                    />
                    <label className=" text-sm">Specific Tumors Makers</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_microscopic"
                      value="Microscopic"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("diagnosis_basis", "Microscopic")}
                      // onChange={() => handleCheckboxChange("diagnosis_basis", "Microscopic")}
                    />
                    <label className=" text-sm">Microscopic</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_cytologyHematology"
                      value="Cytology or Hematology"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("diagnosis_basis", "Cytology or Hermotology")}
                      // onChange={() => handleCheckboxChange("diagnosis_basis", "Cytology or Hermotology")}
                    />
                    <label className=" text-sm">Cytology or Hermotology</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_histologyMetastasis"
                      value="Histology of Metastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("diagnosis_basis", "Histology of Metastasis")}
                      // onChange={() => handleCheckboxChange("diagnosis_basis", "Histology of Metastasis")}
                    />
                    <label className=" text-sm">Histology of Metastasis</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="diagnosis_basis_histologyPrimary"
                      value="Histology of Primary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("diagnosis_basis", "Histology of Primary")}
                      // onChange={() => handleCheckboxChange("diagnosis_basis", "Histology of Primary")}
                    />
                    <label className=" text-sm">Histology of Primary</label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm">Multiple Primaries</p>
                <div className="grid grid-cols-3 gap-x-10 gap-y-5 w-fit">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={1}
                      className="w-3.5 h-3.5"
                      // checked={pre_screening_form?.multiple_primaries==1}
                      // onChange={handleInputChange}
                    />
                    <label className=" text-sm">{1}</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={2}
                      className="w-3.5 h-3.5"
                      // checked={pre_screening_form?.multiple_primaries==2}
                      // onChange={handleInputChange}
                    />
                    <label className=" text-sm">{2}</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={3}
                      className="w-3.5 h-3.5"
                      // checked={pre_screening_form?.multiple_primaries==3}
                      // onChange={handleInputChange}
                    />
                    <label className=" text-sm">{3}</label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm">Primary Sites</p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-10 gap-y-5">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_colon"
                      value="Colon"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Colon")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Colon")}
                    />
                    <label className=" text-sm">Colon</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_brain"
                      value="Brain"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Brain")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Brain")}
                    />
                    <label className=" text-sm">Brain</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_bladder"
                      value="Bladder"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Bladder")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Bladder")}
                    />
                    <label className=" text-sm">Bladder</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_skin"
                      value="Skin"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Skin")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Skin")}
                    />
                    <label className=" text-sm">Skin</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_kidney"
                      value="Kidney"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Kidney")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Kidney")}
                    />
                    <label className=" text-sm">Kidney</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_testis"
                      value="Testis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Testis")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Testis")}
                    />
                    <label className=" text-sm">Testis</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_liver"
                      value="Liver"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Liver")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Liver")}
                    />
                    <label className=" text-sm">Liver</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_corpusUteri"
                      value="Corpus Uteri"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Corpus Uteri")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Corpus Uteri")}
                    />
                    <label className=" text-sm">Corpus Uteri</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_urinary"
                      value="Urinary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Urinary")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Urinary")}
                    />
                    <label className=" text-sm">Urinary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_prostate"
                      value="Prostate"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Prostate")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Prostate")}
                    />
                    <label className=" text-sm">Prostate</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_nasopharnyx"
                      value="Nasopharnyx"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Nasopharnyx")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Nasopharnyx")}
                    />
                    <label className=" text-sm">Nasopharnyx</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_oralCavity"
                      value="Oral Cavity"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Oral Cavity")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Oral Cavity")}
                    />
                    <label className=" text-sm">Oral Cavity</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_ovary"
                      value="Ovary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Ovary")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Ovary")}
                    />
                    <label className=" text-sm">Ovary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_lung"
                      value="Lung"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Lung")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Lung")}
                    />
                    <label className=" text-sm">Lung</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_gull"
                      value="Gull"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Gull")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Gull")}
                    />
                    <label className=" text-sm">Gull</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_thyroid"
                      value="Thyroid"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Thyroid")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Thyroid")}
                    />
                    <label className=" text-sm">Thyroid</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_rectum"
                      value="Rectum"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Rectum")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Rectum")}
                    />
                    <label className=" text-sm">Rectum</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_blood"
                      value="Blood"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Blood")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Blood")}
                    />
                    <label className=" text-sm">Blood</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_stomach"
                      value="Stomach"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Stomach")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Stomach")}
                    />
                    <label className=" text-sm">Stomach</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_pancreas"
                      value="Pancreas"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Pancreas")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Pancreas")}
                    />
                    <label className=" text-sm">Pancreas</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_esophagus"
                      value="Esophagus"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Esophagus")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Esophagus")}
                    />
                    <label className=" text-sm">Esophagus</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_breast"
                      value="Breast"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Breast")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Breast")}
                    />
                    <label className=" text-sm">Breast</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="primary_sites_uterineCervix"
                      value="Uterine Cervix"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("primary_sites", "Uterine Cervix")}
                      // onChange={() => handleCheckboxChange("primary_sites", "Uterine Cervix")}
                    />
                    <label className=" text-sm">Uterine Cervix</label>
                  </div>
                </div>
                <div>
                  <p className="text-sm">
                    Other's, specify:
                    <input
                      type="text"
                      name="primary_sites_other"
                      className="border-b-[1px] focus:outline-none"
                      // value={pre_screening_form?.primary_sites_other}
                      // onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm">Laterality</p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="left"
                      name="laterality"
                      className="peer hidden"
                      value="Left"
                      // checked={pre_screening_form?.laterality === "Left"}
                      // onChange={handleInputChange}
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
                      // checked={pre_screening_form?.laterality === "Right"}
                      // onChange={handleInputChange}
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
                      // checked={pre_screening_form?.laterality === "Not Stated"}
                      // onChange={handleInputChange}
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
                      // checked={pre_screening_form?.laterality === "Bilateral"}
                      // onChange={handleInputChange}
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
                      // checked={pre_screening_form?.laterality === "Mild"}
                      // onChange={handleInputChange}
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
                  <label className="text-sm">Histology(Morphology)</label>
                  <input
                    type="text"
                    name="histology"
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    // value={pre_screening_form?.histology}
                    // onChange={handleInputChange}
                  />
                </div>
                <div className="flex gap-2 flex-col">
                  <label className="text-sm">Staging</label>
                  <div className="relative">
                    <select
                      name="staging"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      // value={pre_screening_form?.staging}
                      // onChange={handleInputChange}
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
                      <option value="Distant Metastasis">
                        Distant Metastasis
                      </option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  <label className="text-sm 700 h-8">TNM System</label>
                  <div className="flex gap-2 items-center text-gray-700">
                    T
                    <input
                      type="text"
                      id="tInput"
                      name="t_system"
                      maxLength="1"
                      className="border-b outline-none px-2 w-[20%] text-center"
                      onInput={handleTNMInput}
                      // value={pre_screening_form?.t_system}
                      // onChange={handleInputChange}
                    />
                    N
                    <input
                      type="text"
                      id="nInput"
                      name="n_system"
                      maxLength="1"
                      className="border-b outline-none px-2 w-[20%] text-center"
                      onInput={handleTNMInput}
                      // value={pre_screening_form?.n_system}
                      // onChange={handleInputChange}
                    />
                    M
                    <input
                      type="text"
                      id="mInput"
                      name="m_system"
                      maxLength="1"
                      className="border-b outline-none px-2 w-[20%] text-center"
                      onInput={handleTNMInput}
                      // value={pre_screening_form?.m_system}
                      // onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-sm">Distant Metastasis Sites</p>
                <div className="grid grid-cols-3 gap-x-10 gap-y-5">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_none"
                      value="None"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "None")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "None")}
                    />
                    <label className="text-sm">None</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_distantLymphNodes"
                      value="Destant Lymph Nodes"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Destant Lymph Nodes")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Destant Lymph Nodes")}
                    />
                    <label className="text-sm">Distant Lymph Nodes</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_bone"
                      value="Bone"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Bone")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Bone")}
                    />
                    <label className="text-sm">Bone</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_liverPleura"
                      value="Liver(Pleura)"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Liver(Pleura)")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Liver(Pleura)")}
                    />
                    <label className="text-sm">Liver(Pleura)</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_kidneyMetastasis"
                      value="Kidney"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Kidney")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Kidney")}
                    />
                    <label className="text-sm">Kidney</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_brainMetastasis"
                      value="Brain"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Brain")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Brain")}
                    />
                    <label className="text-sm">Brain</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_ovaryMetastasis"
                      value="Ovary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Ovary")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Ovary")}
                    />
                    <label className="text-sm">Ovary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_skinMetastasis"
                      value="Skin"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Skin")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Skin")}
                    />
                    <label className="text-sm">Skin</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_prostateMetastasis"
                      value="Prostate"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Prostate")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Prostate")}
                    />
                    <label className="text-sm">Prostate</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distant_metastasis_sites_unknownMetastasis"
                      value="Unknown"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("distant_metastasis_sites", "Unknown")}
                      // onChange={() => handleCheckboxChange("distant_metastasis_sites", "Unknown")}
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
                      // value={pre_screening_form?.distant_metastasis_sites_other}
                      // onChange={handleInputChange}
                    />
                  </p>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm">Final Diagnosis</label>
                    <textarea
                      name="final_diagnosis"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      // value={pre_screening_form?.final_diagnosis}
                      // onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm">
                      Final Diagnosis: ICD-10 Code
                    </label>
                    <input
                      type="text"
                      name="final_diagnosis_icd10"
                      className="-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      // value={pre_screening_form?.final_diagnosis_icd10}
                      // onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <h1 className="text-md font-bold">Treatment</h1>
                <p className="text-sm">Treatment Purposes</p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="curativeComplete"
                      name="treatment_purpose"
                      value="Curative-Complete"
                      className="peer hidden"
                      // checked={pre_screening_form?.treatment_purpose === "Curative-Complete"}
                      // onChange={handleInputChange}
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
                      // checked={pre_screening_form?.treatment_purpose === "Curative-Incomplete"}
                      // onChange={handleInputChange}
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
                      // checked={pre_screening_form?.treatment_purpose === "Palliative Only"}
                      // onChange={handleInputChange}
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
                      // value={pre_screening_form?.treatment_purpose_other}
                      // onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
              <div className="flex gap-5 w-full">
                <div className="flex gap-2 flex-col w-full">
                  <label className="text-sm">
                    Primary Assistance by RAFI-ELACC
                  </label>
                  <input
                    type="text"
                    name="primary_assistance_by_ejacc"
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    // value={pre_screening_form?.primary_assistance_by_ejacc}
                    // onChange={handleInputChange}
                  />
                </div>
                <div className="flex gap-2 flex-col w-full">
                  <label className="text-sm">Date of Assistance</label>
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
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50 pl-10"
                      // className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="Select date"
                      // value={pre_screening_form?.date_of_assistance}
                      // onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm">
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
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("adjuvant_treatments_received", "Surgery")}
                      // onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Surgery")}
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
                      value="Radiotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("adjuvant_treatments_received", "Radiotherapy")}
                      // onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Radiotherapy")}
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
                      value="Chemotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("adjuvant_treatments_received", "Chemotherapy")}
                      // onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Chemotherapy")}
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
                      value="Immunotherapy/Cytrotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("adjuvant_treatments_received", "Immunotherapy/Cytrotherapy")}
                      // onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Immunotherapy/Cytrotherapy")}
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
                      value="Hormonal"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("adjuvant_treatments_received", "Hormonal")}
                      // onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Hormonal")}
                    />
                    <label htmlFor="hormonal" className="text-sm">
                      Hormonal
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="unknown"
                      name="adjuvant_treatments_received_unknownTreatment"
                      value="Unknown"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("adjuvant_treatments_received", "Unknown")}
                      // onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Unknown")}
                    />
                    <label htmlFor="unknown" className="text-sm">
                      Unknown
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
                      // value={pre_screening_form?.adjuvant_treatments_other}
                      // onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm">
                  Treatment/s received from other sources
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="surgeryOther"
                      name="other_source_treatments_surgeryOther"
                      value="Surgery"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("other_source_treatments", "Surgery")}
                      // onChange={() => handleCheckboxChange("other_source_treatments", "Surgery")}
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
                      value="Radiotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("other_source_treatments", "Radiotherapy")}
                      // onChange={() => handleCheckboxChange("other_source_treatments", "Radiotherapy")}
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
                      value="Chemotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("other_source_treatments", "Chemotherapy")}
                      // onChange={() => handleCheckboxChange("other_source_treatments", "Chemotherapy")}
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
                      value="Immunotherapy/Cytrotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("other_source_treatments", "Immunotherapy/Cytrotherapy")}
                      // onChange={() => handleCheckboxChange("other_source_treatments", "Immunotherapy/Cytrotherapy")}
                    />
                    <label htmlFor="immunotherapyOther" className="text-sm">
                      Immunotherapy/Cytrotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="hormonalOther"
                      name="other_source_treatments_hormonalOther"
                      value="Hormonal"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("other_source_treatments", "Hormonal")}
                      // onChange={() => handleCheckboxChange("other_source_treatments", "Hormonal")}
                    />
                    <label htmlFor="hormonalOther" className="text-sm">
                      Hormonal
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="unknownOther"
                      name="other_source_treatments_unknownOther"
                      value="Unknown"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      // checked={isChecked("other_source_treatments", "Unknown")}
                      // onChange={() => handleCheckboxChange("other_source_treatments", "Unknown")}
                    />
                    <label htmlFor="unknownOther" className="text-sm">
                      Unknown
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
                      // value={pre_screening_form?.other_source_treatments_other}
                      // onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-around mt-5">
              <Link
                className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
                to="/admin/patient/add/general-data"
                // state={{record: record}}
              >
                Back
              </Link>
              <button
                type="submit"
                className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              >
                Submit
              </button>
            </div>
          </form>
          <br />
        </div>
        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
};
export default ViewPreScreeningForm;
