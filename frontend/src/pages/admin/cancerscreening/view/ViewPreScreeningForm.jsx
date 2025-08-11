import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";

const ViewPreScreeningForm = () => {
  const location = useLocation();
  const record = location.state;
  const [patient, setPatient] = useState("");
  const [pre_screening_form, setPre_screening_form] = useState("");

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

  useEffect(() => {
    if (record) {
      setPatient(record.patient)
      setPre_screening_form(record.pre_screening_form);
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

    setModalText('Save changes?');
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try { 
        setLoading(true);
        const response = await api.patch(`/cancer-screening/individual-screening/pre-screening-form/update/${pre_screening_form.id}/`, pre_screening_form);
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Your form was submitted.",
        });
        setShowModal(true);
        // navigate("/Beneficiary/services/cancer-screening");
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to save changes",
          message: "Something went wrong while submitting the form.",
        });
        setShowModal(true);
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
      <LoadingModal open={loading} text="Submitting changes..." />
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        {/* <div className="bg-white py-4 px-10 flex justify-between items-center">
          <div className="font-bold">Beneficary</div>
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <img
              src="/images/Avatar.png"
              alt="User Profile"
              className="rounded-full"
            />
          </div>
        </div> */}

        <div className="py-6 px-10 flex flex-col flex-1">
          <div className="flex justify-between p-3 items-center">
            <h2 className="text-xl font-semibold">{patient?.full_name || ""} - {patient?.patient_id}</h2>
            <Link 
              to={"/Admin/cancerscreening/view/AdminIndividualScreeningView"} 
              state={{record: record}}
            >
              <img
                src="/images/back.png"
                alt="Back button icon"
                className="h-7"
              />
            </Link>
          </div>
          <form 
            className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8 flex-1 overflow-auto"
            onSubmit={handleSave}
          >
            <div className="flex flex-col gap-6">
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
                      value={pre_screening_form?.referred_from}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex gap-2 flex-col">
                    <label>Name of Referring Doctor / Facility</label>
                    <input
                      type="text"
                      name="referring_doctor_or_facility"
                      className="border-[#6B7280] border-[1px] rounded-md p-2"
                      value={pre_screening_form?.referring_doctor_or_facility}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex gap-2 flex-col">
                    <label>Reason for Referral</label>
                    <textarea
                      name="reason_for_referral"
                      className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                      value={pre_screening_form?.reason_for_referral}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="flex gap-2 flex-col">
                    <label>Chief Complaint</label>
                    <input
                      type="text"
                      name="chief_complaint"
                      className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                      value={pre_screening_form?.chief_complaint}
                      onChange={handleInputChange}
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
                        value={pre_screening_form?.date_of_consultation}
                        onChange={handleInputChange}
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
                        value={pre_screening_form?.date_of_diagnosis}
                        onChange={handleInputChange}
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
                      name="nonMicroscopic"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "None Microscopic")}
                      onChange={() => handleCheckboxChange("diagnosis_basis", "None Microscopic")}
                    />
                    <label>Non Microscopic</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="deathCertificatesOnly"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Death Certificates Only")}
                      onChange={() => handleCheckboxChange("diagnosis_basis", "Death Certificates Only")}
                    />
                    <label>Death Certificates Only</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="clinicalInvestigation"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Clinical Investigation")}
                      onChange={() => handleCheckboxChange("diagnosis_basis", "Clinical Investigation")}
                    />
                    <label>Clinical Investigation</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="specificTumorMarkers"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Specific Tumor Markers")}
                      onChange={() => handleCheckboxChange("diagnosis_basis", "Specific Tumor Markers")}
                    />
                    <label>Specific Tumors Makers</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="microscopic"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Microscopic")}
                      onChange={() => handleCheckboxChange("diagnosis_basis", "Microscopic")}
                    />
                    <label>Microscopic</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="cytologyHematology"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Cytology or Hermotology")}
                      onChange={() => handleCheckboxChange("diagnosis_basis", "Cytology or Hermotology")}
                    />
                    <label>Cytology or Hermotology</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="histologyMetastasis"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Histology of Metastasis")}
                      onChange={() => handleCheckboxChange("diagnosis_basis", "Histology of Metastasis")}
                    />
                    <label>Histology of Metastasis</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="histologyPrimary"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Histology of Primary")}
                      onChange={() => handleCheckboxChange("diagnosis_basis", "Histology of Primary")}
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
                      checked={pre_screening_form?.multiple_primaries==1}
                      onChange={handleInputChange}
                    />
                    <label>{1}</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={2}
                      className="w-4 h-4"
                      checked={pre_screening_form?.multiple_primaries==2}
                      onChange={handleInputChange}
                    />
                    <label>{2}</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={3}
                      className="w-4 h-4"
                      checked={pre_screening_form?.multiple_primaries==3}
                      onChange={handleInputChange}
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
                      name="colon"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Colon")}
                      onChange={() => handleCheckboxChange("primary_sites", "Colon")}
                    />
                    <label>Colon</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="brain"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Brain")}
                      onChange={() => handleCheckboxChange("primary_sites", "Brain")}
                    />
                    <label>Brain</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="bladder"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Bladder")}
                      onChange={() => handleCheckboxChange("primary_sites", "Bladder")}
                    />
                    <label>Bladder</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="skin"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Skin")}
                      onChange={() => handleCheckboxChange("primary_sites", "Skin")}
                    />
                    <label>Skin</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="kidney"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Kidney")}
                      onChange={() => handleCheckboxChange("primary_sites", "Kidney")}
                    />
                    <label>Kidney</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="testis"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Testis")}
                      onChange={() => handleCheckboxChange("primary_sites", "Testis")}
                    />
                    <label>Testis</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="liver"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Liver")}
                      onChange={() => handleCheckboxChange("primary_sites", "Liver")}
                    />
                    <label>Liver</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="corpusUteri"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Corpus Uteri")}
                      onChange={() => handleCheckboxChange("primary_sites", "Corpus Uteri")}
                    />
                    <label>Corpus Uteri</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="urinary"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Urinary")}
                      onChange={() => handleCheckboxChange("primary_sites", "Urinary")}
                    />
                    <label>Urinary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="prostate"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Prostate")}
                      onChange={() => handleCheckboxChange("primary_sites", "Prostate")}
                    />
                    <label>Prostate</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="nasopharnyx"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Nasopharnyx")}
                      onChange={() => handleCheckboxChange("primary_sites", "Nasopharnyx")}
                    />
                    <label>Nasopharnyx</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="oralCavity"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Oral Cavity")}
                      onChange={() => handleCheckboxChange("primary_sites", "Oral Cavity")}
                    />
                    <label>Oral Cavity</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="ovary"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Ovary")}
                      onChange={() => handleCheckboxChange("primary_sites", "Ovary")}
                    />
                    <label>Ovary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="lung"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Lung")}
                      onChange={() => handleCheckboxChange("primary_sites", "Lung")}
                    />
                    <label>Lung</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="gull"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Gull")}
                      onChange={() => handleCheckboxChange("primary_sites", "Gull")}
                    />
                    <label>Gull</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="thyroid"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Thyroid")}
                      onChange={() => handleCheckboxChange("primary_sites", "Thyroid")}
                    />
                    <label>Thyroid</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="rectum"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Rectum")}
                      onChange={() => handleCheckboxChange("primary_sites", "Rectum")}
                    />
                    <label>Rectum</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="blood"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Blood")}
                      onChange={() => handleCheckboxChange("primary_sites", "Blood")}
                    />
                    <label>Blood</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="stomach"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Stomach")}
                      onChange={() => handleCheckboxChange("primary_sites", "Stomach")}
                    />
                    <label>Stomach</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="pancreas"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Pancreas")}
                      onChange={() => handleCheckboxChange("primary_sites", "Pancreas")}
                    />
                    <label>Pancreas</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="esophagus"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Esophagus")}
                      onChange={() => handleCheckboxChange("primary_sites", "Esophagus")}
                    />
                    <label>Esophagus</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="breast"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Breast")}
                      onChange={() => handleCheckboxChange("primary_sites", "Breast")}
                    />
                    <label>Breast</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="uterineCervix"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Uterine Cervix")}
                      onChange={() => handleCheckboxChange("primary_sites", "Uterine Cervix")}
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
                      value={pre_screening_form?.primary_sites_other}
                      onChange={handleInputChange}
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
                      className="peer hidden"
                      value="Left"
                      checked={pre_screening_form?.laterality === "Left"}
                      onChange={handleInputChange}
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
                      className="peer hidden"
                      value="Right"
                      checked={pre_screening_form?.laterality === "Right"}
                      onChange={handleInputChange}
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
                      className="peer hidden"
                      value="Not Stated"
                      checked={pre_screening_form?.laterality === "Not Stated"}
                      onChange={handleInputChange}
                    />
                    <label
                      htmlFor="notsated"
                      className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span>Not stated</span>
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
                      className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span>Bilateral</span>
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
                    value={pre_screening_form?.histology}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex gap-2 flex-col">
                  <label className="">Staging</label>
                  <div className="relative">
                    <select
                      name="staging"
                      className="border-[#6B7280] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
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
                </div>
                <div className="flex gap-2 flex-col">
                  <label className="text-[#6B7280] h-10">TNM System</label>
                  <div className="flex gap-2 items-center">
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
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-[#6B7280]">Distant Metastasis Sites</p>
                <div className="grid grid-cols-3 gap-x-10 gap-y-5">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="none"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "None")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "None")}
                    />
                    <label>None</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distantLymphNodes"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Destant Lymph Nodes")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Destant Lymph Nodes")}
                    />
                    <label>Distant Lymph Nodes</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="bone"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Bone")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Bone")}
                    />
                    <label>Bone</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="liverPleura"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Liver(Pleura)")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Liver(Pleura)")}
                    />
                    <label>Liver(Pleura)</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="kidneyMetastasis"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Kidney")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Kidney")}
                    />
                    <label>Kidney</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="brainMetastasis"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Brain")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Brain")}
                    />
                    <label>Brain</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="ovaryMetastasis"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Ovary")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Ovary")}
                    />
                    <label>Ovary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="skinMetastasis"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Skin")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Skin")}
                    />
                    <label>Skin</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="prostateMetastasis"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Prostate")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Prostate")}
                    />
                    <label>Prostate</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="unknownMetastasis"
                      className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Unknown")}
                      onChange={() => handleCheckboxChange("distant_metastasis_sites", "Unknown")}
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
                      value={pre_screening_form?.distant_metastasis_sites_other}
                      onChange={handleInputChange}
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
                      value={pre_screening_form?.final_diagnosis}
                      onChange={handleInputChange}
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
                      value={pre_screening_form?.final_diagnosis_icd10}
                      onChange={handleInputChange}
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
                      checked={pre_screening_form?.treatment_purpose === "Curative-Complete"}
                      onChange={handleInputChange}
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
                      checked={pre_screening_form?.treatment_purpose === "Curative-Incomplete"}
                      onChange={handleInputChange}
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
                      checked={pre_screening_form?.treatment_purpose === "Palliative Only"}
                      onChange={handleInputChange}
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
                      value={pre_screening_form?.treatment_purpose_other}
                      onChange={handleInputChange} 
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
                    value={pre_screening_form?.primary_assistance_by_ejacc}
                    onChange={handleInputChange}
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
                      value={pre_screening_form?.date_of_assistance}
                      onChange={handleInputChange}
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
                      name="surgery"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("adjuvant_treatments_received", "Surgery")}
                      onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Surgery")}
                    />
                    <label htmlFor="surgery" className="text-[#374151] text-sm">
                      Surgery
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="radiotherapy"
                      name="radiotherapy"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("adjuvant_treatments_received", "Radiotherapy")}
                      onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Radiotherapy")}
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
                      name="chemotherapy"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("adjuvant_treatments_received", "Chemotherapy")}
                      onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Chemotherapy")}
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
                      name="immunotherapy"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("adjuvant_treatments_received", "Immunotherapy/Cytrotherapy")}
                      onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Immunotherapy/Cytrotherapy")}
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
                      name="hormonal"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("adjuvant_treatments_received", "Hormonal")}
                      onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Hormonal")}
                    />
                    <label htmlFor="hormonal" className="text-[#374151] text-sm">
                      Hormonal
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="unknown"
                      name="unknownTreatment"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("adjuvant_treatments_received", "Unknown")}
                      onChange={() => handleCheckboxChange("adjuvant_treatments_received", "Unknown")}
                    />
                    <label htmlFor="unknown" className="text-[#374151] text-sm">
                      Unknown
                    </label>
                  </div>
                </div>
                <div>
                  <p className="text-[#6B7280] text-sm">
                    Other's:
                    <input
                      type="text"
                      name="adjuvant_treatments_other"
                      className="border-b-[1px] border-[#000] focus:outline-none"
                      value={pre_screening_form?.adjuvant_treatments_other}
                      onChange={handleInputChange}
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
                      name="surgeryOther"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Surgery")}
                      onChange={() => handleCheckboxChange("other_source_treatments", "Surgery")}
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
                      name="radiotherapyOther"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Radiotherapy")}
                      onChange={() => handleCheckboxChange("other_source_treatments", "Radiotherapy")}
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
                      name="chemotherapyOther"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Chemotherapy")}
                      onChange={() => handleCheckboxChange("other_source_treatments", "Chemotherapy")}
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
                      name="immunotherapyOther"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Immunotherapy/Cytrotherapy")}
                      onChange={() => handleCheckboxChange("other_source_treatments", "Immunotherapy/Cytrotherapy")}
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
                      name="hormonalOther"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Hormonal")}
                      onChange={() => handleCheckboxChange("other_source_treatments", "Hormonal")}
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
                      name="unknownOther"
                      className="w-4 h-4 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Unknown")}
                      onChange={() => handleCheckboxChange("other_source_treatments", "Unknown")}
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
                    Other's:
                    <input
                      type="text"
                      name="other_source_treatments_other"
                      className="border-b-[1px] border-[#000] focus:outline-none"
                      value={pre_screening_form?.other_source_treatments_other}
                      onChange={handleInputChange}
                    />
                  </p>
                </div>
              </div>
            </div>
            <div className="flex w-full justify-between gap-8">
              <Link
                className=" border  py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
                to="/Admin/cancerscreening/view/AdminIndividualScreeningView"
                state={{record: record}}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-[#749AB6] text-center font-bold text-white py-2 w-full border-[1px] border-[#749AB6] hover:border-[#C5D7E5] hover:bg-[#C5D7E5] rounded-md cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
};
export default ViewPreScreeningForm;
