import React from "react";
import { useLocation, Link } from "react-router-dom";

const PatientMasterListView = () => {
  const location = useLocation();
  const patient = location.state?.patient || {};

  // Sample historical updates data with date and note
  const historicalUpdates = [
    { date: "2023-05-15", note: "Initial diagnosis confirmed" },
    { date: "2023-06-20", note: "Started chemotherapy treatment" },
    { date: "2023-08-10", note: "Progress checkup - positive response" },
  ];

  // Function to format full name
  const getFullName = () => {
    let fullName = `${patient.name || ""} ${
      patient.middle_name ? patient.middle_name.charAt(0) + "." : ""
    } ${patient.last_name || ""}`;
    if (patient.suffix) {
      fullName += ` ${patient.suffix}`;
    }
    return fullName;
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
                  value={patient.name || ""}
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
