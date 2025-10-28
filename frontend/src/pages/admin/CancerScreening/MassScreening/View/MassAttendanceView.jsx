// pages/admin/Services/CancerScreening/MassAttendanceView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAdminMassScreeningAttendance } from "../../../../../api/massScreening";

export default function MassAttendanceView() {
  const location = useLocation();

  // Optional screening info passed via Link state
  const screening = location.state?.screening;
  const requestId = screening?.id;

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!requestId) return;
      try {
        setLoading(true);
        setError("");
        const data = await getAdminMassScreeningAttendance(requestId);
        const normalized = (Array.isArray(data) ? data : []).map((e) => ({
          name: e.name,
          result: e.result || "",
        }));
        setPatients(normalized);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [requestId]);

  return (
    <div className="h-screen w-full bg-gray flex flex-col">
      {/* Body */}
      <div className="w-full flex-1 py-6 px-6 md:px-10 flex flex-col gap-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              Mass Screening — Attendance
            </h2>
            {screening?.id && (
              <p className="text-sm text-gray-600 mt-1">
                For request: {screening.id}
              </p>
            )}
            {loading && (
              <div className="text-sm text-gray-600 mt-1">Loading…</div>
            )}
            {error && !loading && (
              <div className="text-sm text-red-600 mt-1">{error}</div>
            )}
          </div>
          <Link
            to="/admin/cancer-screening/mass-screening"
            className="px-4 py-2 rounded-md bg-primary text-white font-semibold"
          >
            Back to list
          </Link>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200">
          <div className="px-5 md:px-7 py-4 border-b">
            <h3 className="font-semibold">Attendance List</h3>
          </div>

          <div className="divide-y">
            {/* header */}
            <div className="grid grid-cols-12 font-semibold text-sm px-5 md:px-7 py-3 bg-gray-50">
              <div className="col-span-7 md:col-span-6">Name</div>
              <div className="col-span-5 md:col-span-6">Result / Notes</div>
            </div>

            {/* rows */}
            {patients.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center px-5 md:px-7 py-3"
              >
                <div className="col-span-7 md:col-span-6">{p.name}</div>
                <div className="col-span-5 md:col-span-6 text-gray-700">
                  {p.result || "—"}
                </div>
              </div>
            ))}

            {/* footer */}
            <div className="px-5 md:px-7 py-3 bg-gray-50 text-sm text-gray-600">
              Total: {patients.length}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
