// src/pages/survivorship/generate/generate.jsx  (HomeVisitPrint)
import React from "react";

export default function HormonalReplacementPrint({ rows = [] }) {
  // Safer date parsing to avoid timezone drift on YYYY-MM-DD strings
  const fmtDate = (v) => {
    if (!v) return "";
    try {
      const d =
        typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)
          ? new Date(`${v}T00:00:00`)
          : new Date(v);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(v);
    }
  };

  return (
    <div
      id="homevisit-print-content"
      className="hidden print:flex fixed top-0 left-0 w-[216mm] h-[279.4mm] flex-col bg-white z-50 p-0 m-0"
      style={{ margin: 0, padding: 0 }}
    >
      <style>{`
        :root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table { page-break-inside: auto; border-collapse: collapse; width: 100%; }
        thead { display: table-header-group; } /* repeat header per page */
        tfoot { display: table-footer-group; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; }
        thead th { background: #e6f0f8; }

        @media print {
          @page { size: Letter; margin: 0 !important; }
          html, body { margin: 0 !important; width: 216mm; height: 279.4mm; }
          #homevisit-print-content {
            margin: 0 !important; padding: 0 !important;
            width: 216mm !important; height: 279.4mm !important;
          }
        }
      `}</style>

      {/* Top brand bars */}
      <div className="fixed left-10 bg-primary px-5 py-4 rounded-b-4xl">
        <img src="/images/logo_white_text.png" alt="Rafi Logo" />
      </div>
      <div className="bg-yellow w-full flex justify-end items-end text-md pr-8 pb-1.5 h-[5%]">
        <h1 className="text-gray2 font-bold">
          Touching People, Shaping the Future
        </h1>
      </div>
      <div className="bg-lightblue w-full flex justify-end items-end pr-8 py-1">
        <p className="text-gray2 text-sm font-bold">
          Upholding the dignity of man by working with communities to elevate
          their well-being
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-24 pt-32">
        <div className="py-5 w-full text-center">
          <h1 className="font-bold text-xl">Home Visit Requests</h1>
          <p className="text-[11px] text-gray-500 mt-1">
            Generated on {new Date().toLocaleString()}
          </p>
        </div>

        {/* NOTE: No Action column in print */}
        <table>
          <colgroup>
            <col style={{ width: "18%" }} /> {/* Patient no */}
            <col style={{ width: "26%" }} /> {/* Patient Name */}
            <col style={{ width: "26%" }} /> {/* Diagnosis */}
            <col style={{ width: "16%" }} /> {/* Date */}
            <col style={{ width: "14%" }} /> {/* Status */}
          </colgroup>
          <thead>
            <tr>
              <th className="text-center !bg-lightblue">Patient no</th>
              <th className="text-left">Patient Name</th>
              <th className="text-left">Diagnosis</th>
              <th className="text-center">Date</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((p) => (
                <tr key={p.id ?? p.patient?.patient_id ?? Math.random()}>
                  <td className="text-center">{p.patient?.patient_id ?? ""}</td>
                  <td className="text-left">{p.patient?.full_name ?? "—"}</td>
                  <td className="text-left">
                    {p.patient?.diagnosis?.[0]?.diagnosis || "N/A"}
                  </td>
                  <td className="text-center">{fmtDate(p.created_at)}</td>
                  <td className="text-center">{p.status ?? ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer brand bars */}
      <div className="bg-yellow h-[1.3%]" />
      <div className="flex gap-2 justify-end items-center pr-8 py-2 bg-primary">
        <img
          src="/images/patient/printlocation.svg"
          className="h-3"
          alt="location icon"
        />
        <p className="text-white text-[9.5px]">
          35 Eduardo Aboitiz Street, Cebu City 6000 Philippines
        </p>
        <img
          src="/images/patient/printtelephone.svg"
          className="h-3"
          alt="telephone icon"
        />
        <p className="text-white text-[9.5px]">
          +63 (032) 265-5910, +63 998 967 1917, +63 998 966 0737
        </p>
        <img
          src="/images/patient/printemail.svg"
          className="h-3"
          alt="email icon"
        />
        <p className="text-white text-[9.5px]">communicate@rafi.ph</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="#fff"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-7.5 9h15"
          />
        </svg>
        <p className="text-white text-[9.5px]">www.rafi.org.ph</p>
      </div>
    </div>
  );
}
