import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BeneficiarySidebar from "../../../../../../components/navigation/Beneficiary";

const RadioactivePreScreening = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleTNMInput = (e) => {
    if (e.target.value.length > 1) {
      e.target.value = e.target.value.slice(0, 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.currentTarget; // #pre-screening-form
    const formElements = form.elements;
    const data = {};

    // Checkbox groups are identified by common name prefixes
    const checkboxGroups = [
      "diagnosis_basis",
      "primary_sites",
      "distant_metastasis_sites",
      "adjuvant_treatments_received",
      "other_source_treatments",
    ];

    checkboxGroups.forEach((group) => (data[group] = []));

    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i];
      const { name, id, type, checked, value } = element;

      if (name) {
        const group = checkboxGroups.find((g) => name.startsWith(g));
        if (type === "checkbox" && group) {
          if (checked) data[group].push(value);
        } else if (type === "radio") {
          if (checked) data[name] = value;
        } else {
          data[name] = value;
        }
      } else if (id) {
        data[id] = value;
      }
    }

    console.log("[RadioTherapyPreScreening] collected data:", data);

    navigate(
      "/Beneficiary/services/cancer-management-options/radioactive/radio-active-well-being-tool"
    );
  };

  return (
    <>
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="md:hidden">
          <BeneficiarySidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>

        <div className="bg-white py-4 px-10 flex justify-between items-center ">
          {/* Menu Button for Mobile */}
          <img
            className="md:hidden size-5 cursor-pointer"
            src="/images/menu-line.svg"
            onClick={() => setIsSidebarOpen(true)}
          />

          <div className="font-bold">Beneficiary</div>
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <img
              src="/images/Avatar.png"
              alt="User Profile"
              className="rounded-full"
            />
          </div>
        </div>

        <div className="py-6 px-10 flex flex-col flex-1 overflow-auto">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold mb-6">Cancer Screening</h2>
            <p className="font-bold text-gray2 text-sm text-right">
              Cancer Data
            </p>
          </div>

          <form
            id="pre-screening-form"
            onSubmit={handleSubmit}
            className="bg-white p-3 md:p-9 flex flex-col gap-5 md:gap-10 rounded-2xl"
          >
            <div>
              <h1 id="details_title" className="font-bold text-xl mb-5">
                Pre-Screening Form
              </h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                <div className="flex gap-2 flex-col justify-between">
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
                  <textarea
                    name="chief_complaint"
                    className="border-[#6B7280] border-[1px] rounded-md p-2 resize-none h-28"
                  ></textarea>
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
                      className="bg-white border border-[#6B7280] text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="Select date"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-col justify-between">
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
                      className="bg-white border border-[#6B7280] text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                      placeholder="Select date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="flex flex-col gap-5">
              <h1 id="details_title" className="font-bold text-xl">
                Diagnosis
              </h1>
              <p className="text-[#6B7280]">Most Valid Basis of Diagnosis:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-5">
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="diagnosis_basis_nonMicroscopic"
                    value="Non Microscopic"
                    className="w-4 h-4 accent-[#749AB6]"
                  />
                  <label>Non Microscopic</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="diagnosis_basis_deathCertificatesOnly"
                    value="Death Certificates Only"
                    className="w-4 h-4 accent-[#749AB6]"
                  />
                  <label>Death Certificates Only</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="diagnosis_basis_clinicalInvestigation"
                    value="Clinical Investigation"
                    className="w-4 h-4 accent-[#749AB6]"
                  />
                  <label>Clinical Investigation</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="diagnosis_basis_specificTumorMarkers"
                    value="Specific Tumor Markers"
                    className="w-4 h-4 accent-[#749AB6]"
                  />
                  <label>Specific Tumor Markers</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="diagnosis_basis_microscopic"
                    value="Microscopic"
                    className="w-4 h-4 accent-[#749AB6]"
                  />
                  <label>Microscopic</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="diagnosis_basis_cytologyHematology"
                    value="Cytology or Hematology"
                    className="w-4 h-4 accent-[#749AB6]"
                  />
                  <label>Cytology or Hematology</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="diagnosis_basis_histologyMetastasis"
                    value="Histology of Metastasis"
                    className="w-4 h-4 accent-[#749AB6]"
                  />
                  <label>Histology of Metastasis</label>
                </div>
                <div className="flex gap-5 justify-center items-center w-fit">
                  <input
                    type="checkbox"
                    name="diagnosis_basis_histologyPrimary"
                    value="Histology of Primary"
                    className="w-4 h-4 accent-[#749AB6]"
                  />
                  <label>Histology of Primary</label>
                </div>
              </div>
            </div>

            {/* Multiple Primaries */}
            <div className="flex flex-col gap-5">
              <p className="text-[#6B7280]">Multiple Primaries</p>
              <div className="grid grid-cols-3 gap-x-10 gap-y-5 w-fit">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex gap-5 justify-center items-center w-fit"
                  >
                    <input
                      type="radio"
                      name="multiple_primaries"
                      value={n}
                      className="w-4 h-4"
                    />
                    <label>{n}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Sites */}
            <div className="flex flex-col gap-5">
              <p className="text-[#6B7280]">Primary Sites</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-10 gap-y-5">
                {[
                  ["colon", "Colon"],
                  ["brain", "Brain"],
                  ["bladder", "Bladder"],
                  ["skin", "Skin"],
                  ["kidney", "Kidney"],
                  ["testis", "Testis"],
                  ["liver", "Liver"],
                  ["corpusUteri", "Corpus Uteri"],
                  ["urinary", "Urinary"],
                  ["prostate", "Prostate"],
                  ["nasopharnyx", "Nasopharnyx"],
                  ["oralCavity", "Oral Cavity"],
                  ["ovary", "Ovary"],
                  ["lung", "Lung"],
                  ["gull", "Gull"],
                  ["thyroid", "Thyroid"],
                  ["rectum", "Rectum"],
                  ["blood", "Blood"],
                  ["stomach", "Stomach"],
                  ["pancreas", "Pancreas"],
                  ["esophagus", "Esophagus"],
                  ["breast", "Breast"],
                  ["uterineCervix", "Uterine Cervix"],
                ].map(([key, label]) => (
                  <div
                    key={key}
                    className="flex gap-5 justify-center items-center w-fit"
                  >
                    <input
                      type="checkbox"
                      name={`primary_sites_${key}`}
                      value={label}
                      className="w-4 h-4 accent-[#749AB6]"
                    />
                    <label>{label}</label>
                  </div>
                ))}
              </div>
              <div>
                <p>
                  Other's, specify{" "}
                  <input
                    type="text"
                    name="primary_sites_other"
                    className="border-b-[1px] border-[#000]"
                  />
                </p>
              </div>
            </div>

            {/* Laterality */}
            <div className="flex flex-col gap-5">
              <p className="text-[#6B7280]">Laterality</p>
              <div className="flex flex-col gap-3">
                {[
                  ["left", "Left"],
                  ["right", "Right"],
                  ["notsated", "Not Stated"],
                  ["bilateral", "Bilateral"],
                  ["mild", "Mild"],
                ].map(([id, label]) => (
                  <div key={id} className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id={id}
                      name="laterality"
                      value={label}
                      className="peer hidden"
                    />
                    <label
                      htmlFor={id}
                      className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Histology / Staging / TNM */}
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
                    defaultValue=""
                    className="border-[#6B7280] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
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

            {/* Distant Metastasis */}
            <div className="flex flex-col gap-5">
              <p className="text-[#6B7280]">Sites of Distant Metastasis</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-5">
                {[
                  ["none", "None"],
                  ["distantLymphNodes", "Distant Lymph Nodes"],
                  ["bone", "Bone"],
                  ["liverPleura", "Liver(Pleura)"],
                  ["kidneyMetastasis", "Kidney"],
                  ["brainMetastasis", "Brain"],
                  ["ovaryMetastasis", "Ovary"],
                  ["skinMetastasis", "Skin"],
                  ["prostateMetastasis", "Prostate"],
                  ["unknownMetastasis", "Unknown"],
                ].map(([key, label]) => (
                  <div
                    key={key}
                    className="flex gap-5 justify-center items-center w-fit"
                  >
                    <input
                      type="checkbox"
                      name={`distant_metastasis_sites_${key}`}
                      value={label}
                      className="w-4 h-4 accent-[#749AB6]"
                    />
                    <label>{label}</label>
                  </div>
                ))}
              </div>
              <div>
                <p>
                  Other's, specify{" "}
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
                    className="border-[#6B7280] border-[1px] rounded-md p-2 h-36 md:w-[60%] resize-none text-[14px] md:text-[16px]"
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

            {/* Treatment */}
            <div className="flex flex-col gap-5">
              <h1 className="text-2xl font-bold">Treatment</h1>
              <p className="text-[#6B7280] text-sm">Treatment Purposes</p>
              <div className="flex flex-col gap-3">
                {[
                  ["curativeComplete", "Curative-Complete"],
                  ["curativeIncomplete", "Curative-Incomplete"],
                  ["palliative", "Palliative Only"],
                ].map(([id, label]) => (
                  <div key={id} className="flex gap-3 items-center">
                    <input
                      type="radio"
                      id={id}
                      name="treatment_purpose"
                      value={label}
                      className="peer hidden"
                    />
                    <label
                      htmlFor={id}
                      className="relative w-6 h-6 rounded-full border-[1px] border-[#6B7280] flex items-center justify-center cursor-pointer peer-checked:border-[2px] peer-checked:border-[#749AB6] peer-checked:before:content-[''] peer-checked:before:absolute peer-checked:before:w-4 peer-checked:before:h-4 peer-checked:before:rounded-full peer-checked:before:bg-[#749AB6]"
                    ></label>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[#6B7280] text-sm">
                  Other's, specify{" "}
                  <input
                    type="text"
                    name="treatment_purpose_other"
                    className="border-b-[1px] border-[#000]"
                  />
                </p>
              </div>
            </div>

            {/* Assistance */}
            <div className="flex gap-5 w-full flex-col md:flex-row">
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
                    className="bg-white border border-[#6B7280] text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                    placeholder="Select date"
                  />
                </div>
              </div>
            </div>

            {/* Adjuvant treatments (RAFI-EJACC) */}
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#6B7280]">
                Planned Additional/Adjuvant Treatment/s actually received from
                RAFI-EJACC
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {[
                  ["surgery", "Surgery"],
                  ["radiotherapy", "Radiotherapy"],
                  ["chemotherapy", "Chemotherapy"],
                ].map(([id, label]) => (
                  <div key={id} className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id={id}
                      name={`adjuvant_treatments_received_${id}`}
                      value={label}
                      className="w-4 h-4 accent-[#749AB6]"
                    />
                    <label htmlFor={id} className="text-[#374151] text-sm">
                      {label}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {[
                  ["immunotherapy", "Immunotherapy/Cytrotherapy"],
                  ["hormonal", "Hormonal"],
                  ["unknown", "Unknown"],
                ].map(([id, label]) => (
                  <div key={id} className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id={id}
                      name={`adjuvant_treatments_received_${id}`}
                      value={label}
                      className="w-4 h-4 accent-[#749AB6]"
                    />
                    <label htmlFor={id} className="text-[#374151] text-sm">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[#6B7280] text-sm">
                  Other's, specify{" "}
                  <input
                    type="text"
                    name="adjuvant_treatments_other"
                    className="border-b-[1px] border-[#000] focus:outline-none"
                  />
                </p>
              </div>
            </div>

            {/* Other-source treatments */}
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#6B7280]">
                Treatment/s received from other sources
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {[
                  ["surgeryOther", "Surgery"],
                  ["radiotherapyOther", "Radiotherapy"],
                  ["chemotherapyOther", "Chemotherapy"],
                ].map(([id, label]) => (
                  <div key={id} className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id={id}
                      name={`other_source_treatments_${id}`}
                      value={label}
                      className="w-4 h-4 accent-[#749AB6]"
                    />
                    <label htmlFor={id} className="text-[#374151] text-sm">
                      {label}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {[
                  ["immunotherapyOther", "Immunotherapy/Cytrotherapy"],
                  ["hormonalOther", "Hormonal"],
                  ["unknownOther", "Unknown"],
                ].map(([id, label]) => (
                  <div key={id} className="flex items-center gap-2 w-fit">
                    <input
                      type="checkbox"
                      id={id}
                      name={`other_source_treatments_${id}`}
                      value={label}
                      className="w-4 h-4 accent-[#749AB6]"
                    />
                    <label htmlFor={id} className="text-[#374151] text-sm">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[#6B7280] text-sm">
                  Other's, specify{" "}
                  <input
                    type="text"
                    name="other_source_treatments_other"
                    className="border-b-[1px] border-[#000] focus:outline-none"
                  />
                </p>
              </div>
            </div>

            {/* Consent */}
            <div className="flex flex-col items-start gap-5">
              <h1 className="text-2xl font-bold">Consent and Privacy</h1>
              <div className="flex justify-center items-center gap-5">
                <input
                  type="checkbox"
                  name="consentAgreement"
                  className="w-4 h-4 accent-[#749AB6]"
                />
                <label className="underline">
                  Form notice & Data privacy notice
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full justify-between gap-8">
              <Link
                to="/Beneficiary/services/cancer-management"
                className="border py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-[#749AB6] text-center font-bold text-white py-2 w-full border-[1px] border-[#749AB6] hover:border-[#C5D7E5] hover:bg-[#C5D7E5] rounded-md cursor-pointer"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RadioactivePreScreening;
