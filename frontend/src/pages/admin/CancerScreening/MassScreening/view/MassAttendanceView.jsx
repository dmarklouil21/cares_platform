// pages/admin/Services/CancerScreening/MassAttendanceView.jsx
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export default function MassAttendanceView() {
  const location = useLocation();

  // patients + optional screening info passed via Link state
  const passedPatients = location.state?.patients;
  const screening = location.state?.screening;

  const samplePatients = [
    { name: "Juan Dela Cruz", result: "BP 120/80 — Normal" },
    { name: "Maria Santos", result: "BP 140/90 — Elevated" },
    { name: "Pedro Reyes", result: "Glucose 95 mg/dL — Normal" },
    { name: "Ana Bautista", result: "Cholesterol 230 — High" },
    { name: "Jose Ramirez", result: "Referred to doctor" },
  ];

  const patients = useMemo(() => {
    if (Array.isArray(passedPatients) && passedPatients.length)
      return passedPatients;
    return samplePatients;
  }, [passedPatients]);

  return (
    <div className="h-screen w-full bg-gray flex flex-col">
      {/* Header */}
      <div className="bg-white py-4 px-6 md:px-10 flex items-center justify-between">
        <div className="font-bold">Admin</div>
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src="/images/Avatar.png"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

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
