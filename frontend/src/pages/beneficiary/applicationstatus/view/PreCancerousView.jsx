// src/pages/treatment/AdminprecancerousView.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getPreCancerousMedsDetail } from "src/api/precancerous";

// No inline samples; detail view will use navigation state if present, otherwise fetch from API

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
  const { id } = useParams();
  const location = useLocation();

  const [patient, setPatient] = useState(location.state?.patient || null);
  const [loading, setLoading] = useState(!location.state?.patient);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (patient) return; // already provided via navigation state
      try {
        setLoading(true);
        const data = await getPreCancerousMedsDetail(id);
        if (!active) return;
        setPatient(data || null);
      } catch (e) {
        if (!active) return;
        setError("Unable to load request details.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">{error || "Request not found."}</p>
        </div>
      </div>
    );
  }

  // Safely read new field
  const medsReleaseDate =
    patient.release_date_of_meds || patient.meds_release_date || null;

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
      <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
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
              <span className="text-gray-700">{patient.lgu_name || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Date</span>
              <span className="text-gray-700">{patient.date || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Contact Number</span>
              <span className="text-gray-700">{patient.contact_number || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Prepared by</span>
              <span className="text-gray-700">{patient.prepared_by || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Approved by</span>
              <span className="text-gray-700">{patient.approved_by || "—"}</span>
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
        <div className="bg-white rounded-md shadow border border-black/10">
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
              <tr className="border-t">
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
