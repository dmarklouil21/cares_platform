// LOAPrintTemplate.jsx
const LOAPrintTemplate = ({ loaData }) => {
  const sampleRows = [
    {
      id: 1,
      created_at: "2025-09-15T08:30:00Z",
      status: "Pending",
      patient: {
        patient_id: "PT-000123",
        full_name: "Juan Dela Cruz",
        city: "Cebu City",
      },
    },
    {
      id: 2,
      created_at: "2025-09-18T10:10:00Z",
      status: "In Progress",
      patient: {
        patient_id: "PT-000124",
        full_name: "Maria Santos",
        city: "Mandaue City",
      },
    },
    {
      id: 3,
      created_at: "2025-09-22T14:05:00Z",
      status: "Complete",
      patient: {
        patient_id: "PT-000125",
        full_name: "Pedro Reyes",
        city: "Lapu-Lapu City",
      },
    },
    {
      id: 4,
      created_at: "2025-09-25T09:20:00Z",
      status: "Reject",
      patient: {
        patient_id: "PT-000126",
        full_name: "Ana Dizon",
        city: "Talisay City",
      },
    },
  ];

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div
      id="loa-print-content"
      className="overflow-auto hidden print:flex fixed top-0 left-0 w-full h-screen flex-col bg-white z-50 p-0 m-0"
      style={{ margin: 0, padding: 0 }}
    >
      <style>{`
        @media print {
          @page { margin: 0 !important; }
          body { margin: 0 !important; }
          #loa-print-content { margin: 0 !important; padding: 0 !important; }
          table { page-break-inside: auto; border-collapse: collapse; width: 100%; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
        th, td { border: 1px solid #e5e7eb; padding: 8px 10px; }
        thead th { background: #e6f0f8; } /* lightblue-ish for print */
      `}</style>

      {/* Top brand bar */}
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

      {/* REPLACED CONTENT AREA: table of records for printing */}
      <div className="flex-1 flex flex-col p-26 ">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="w-[13%] text-center">Patient ID</th>
              <th className="w-[20%] text-left">Name</th>
              <th className="w-[15%] text-center">Submission Date</th>
              <th className="w-[15%] text-center">LGU</th>
              <th className="w-[13.4%] text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((r) => (
              <tr key={r.id}>
                <td className="text-center">{r.patient.patient_id}</td>
                <td className="text-left">{r.patient.full_name}</td>
                <td className="text-center">{fmtDate(r.created_at)}</td>
                <td className="text-center">{r.patient.city}</td>
                <td className="text-center">{r.status}</td>
              </tr>
            ))}
            {sampleRows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer brand bar */}
      <div className="bg-yellow h-[1.3%]" />
      <div className="flex gap-2 justify-end items-center pr-8 py-2 bg-primary">
        <img
          src="/src/assets/images/patient/applicationstatus/printlocation.svg"
          className="h-3"
          alt="location icon"
        />
        <p className="text-white text-[9.5px]">
          35 Eduardo Aboitiz Street, Cebu City 6000 Philippines
        </p>
        <img
          src="/src/assets/images/patient/applicationstatus/printtelephone.svg"
          className="h-3"
          alt="telephone icon"
        />
        <p className="text-white text-[9.5px]">
          +63 (032) 265-5910, +63 998 967 1917, +63 998 966 0737
        </p>
        <img
          src="/src/assets/images/patient/applicationstatus/printemail.svg"
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
};

export default LOAPrintTemplate;
