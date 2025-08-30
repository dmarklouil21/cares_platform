// src/pages/treatment/AdminprecancerousView.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import BeneficiarySidebar from "../../../../components/navigation/Beneficiary";

// ----- inline sample data (fallback; list can pass selected via location.state) -----
const SAMPLE_PATIENTS = [
  {
    patient_id: "P-0001",
    first_name: "Maria",
    last_name: "Dela Cruz",
    middle_initial: "S.",
    date_of_birth: "1990-05-12",
    status: "pending",
    interpretation_of_result: "HPV Positive",
    release_date_of_meds: "2025-04-20", // NEW
  },
  {
    patient_id: "P-0002",
    first_name: "Jose",
    last_name: "Garcia",
    middle_initial: "R.",
    date_of_birth: "1987-11-03",
    status: "pending",
    interpretation_of_result: "ASC-US",
    release_date_of_meds: "2025-04-22", // NEW
  },
  {
    patient_id: "P-0003",
    first_name: "Kimberly",
    last_name: "Ytac",
    middle_initial: "F.",
    date_of_birth: "1999-02-22",
    status: "verified",
    interpretation_of_result: "Negative",
    release_date_of_meds: null, // NEW (not yet released)
  },
  {
    patient_id: "P-0004",
    first_name: "Stayve",
    last_name: "Alreach",
    middle_initial: "",
    date_of_birth: "2001-07-15",
    status: "rejected",
    interpretation_of_result: "Unsatisfactory",
    release_date_of_meds: null, // NEW (not applicable)
  },
];

// ----- header info (as in your card screenshot) -----
const REQUEST_INFO = {
  lgu_name: "City of Cebu",
  date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  contact_number: "032-123-4567",
  prepared_by: "Nurse Jane Doe",
  approved_by: "Dr. Juan Dela Cruz",
};

const formatLongDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? "—"
    : dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const PreCancerousView = () => {
  const { patient_id } = useParams();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // prefer data passed from list (reflects current status), else fallback
  const patient = useMemo(() => {
    return (
      location.state?.patient ||
      SAMPLE_PATIENTS.find((p) => p.patient_id === patient_id)
    );
  }, [location.state, patient_id]);

  if (!patient) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">Patient not found.</p>
        </div>
      </div>
    );
  }

  // Safely read new field
  const medsReleaseDate =
    patient.release_date_of_meds || patient.meds_release_date || null;

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
      <div className="md:hidden">
        <BeneficiarySidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      <div className="bg-lightblue h-[10%] px-5 w-full flex  items-center">
        <div className="mr-16 md:hidden">
          <img
            className="md:hidden size-5 cursor-pointer"
            src="/images/menu-line.svg"
            onClick={() => setIsSidebarOpen(true)}
          />
        </div>

        <h1 className="text-md font-bold">Request Pre-Cancerous Meds</h1>
      </div>

      <div className="h-full w-full overflow-auto p-5 flex flex-col gap-4">
        {/* Header Card: LGU + meta */}
        <div className="bg-white rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3">
            <h2 className="text-lg font-semibold">
              Request Pre-Cancerous Meds
            </h2>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex gap-2">
              <span className="font-medium w-40">LGU Name</span>
              <span className="text-gray-700">{REQUEST_INFO.lgu_name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Date</span>
              <span className="text-gray-700">{REQUEST_INFO.date}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Contact Number</span>
              <span className="text-gray-700">
                {REQUEST_INFO.contact_number}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Prepared by</span>
              <span className="text-gray-700">{REQUEST_INFO.prepared_by}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Approved by</span>
              <span className="text-gray-700">{REQUEST_INFO.approved_by}</span>
            </div>

            {/* NEW: Release Date of Meds */}
            <div className="flex gap-2">
              <span className="font-medium w-40">Release Date of Meds</span>
              <span className="text-gray-700">
                {formatLongDate(medsReleaseDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Row Table */}
        <div className="bg-white rounded-md shadow border border-black/10 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray/30">
                <th className="text-left text-sm font-semibold px-4 py-3">
                  No.
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Patient No.
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Last Name
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  First Name
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Middle Initial
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Date of Birth
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Interpretation of Result
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t ">
                <td className="px-4 py-3 text-sm">1</td>
                <td className="px-4 py-3 text-sm">{patient.patient_id}</td>
                <td className="px-4 py-3 text-sm">{patient.last_name}</td>
                <td className="px-4 py-3 text-sm">{patient.first_name}</td>
                <td className="px-4 py-3 text-sm">
                  {patient.middle_initial || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatLongDate(patient.date_of_birth)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {patient.interpretation_of_result}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-end">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
            to="/Beneficiary/applicationstatus/precancerous"
          >
            BACK
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PreCancerousView;
