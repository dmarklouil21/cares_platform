import { Link } from "react-router-dom";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const IndividualScreeningView = () => {
  const location = useLocation();
  const record = location.state?.record;
  const [form, setForm] = useState({});

  useEffect(() => {
    if (record) {
      setForm(record);
    }
  }, [record]);

  // Helper functions for checkboxes/radios
  const isChecked = (field, value) => {
    if (!form) return false;
    if (Array.isArray(form[field])) return form[field].includes(value);
    return false;
  };
  const isRadio = (field, value) => {
    if (!form) return false;
    return form[field] === value;
  };

  // For nested fields
  const get = (obj, path, fallback = "") => {
    return path
      .split(".")
      .reduce((o, k) => (o && o[k] !== undefined ? o[k] : fallback), obj);
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="bg-white py-4 px-10 flex justify-between items-center">
        <div className="font-bold">Admin</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>

      <div className="py-6 px-10 flex flex-col flex-1">
        <div className="flex justify-between p-3 items-center">
          <h2 className="text-xl font-semibold">{form?.name || ""}</h2>
          <Link to={"/Admin/cancerscreening/AdminIndividualScreening"}>
            <img
              src="/images/back.png"
              alt="Back button icon"
              className="h-7"
            />
          </Link>
        </div>
        <form className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8 flex-1 overflow-auto">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold text-secondary">
              INDIVIDUAL SCREENING
            </h3>
            <p className="text-gray2 ">
              Monitor and manage cancer screening procedures, generate LOA, and
              upload diagnostic results.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h1 className="font-bold text-xl">Screening Procedure</h1>
            <div className="flex flex-col gap-2">
              <label htmlFor="screeningprocedure">Screening Procedure:</label>
              <input
                type="text"
                name="screeningprocedure"
                id="screeningprocedure"
                placeholder="ex: Mammogram, MRI"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={form?.screeningProcedure || ""}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="proceduredetials">Procedure Details</label>
              <input
                type="text"
                name="proceduredetials"
                id="proceduredetials"
                placeholder="ex: Breast screening due to palpable mass"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={form?.procedureDetails || ""}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="cancetsite">Cancer Site</label>
              <input
                type="text"
                name="cancetsite"
                id="cancetsite"
                placeholder="ex: Breast"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={form?.cancerSite || ""}
                readOnly
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h1 className="font-bold text-xl">Requirements/Attachments</h1>
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-6 flex flex-row gap-4 flex-wrap items-center justify-start min-h-[120px]">
              {Array.isArray(form?.requirements) &&
              form.requirements.length > 0 ? (
                form.requirements.map((file, idx) => (
                  <div
                    key={idx}
                    className="w-32 h-32 bg-white rounded-lg shadow flex flex-col items-center justify-center cursor-pointer border border-gray-200 hover:shadow-lg transition"
                    title={file.name}
                    onClick={() => window.open(file.url, "_blank")}
                  >
                    {file.type === "image" ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-16 h-16 object-contain mb-2"
                      />
                    ) : file.type === "pdf" ? (
                      <img
                        src="/src/assets/images/admin/cancerscreening/individualscreening/pdf.svg"
                        alt="PDF"
                        className="w-12 h-12 mb-2"
                      />
                    ) : file.type === "doc" ? (
                      <img
                        src="/src/assets/images/admin/cancerscreening/individualscreening/docs.svg"
                        alt="DOC"
                        className="w-12 h-12 mb-2"
                      />
                    ) : (
                      <span className="w-12 h-12 mb-2 bg-gray-300 rounded" />
                    )}
                    <span className="text-xs text-center break-all px-1">
                      {file.name}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-gray-400">No files uploaded</span>
              )}
            </div>
            <div>
              <h1 id="details_title" className="font-bold text-xl mb-5">
                Pre-Screening Details
              </h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                <div className="flex gap-2 flex-col">
                  <label>Referred From</label>
                  <input
                    type="text"
                    name="referredFrom"
                    className="border-[#6B7280] border-[1px] rounded-md p-2"
                    value={get(form, "preScreeningDetails.referredFrom")}
                    readOnly
                  />
                </div>
                <div className="flex gap-2 flex-col">
                  <label>Name of Referring Doctor / Facility</label>
                  <input
                    type="text"
                    name="referringDoctor"
                    className="border-[#6B7280] border-[1px] rounded-md p-2"
                    value={get(form, "preScreeningDetails.referringDoctor")}
                    readOnly
                  />
                </div>
                <div className="flex gap-2 flex-col">
                  <label>Reason for Referral</label>
                  <textarea
                    name="referralReason"
                    className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                    value={get(form, "preScreeningDetails.referralReason")}
                    readOnly
                  ></textarea>
                </div>
                <div className="flex gap-2 flex-col">
                  <label>Chief Complaint</label>
                  <input
                    type="text"
                    name="chiefComplaint"
                    className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                    value={get(form, "preScreeningDetails.chiefComplaint")}
                    readOnly
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
                      name="consultationDate"
                      className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="Select date"
                      value={get(form, "preScreeningDetails.consultationDate")}
                      readOnly
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
                      name="diagnosisDate"
                      className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="Select date"
                      value={get(form, "preScreeningDetails.diagnosisDate")}
                      readOnly
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
                    checked={isChecked("diagnosis", "Non Microscopic")}
                    readOnly
                  />
                  <label>Non Microscopic</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="deathCertificatesOnly"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("diagnosis", "Death Certificates Only")}
                    readOnly
                  />
                  <label>Death Certificates Only</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="clinicalInvestigation"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("diagnosis", "Clinical Investigation")}
                    readOnly
                  />
                  <label>Clinical Investigation</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="specificTumorMarkers"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("diagnosis", "Specific Tumors Makers")}
                    readOnly
                  />
                  <label>Specific Tumors Makers</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="microscopic"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("diagnosis", "Microscopic")}
                    readOnly
                  />
                  <label>Microscopic</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="cytologyHematology"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("diagnosis", "Cytology or Hermotology")}
                    readOnly
                  />
                  <label>Cytology or Hermotology</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="histologyMetastasis"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("diagnosis", "Histology of Metastasis")}
                    readOnly
                  />
                  <label>Histology of Metastasis</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="histologyPrimary"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("diagnosis", "Histology of Primary")}
                    readOnly
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
                    type="checkbox"
                    name="primary1"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("multiplePrimaries", "1")}
                    readOnly
                  />
                  <label>1</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="primary2"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("multiplePrimaries", "2")}
                    readOnly
                  />
                  <label>2</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="primary3"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("multiplePrimaries", "3")}
                    readOnly
                  />
                  <label>3</label>
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
                    checked={isChecked("primarySites", "Colon")}
                    readOnly
                  />
                  <label>Colon</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="brain"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Brain")}
                    readOnly
                  />
                  <label>Brain</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="bladder"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Bladder")}
                    readOnly
                  />
                  <label>Bladder</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="skin"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Skin")}
                    readOnly
                  />
                  <label>Skin</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="kidney"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Kidney")}
                    readOnly
                  />
                  <label>Kidney</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="testis"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Testis")}
                    readOnly
                  />
                  <label>Testis</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="liver"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Liver")}
                    readOnly
                  />
                  <label>Liver</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="corpusUteri"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Corpus Uteri")}
                    readOnly
                  />
                  <label>Corpus Uteri</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="urinary"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Urinary")}
                    readOnly
                  />
                  <label>Urinary</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="prostate"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Prostate")}
                    readOnly
                  />
                  <label>Prostate</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="nasopharnyx"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Nasopharnyx")}
                    readOnly
                  />
                  <label>Nasopharnyx</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="oralCavity"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Oral Cavity")}
                    readOnly
                  />
                  <label>Oral Cavity</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="ovary"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Ovary")}
                    readOnly
                  />
                  <label>Ovary</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="lung"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Lung")}
                    readOnly
                  />
                  <label>Lung</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="gull"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Gull")}
                    readOnly
                  />
                  <label>Gull</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="thyroid"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Thyroid")}
                    readOnly
                  />
                  <label>Thyroid</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="rectum"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Rectum")}
                    readOnly
                  />
                  <label>Rectum</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="blood"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Blood")}
                    readOnly
                  />
                  <label>Blood</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="stomach"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Stomach")}
                    readOnly
                  />
                  <label>Stomach</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="pancreas"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Pancreas")}
                    readOnly
                  />
                  <label>Pancreas</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="esophagus"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Esophagus")}
                    readOnly
                  />
                  <label>Esophagus</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="breast"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Breast")}
                    readOnly
                  />
                  <label>Breast</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="uterineCervix"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("primarySites", "Uterine Cervix")}
                    readOnly
                  />
                  <label>Uterine Cervix</label>
                </div>
              </div>
              <div>
                <p>
                  Other's, specify
                  <input
                    type="text"
                    name="otherPrimarySites"
                    className="border-b-[1px] border-[#000]"
                    value={form?.otherPrimarySites || ""}
                    readOnly
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
                    checked={isRadio("laterality", "left")}
                    readOnly
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
                    checked={isRadio("laterality", "right")}
                    readOnly
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
                    checked={isRadio("laterality", "notsated")}
                    readOnly
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
                    checked={isRadio("laterality", "bilateral")}
                    readOnly
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
                    checked={isRadio("laterality", "mild")}
                    readOnly
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
                  value={form?.histology || ""}
                  readOnly
                />
              </div>
              <div className="flex gap-2 flex-col">
                <label className="">Staging</label>
                <div className="relative">
                  <select
                    name="staging"
                    className="border-[#6B7280] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
                    value={form?.staging || ""}
                    disabled
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
                    maxLength="1"
                    className="border-b outline-none px-2 w-[20%] text-center"
                    value={get(form, "tnm.t")}
                    readOnly
                  />
                  N
                  <input
                    type="text"
                    id="nInput"
                    maxLength="1"
                    className="border-b outline-none px-2 w-[20%] text-center"
                    value={get(form, "tnm.n")}
                    readOnly
                  />
                  M
                  <input
                    type="text"
                    id="mInput"
                    maxLength="1"
                    className="border-b outline-none px-2 w-[20%] text-center"
                    value={get(form, "tnm.m")}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-[#6B7280]">Primary Sites</p>
              <div className="grid grid-cols-3 gap-x-10 gap-y-5">
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="none"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "none")}
                    readOnly
                  />
                  <label>None</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="distantLymphNodes"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "distantLymphNodes")}
                    readOnly
                  />
                  <label>Destant Lymph Nodes</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="bone"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "bone")}
                    readOnly
                  />
                  <label>Bone</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="liverPleura"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "liverPleura")}
                    readOnly
                  />
                  <label>Liver(Pleura)</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="kidneyMetastasis"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "kidneyMetastasis")}
                    readOnly
                  />
                  <label>Kidney</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="brainMetastasis"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "brainMetastasis")}
                    readOnly
                  />
                  <label>Brain</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="ovaryMetastasis"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "ovaryMetastasis")}
                    readOnly
                  />
                  <label>Ovary</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="skinMetastasis"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "skinMetastasis")}
                    readOnly
                  />
                  <label>Skin</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="prostateMetastasis"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "prostateMetastasis")}
                    readOnly
                  />
                  <label>Prostate</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="unknownMetastasis"
                    className="w-4 h-4 accent-[#749AB6] bg-[#749AB6] border-[#749AB6] text-white rounded focus:ring-[#749AB6]"
                    checked={isChecked("metastasisSites", "unknownMetastasis")}
                    readOnly
                  />
                  <label>Unkwon</label>
                </div>
              </div>
              <div>
                <p>
                  Other's, specify
                  <input
                    type="text"
                    name="otherMetastasis"
                    className="border-b-[1px] border-[#000]"
                    value={form?.otherMetastasis || ""}
                    readOnly
                  />
                </p>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-5">
                  <label className="text-sm text-[#6B7280]">
                    Final Diagnosis
                  </label>
                  <textarea
                    name="finalDiagnosis"
                    className="border-[#6B7280] border-[1px] rounded-md p-2 h-36 w-[60%] resize-none"
                    value={form?.finalDiagnosis || ""}
                    readOnly
                  ></textarea>
                </div>
                <div className="flex flex-col gap-5 w-[50%]">
                  <label className="text-sm text-[#6B7280]">
                    Final Diagnosis: ICD-10 Code
                  </label>
                  <input
                    type="text"
                    name="icd10Code"
                    className="border-[#6B7280] border-[1px] rounded-md p-2"
                    value={form?.icd10Code || ""}
                    readOnly
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
                    name="treatmentPurpose"
                    value="Curative-Complete"
                    className="peer hidden"
                    checked={
                      get(form, "treatment.purpose") === "Curative-Complete"
                    }
                    readOnly
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
                    name="treatmentPurpose"
                    value="Curative-Incomplete"
                    className="peer hidden"
                    checked={
                      get(form, "treatment.purpose") === "Curative-Incomplete"
                    }
                    readOnly
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
                    name="treatmentPurpose"
                    value="Palliative Only"
                    className="peer hidden"
                    checked={
                      get(form, "treatment.purpose") === "Palliative Only"
                    }
                    readOnly
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
                    name="otherTreatmentPurpose"
                    className="border-b-[1px] border-[#000]"
                    value={get(form, "treatment.otherPurpose") || ""}
                    readOnly
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
                  name="primaryAssistance"
                  className="border-[#6B7280] border-[1px] rounded-md p-2"
                  value={get(form, "treatment.primaryAssistance") || ""}
                  readOnly
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
                    name="assistanceDate"
                    className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    placeholder="Select date"
                    value={get(form, "treatment.assistanceDate") || ""}
                    readOnly
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
                    checked={get(form, "treatment.adjuvant", []).includes(
                      "Surgery"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.adjuvant", []).includes(
                      "Radiotherapy"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.adjuvant", []).includes(
                      "Chemotherapy"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.adjuvant", []).includes(
                      "Immunotherapy/Cytrotherapy"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.adjuvant", []).includes(
                      "Hormonal"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.adjuvant", []).includes(
                      "Unknown"
                    )}
                    readOnly
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
                    name="otherAdjuvantTreatment"
                    className="border-b-[1px] border-[#000] focus:outline-none"
                    value={get(form, "treatment.adjuvantOther") || ""}
                    readOnly
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
                    checked={get(form, "treatment.otherSources", []).includes(
                      "Surgery"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.otherSources", []).includes(
                      "Radiotherapy"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.otherSources", []).includes(
                      "Chemotherapy"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.otherSources", []).includes(
                      "Immunotherapy/Cytrotherapy"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.otherSources", []).includes(
                      "Hormonal"
                    )}
                    readOnly
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
                    checked={get(form, "treatment.otherSources", []).includes(
                      "Unknown"
                    )}
                    readOnly
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
                    name="otherTreatmentOtherSources"
                    className="border-b-[1px] border-[#000] focus:outline-none"
                    value={get(form, "treatment.otherSourcesOther") || ""}
                    readOnly
                  />
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="h-16 bg-secondary"></div>
    </div>
  );
};
export default IndividualScreeningView;
