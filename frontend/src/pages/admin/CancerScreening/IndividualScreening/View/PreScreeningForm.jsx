import { Link } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

const ViewPreScreeningForm = () => {
  const location = useLocation();
  const record = location.state;
  const { id } = useParams();
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
      setPatient(record.patient);
      setPre_screening_form(record.patient.pre_screening_form);
    }
  }, [record]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPre_screening_form((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  console.log("Record: ", record);

  const isChecked = (groupName, name) =>
    (pre_screening_form?.[groupName] || []).some((item) => item.name === name);

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
      <div className="h-screen w-full flex flex-col justify-between items-center bg-gray overflow-auto">
        <div className="h-full w-full p-5 flex flex-col justify-between">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Pre Screening Form</h2>
          <form className="border border-black/15 p-3 bg-white rounded-lg">
            <div className="mb-6 mt-5 border-b border-gray-200 px-5">
              <h2 className="text-2xl text-yellow font-bold">
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
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.referred_from}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Reason for Referral
                    </label>
                    <textarea
                      name="reason_for_referral"
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.reason_for_referral}
                      onChange={handleInputChange}
                      readOnly
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
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50 pl-10"
                        // className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                        placeholder="Select date"
                        value={pre_screening_form?.date_of_consultation}
                        onChange={handleInputChange}
                        readOnly
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
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.referring_doctor_or_facility}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Chief Complaint
                    </label>
                    <textarea
                      type="text"
                      name="chief_complaint"
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.chief_complaint}
                      onChange={handleInputChange}
                      readOnly
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
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50 pl-10 pl-10"
                        placeholder="Select date"
                        value={pre_screening_form?.date_of_diagnosis}
                        onChange={handleInputChange}
                        readOnly
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
                      name="nonMicroscopic"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "None Microscopic")}
                      readOnly
                    />
                    <label className="text-sm">Non Microscopic</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="deathCertificatesOnly"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Death Certificates Only"
                      )}
                      readOnly
                    />
                    <label className=" text-sm">
                      Death Certificates Only
                    </label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="clinicalInvestigation"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Clinical Investigation"
                      )}
                      readOnly
                    />
                    <label className=" text-sm">
                      Clinical Investigation
                    </label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="specificTumorMarkers"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Specific Tumor Markers"
                      )}
                      readOnly
                    />
                    <label className=" text-sm">
                      Specific Tumors Makers
                    </label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="microscopic"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("diagnosis_basis", "Microscopic")}
                      readOnly
                    />
                    <label className=" text-sm">Microscopic</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="cytologyHematology"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Cytology or Hermotology"
                      )}
                      readOnly
                    />
                    <label className=" text-sm">
                      Cytology or Hermotology
                    </label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="histologyMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Histology of Metastasis"
                      )}
                      readOnly
                    />
                    <label className=" text-sm">
                      Histology of Metastasis
                    </label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="histologyPrimary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "diagnosis_basis",
                        "Histology of Primary"
                      )}
                      readOnly
                    />
                    <label className=" text-sm">
                      Histology of Primary
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className=" text-sm">Multiple Primaries</p>
                <div className="grid grid-cols-3 gap-x-10 gap-y-5 w-fit">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={1}
                      className="w-3.5 h-3.5"
                      readOnly
                      checked={pre_screening_form?.multiple_primaries == 1}
                    />
                    <label className=" text-sm">{1}</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={2}
                      className="w-3.5 h-3.5"
                      readOnly
                      checked={pre_screening_form?.multiple_primaries == 2}
                    />
                    <label className=" text-sm">{2}</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={3}
                      className="w-3.5 h-3.5"
                      checked={pre_screening_form?.multiple_primaries == 3}
                    />
                    <label className=" text-sm">{3}</label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                <p className=" text-sm">Primary Sites</p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-10 gap-y-5">
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="colon"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Colon")}
                    />
                    <label className=" text-sm">Colon</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="brain"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Brain")}
                    />
                    <label className=" text-sm">Brain</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="bladder"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Bladder")}
                    />
                    <label className=" text-sm">Bladder</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="skin"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Skin")}
                    />
                    <label className=" text-sm">Skin</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="kidney"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Kidney")}
                    />
                    <label className=" text-sm">Kidney</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="testis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Testis")}
                    />
                    <label className=" text-sm">Testis</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="liver"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Liver")}
                    />
                    <label className=" text-sm">Liver</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="corpusUteri"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Corpus Uteri")}
                    />
                    <label className=" text-sm">Corpus Uteri</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="urinary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Urinary")}
                    />
                    <label className=" text-sm">Urinary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="prostate"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Prostate")}
                    />
                    <label className=" text-sm">Prostate</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="nasopharnyx"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Nasopharnyx")}
                    />
                    <label className=" text-sm">Nasopharnyx</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="oralCavity"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Oral Cavity")}
                    />
                    <label className=" text-sm">Oral Cavity</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="ovary"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Ovary")}
                    />
                    <label className=" text-sm">Ovary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="lung"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Lung")}
                    />
                    <label className=" text-sm">Lung</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="gull"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Gull")}
                    />
                    <label className=" text-sm">Gull</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="thyroid"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Thyroid")}
                    />
                    <label className=" text-sm">Thyroid</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="rectum"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Rectum")}
                    />
                    <label className=" text-sm">Rectum</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="blood"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Blood")}
                    />
                    <label className=" text-sm">Blood</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="stomach"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Stomach")}
                    />
                    <label className=" text-sm">Stomach</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="pancreas"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Pancreas")}
                    />
                    <label className=" text-sm">Pancreas</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="esophagus"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Esophagus")}
                    />
                    <label className=" text-sm">Esophagus</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="breast"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Breast")}
                    />
                    <label className=" text-sm">Breast</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="uterineCervix"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("primary_sites", "Uterine Cervix")}
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
                      className="border-b-[1px] text-sm border-gray-700 focus:outline-none"
                      value={pre_screening_form?.primary_sites_other}
                    />
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                {/* className="text-[#6B7280]" */}
                <p className=" text-sm">Laterality</p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id="left"
                      name="laterality"
                      className="peer hidden"
                      value="Left"
                      checked={pre_screening_form?.laterality === "Left"}
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
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    value={pre_screening_form?.histology}
                  />
                </div>
                <div className="flex gap-2 flex-col">
                  <label className="text-sm">Staging</label>
                  <div className="relative">
                    <select
                      name="staging"
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.staging}
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
                  <label className="text-sm 700 h-8">TNM System</label>
                  <div className="flex gap-2 items-center text-sm">
                    T
                    <input
                      type="text"
                      id="tInput"
                      name="t_system"
                      maxLength="1"
                      className="border-b text-sm outline-none px-2 w-[20%] text-center"
                      value={pre_screening_form?.t_system}
                    />
                    N
                    <input
                      type="text"
                      id="nInput"
                      name="n_system"
                      maxLength="1"
                      className="border-b text-sm outline-none px-2 w-[20%] text-center"
                      value={pre_screening_form?.n_system}
                    />
                    M
                    <input
                      type="text"
                      id="mInput"
                      name="m_system"
                      maxLength="1"
                      className="border-b text-sm outline-none px-2 w-[20%] text-center"
                      value={pre_screening_form?.m_system}
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
                      name="none"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "None")}
                    />
                    <label className="text-sm">None</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="distantLymphNodes"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "distant_metastasis_sites",
                        "Destant Lymph Nodes"
                      )}
                    />
                    <label className="text-sm">Distant Lymph Nodes</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="bone"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Bone")}
                    />
                    <label className="text-sm">Bone</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="liverPleura"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "distant_metastasis_sites",
                        "Liver(Pleura)"
                      )}
                    />
                    <label className="text-sm">Liver(Pleura)</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="kidneyMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Kidney")}
                    />
                    <label className="text-sm">Kidney</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="brainMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Brain")}
                    />
                    <label className="text-sm">Brain</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="ovaryMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Ovary")}
                    />
                    <label className="text-sm">Ovary</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="skinMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Skin")}
                    />
                    <label className="text-sm">Skin</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="prostateMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "distant_metastasis_sites",
                        "Prostate"
                      )}
                    />
                    <label className="text-sm">Prostate</label>
                  </div>
                  <div className="flex gap-5 justify-center items-center w-fit">
                    <input
                      type="checkbox"
                      name="unknownMetastasis"
                      className="w-3.5 h-3.5 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("distant_metastasis_sites", "Unknown")}
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
                      className="border-b-[1px] text-sm border-gray-700 focus:outline-none"
                      value={pre_screening_form?.distant_metastasis_sites_other}
                    />
                  </p>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm">Final Diagnosis</label>
                    <textarea
                      name="final_diagnosis"
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.final_diagnosis}
                    ></textarea>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm">
                      Final Diagnosis: ICD-10 Code
                    </label>
                    <input
                      type="text"
                      name="final_diagnosis_icd10"
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                      value={pre_screening_form?.final_diagnosis_icd10}
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
                      checked={
                        pre_screening_form?.treatment_purpose ===
                        "Curative-Complete"
                      }
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
                      className="border-b-[1px] text-sm border-gray-700 focus:outline-none"
                      value={pre_screening_form?.treatment_purpose_other}
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
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50"
                    value={pre_screening_form?.primary_assistance_by_ejacc}
                  />
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
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-gray/50 pl-10"
                      // className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="Select date"
                      value={pre_screening_form?.date_of_assistance}
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
                      name="surgery"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Surgery"
                      )}
                    />
                    <label htmlFor="surgery" className="text-sm">
                      Surgery
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="radiotherapy"
                      name="radiotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Radiotherapy"
                      )}
                    />
                    <label htmlFor="radiotherapy" className="text-sm">
                      Radiotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="chemotherapy"
                      name="chemotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Chemotherapy"
                      )}
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
                      name="immunotherapy"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Immunotherapy/Cytrotherapy"
                      )}
                    />
                    <label htmlFor="immunotherapy" className="text-sm">
                      Immunotherapy/Cytrotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="hormonal"
                      name="hormonal"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Hormonal"
                      )}
                    />
                    <label htmlFor="hormonal" className="text-sm">
                      Hormonal
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="unknown"
                      name="unknownTreatment"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "adjuvant_treatments_received",
                        "Unknown"
                      )}
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
                      className="border-b-[1px] text-sm focus:outline-none"
                      value={pre_screening_form?.adjuvant_treatments_other}
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
                      name="surgeryOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Surgery")}
                    />
                    <label htmlFor="surgeryOther" className="text-sm">
                      Surgery
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="radiotherapyOther"
                      name="radiotherapyOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "other_source_treatments",
                        "Radiotherapy"
                      )}
                    />
                    <label
                      htmlFor="radiotherapyOther"
                      className="text-sm"
                    >
                      Radiotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="chemotherapyOther"
                      name="chemotherapyOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "other_source_treatments",
                        "Chemotherapy"
                      )}
                    />
                    <label
                      htmlFor="chemotherapyOther"
                      className="text-sm"
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
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked(
                        "other_source_treatments",
                        "Immunotherapy/Cytrotherapy"
                      )}
                    />
                    <label
                      htmlFor="immunotherapyOther"
                      className="text-sm"
                    >
                      Immunotherapy/Cytrotherapy
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="hormonalOther"
                      name="hormonalOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Hormonal")}
                    />
                    <label htmlFor="hormonalOther" className="text-sm">
                      Hormonal
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id="unknownOther"
                      name="unknownOther"
                      className="w-3.5 h-3.5 accent-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                      checked={isChecked("other_source_treatments", "Unknown")}
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
                      className="border-b-[1px] text-sm focus:outline-none"
                      value={pre_screening_form?.other_source_treatments_other}
                    />
                  </p>
                </div>
              </div>
            </div>
          </form>
          <div className="w-full flex justify-end mt-5">
            <Link
              className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
              to={`/admin/cancer-screening/view/${record?.id}`}
              // state={{ record: record }}
            >
              Back
            </Link>
          </div>
          <br />
        </div>
      </div>
    </>
  );
};
export default ViewPreScreeningForm;
