import React from "react";
import { useLocation, Link } from "react-router-dom";

const PatientMasterListView = () => {
  const location = useLocation();

  const raw = location.state?.patient ?? {};

  const SAMPLE_2X2 = "https://placehold.co/600x600/png?text=2x2+Photo";
  const photoUrl = SAMPLE_2X2;

  const patient = {
    patient_id: raw.patient_id ?? "",
    full_name: raw.full_name ?? "",
    first_name: raw.first_name ?? "",
    middle_name: raw.middle_name ?? "",
    last_name: raw.last_name ?? "",
    suffix: raw.suffix ?? "",
    date_of_birth: raw.date_of_birth ?? "",
    age: raw.age ?? "",
    sex: raw.sex ?? "",
    civil_status: raw.civil_status ?? "",
    number_of_children: raw.number_of_children ?? "",
    address: raw.address ?? "",
    city: raw.city ?? "",
    barangay: raw.barangay ?? "",
    email: raw.email ?? "",
    mobile_number: raw.mobile_number ?? "",
    source_of_information: raw.source_of_information ?? "",
    other_rafi_programs_availed: raw.other_rafi_programs_availed ?? "",
    highest_educational_attainment: raw.highest_educational_attainment ?? "",
    source_of_income: raw.source_of_income ?? "",
    occupation: raw.occupation ?? "",
    monthly_income: raw.monthly_income ?? "",
    diagnosis: Array.isArray(raw.diagnosis) ? raw.diagnosis : [],
    emergency_contacts: Array.isArray(raw.emergency_contacts)
      ? raw.emergency_contacts
      : [],
    historical_updates: Array.isArray(raw.historical_updates)
      ? raw.historical_updates
      : [],
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray">
      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">View Patient</h1>
        <div className="text-white font-semibold">
          Patient ID: {patient.patient_id || "N/A"}
        </div>
      </div>

      <form className="h-full w-full p-5 flex flex-col justify-between overflow-auto gap-5">
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4">
            <h1 className="text-md font-bold">Personal Information</h1>
          </div>

          <div className="w-[100%] p-4 flex justify-between">
            <div className="flex justify-end gap-[10%] w-full">
              <div className="w-[150px] h-[150px] border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                <img
                  src={photoUrl}
                  alt="2x2 ID photo (sample)"
                  className="w-full h-full object-cover"
                />
              </div>
              <img src="/images/logo_black_text.png" alt="rafi icon" />
            </div>
          </div>

          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div className="w-full">
                <label className="block text-gray-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  value={patient.full_name || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div className="w-full">
                <label className="block text-gray-700 mb-1">First Name:</label>
                <input
                  type="text"
                  value={patient.first_name || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Middle Name:</label>
                <input
                  type="text"
                  value={patient.middle_name || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Last Name:</label>
                <input
                  type="text"
                  value={patient.last_name || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={patient.suffix || "N/A"}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Birthdate:</label>
                <input
                  type="text"
                  value={patient.date_of_birth || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Age:</label>
                <input
                  type="text"
                  value={patient.age || ""}
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
                <label className="block text-gray-700 mb-1">
                  Number of Children:
                </label>
                <input
                  type="text"
                  value={patient.number_of_children || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Civil Status:
                </label>
                <input
                  type="text"
                  value={patient.civil_status || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4 mt-8">
            <h1 className="text-md font-bold">Contact and Address</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">
                  Permanent Address:
                </label>
                <input
                  type="text"
                  value={patient.address || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  City/Municipality:
                </label>
                <input
                  type="text"
                  value={patient.city || ""}
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
            </div>

            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Email:</label>
                <input
                  type="text"
                  value={patient.email || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Mobile Number:
                </label>
                <input
                  type="text"
                  value={patient.mobile_number || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4 mt-8">
            <h1 className="text-md font-bold">Additional Info</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">
                  Source of Information (Where did you hear about RAFI-EJACC?):
                </label>
                <input
                  type="text"
                  value={patient.source_of_information || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Other RAFI program you availed:
                </label>
                <input
                  type="text"
                  value={patient.other_rafi_programs_availed || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4 mt-8">
            <h1 className="text-md font-bold">Socioeconomic Info</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">
                  Highest Educational Attainment:
                </label>
                <input
                  type="text"
                  value={patient.highest_educational_attainment || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Source of Income:
                </label>
                <input
                  type="text"
                  value={patient.source_of_income || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Occupation:</label>
                <input
                  type="text"
                  value={patient.occupation || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Income:</label>
                <input
                  type="text"
                  value={patient.monthly_income || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4 mt-8">
            <h1 className="text-md font-bold">Emergency Contacts</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Name:</label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[0]?.name ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Relationship to Patient:
                </label>
                <input
                  type="text"
                  value={
                    patient.emergency_contacts?.[0]?.relationship_to_patient ??
                    ""
                  }
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Landline Number:
                </label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[0]?.landline_number ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Address:</label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[0]?.address ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Email Address:
                </label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[0]?.email ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Mobile Number:
                </label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[0]?.mobile_number ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>

            {/* Second Contact */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Name:</label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[1]?.name ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Relationship to Patient:
                </label>
                <input
                  type="text"
                  value={
                    patient.emergency_contacts?.[1]?.relationship_to_patient ??
                    ""
                  }
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Landline Number:
                </label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[1]?.landline_number ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Address:</label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[1]?.address ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Email Address:
                </label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[1]?.email ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Mobile Number:
                </label>
                <input
                  type="text"
                  value={patient.emergency_contacts?.[1]?.mobile_number ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center mb-4 mt-8">
            <h1 className="text-md font-bold">Medical Information</h1>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">
                  Date Diagnosed:
                </label>
                <input
                  type="text"
                  value={patient.diagnosis?.[0]?.date_diagnosed ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Diagnosis:</label>
                <input
                  type="text"
                  value={patient.diagnosis?.[0]?.diagnosis ?? ""}
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
                  value={patient.diagnosis?.[0]?.cancer_stage ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="block text-gray-700 mb-1">Cancer Site:</label>
                <input
                  type="text"
                  value={patient.diagnosis?.[0]?.cancer_site ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Historical Updates */}
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
                  {(patient.historical_updates ?? []).map((update, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-4 border-b">
                        {update?.date ?? ""}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {update?.note ?? ""}
                      </td>
                    </tr>
                  ))}
                  {(patient.historical_updates ?? []).length === 0 && (
                    <tr>
                      <td className="py-2 px-4 border-b" colSpan={2}>
                        No history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
            to="/Admin/patient/AdminPatientMasterList"
          >
            BACK
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PatientMasterListView;
