import React, { useMemo } from "react";
import { useLocation, useParams, Link } from "react-router-dom";

function splitNameParts(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0)
    return { first: "", middle: "", last: "", suffix: "" };

  const suffixes = new Set(["Jr", "Jr.", "Sr", "Sr.", "III", "IV", "V"]);
  let suffix = "";
  let arr = [...parts];

  // pull suffix if present at the end
  if (arr.length > 1 && suffixes.has(arr[arr.length - 1])) {
    suffix = arr.pop();
  }

  const first = arr[0] || "";
  const last = arr.length > 1 ? arr[arr.length - 1] : "";
  const middle = arr.length > 2 ? arr.slice(1, -1).join(" ") : "";

  return { first, middle, last, suffix };
}

const RhuPreEnrollmentView = () => {
  const location = useLocation();
  const { preenrollment_id: idParam } = useParams();

  // --- Sample detailed data (fallback when state is not provided or incomplete) ---
  const samplePatients = [
    {
      preenrollment_id: "PE-001",
      patient_id: "PT-001",
      name: "Juan",
      middle_name: "Reyes",
      last_name: "Dela Cruz",
      suffix: "Jr.",
      birthdate: "1990-05-15",
      sex: "Male",
      barangay: "Ermita",
      lgu: "Manila",
      date_diagnosed: "2022-01-10",
      diagnosis: "Lung Cancer",
      cancer_stage: "III",
      cancer_site: "Left Lung",
      historical_updates: [
        { date: "2022-01-10", note: "Initial diagnosis confirmed" },
        { date: "2022-02-15", note: "Started chemotherapy" },
        { date: "2022-04-20", note: "First follow-up checkup" },
      ],
    },
    {
      preenrollment_id: "PE-002",
      patient_id: "PT-002",
      name: "Maria",
      middle_name: "Lopez",
      last_name: "Santos",
      birthdate: "1985-08-22",
      sex: "Female",
      barangay: "Kamuning",
      lgu: "Quezon City",
      date_diagnosed: "2021-11-05",
      diagnosis: "Breast Cancer",
      cancer_stage: "II",
      cancer_site: "Right Breast",
      historical_updates: [
        { date: "2021-11-05", note: "Initial mammogram results" },
        { date: "2021-11-20", note: "Biopsy confirmed malignancy" },
      ],
    },
    {
      preenrollment_id: "PE-003",
      patient_id: "PT-003",
      name: "Pedro",
      middle_name: "Martinez",
      last_name: "Gonzales",
      suffix: "Sr.",
      birthdate: "1978-11-30",
      sex: "Male",
      barangay: "San Antonio",
      lgu: "Makati",
      date_diagnosed: "2023-02-18",
      diagnosis: "Colon Cancer",
      cancer_stage: "IV",
      cancer_site: "Colon",
      historical_updates: [
        { date: "2023-02-18", note: "Colonoscopy results" },
        { date: "2023-03-05", note: "Started targeted therapy" },
      ],
    },
    {
      preenrollment_id: "PE-004",
      patient_id: "PT-004",
      name: "Ana",
      middle_name: "Diaz",
      last_name: "Ramos",
      birthdate: "1995-03-10",
      sex: "Female",
      barangay: "San Miguel",
      lgu: "Pasig",
      date_diagnosed: "2022-09-12",
      diagnosis: "Leukemia",
      cancer_stage: "I",
      cancer_site: "Blood",
      historical_updates: [
        { date: "2022-09-12", note: "Blood test results" },
        { date: "2022-10-01", note: "Bone marrow biopsy" },
        { date: "2022-10-15", note: "Started treatment plan" },
      ],
    },
  ];

  // Build a complete patient object:
  // 1) Start with sample match (by :preenrollment_id or patient_id)
  // 2) Overlay any fields passed via location.state.patient (e.g., full_name)
  const patient = useMemo(() => {
    const statePatient = location.state?.patient;
    const effectiveId =
      idParam || statePatient?.preenrollment_id || statePatient?.patient_id;

    const sampleMatch =
      effectiveId &&
      samplePatients.find(
        (p) =>
          p.preenrollment_id === effectiveId || p.patient_id === effectiveId
      );

    return { ...(sampleMatch || {}), ...(statePatient || {}) };
  }, [location.state?.patient, idParam]);

  const derived = useMemo(
    () => splitNameParts(patient.full_name || ""),
    [patient.full_name]
  );

  const historicalUpdates = patient.historical_updates || [
    { date: "2023-05-15", note: "Initial diagnosis confirmed" },
    { date: "2023-06-20", note: "Started chemotherapy treatment" },
    { date: "2023-08-10", note: "Progress checkup - positive response" },
  ];

  const getFullName = () => {
    if (patient.full_name) return patient.full_name;
    const first = patient.name || derived.first || "";
    const midInitial = patient.middle_name
      ? `${patient.middle_name.charAt(0)}.`
      : derived.middle
      ? `${derived.middle.charAt(0)}.`
      : "";
    const last = patient.last_name || derived.last || "";
    const suf =
      patient.suffix || derived.suffix
        ? ` ${patient.suffix || derived.suffix}`
        : "";
    return [first, midInitial, last].filter(Boolean).join(" ") + suf;
  };

  const displayId =
    patient.preenrollment_id || idParam || patient.patient_id || "N/A";

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">View Record</h1>
        <div className="text-white font-semibold">
          Pre-Enroll ID: {displayId}
        </div>
      </div>

      <form className="h-full w-full p-5 flex flex-col justify-between overflow-auto gap-5">
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          {/* Personal Information Section */}
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4">
            <h1 className="text-md font-bold">Personal Information</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            {/* First Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  value={getFullName()}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">First Name:</label>
                <input
                  type="text"
                  value={patient.name || derived.first || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Middle Name:</label>
                <input
                  type="text"
                  value={patient.middle_name || derived.middle || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Last Name:</label>
                <input
                  type="text"
                  value={patient.last_name || derived.last || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={patient.suffix || derived.suffix || "N/A"}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>

            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Birthdate:</label>
                <input
                  type="text"
                  value={patient.birthdate || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Sex:</label>
                <input
                  type="text"
                  value={patient.sex || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Barangay:</label>
                <input
                  type="text"
                  value={patient.barangay || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">LGU:</label>
                <input
                  type="text"
                  value={patient.lgu || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4 mt-8">
            <h1 className="text-md font-bold">Medical Information</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            {/* First Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">
                  Date Diagnosed:
                </label>
                <input
                  type="text"
                  value={patient.date_diagnosed || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Diagnosis:</label>
                <input
                  type="text"
                  value={patient.diagnosis || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Cancer Stage:
                </label>
                <input
                  type="text"
                  value={patient.cancer_stage || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
            {/* Second Column */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Cancer Site:</label>
                <input
                  type="text"
                  value={patient.cancer_site || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Historical Updates Section */}
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4 mt-8">
            <h1 className="text-md font-bold">Patient Historical Updates</h1>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalUpdates.map((update, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-4 border-b">{update.date}</td>
                      <td className="py-2 px-4 border-b">{update.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
            to="/Rhu/rhu/pre-enrollment"
          >
            BACK
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RhuPreEnrollmentView;
