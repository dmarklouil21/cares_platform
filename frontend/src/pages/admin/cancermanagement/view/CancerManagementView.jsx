import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// --- Sample data used if no location.state?.record is passed ---
const buildSampleRecord = (idFromUrl) => ({
  id: Number(idFromUrl) || 1,
  status: "Pending",
  created_at: "2025-08-17", // August 17, 2025 (as in your screenshot)
  screening_date: "", // show --- if blank
  procedure_name: "---",
  procedure_details: "---",
  cancer_site: "---",
  service_type: "Chemotherapy",

  patient: {
    patient_id: "PNT-2025-000001",
    full_name: "Mark Louil Diacamos",
    email: "mark.louil.diacamos@example.com",
    city: "Cebu City",
  },

  // ========= DOCUMENTS / ATTACHMENTS (sample) =========
  // These are here so your "View" pages can read them from record.state
  pre_screening_form: [
    { label: "Has prior cancer treatment?", value: "No" },
    { label: "Allergies", value: "None" },
    { label: "Comorbidities", value: "Hypertension (controlled)" },
    { label: "Smoking Status", value: "Never" },
  ],
  required_documents: [
    {
      id: "doc-1",
      name: "Doctor Referral.pdf",
      url: "#", // put a real blob/download url if you want
      type: "application/pdf",
      uploaded_at: "2025-08-16",
    },
    {
      id: "doc-2",
      name: "Valid ID (Front).jpg",
      url: "#",
      type: "image/jpeg",
      uploaded_at: "2025-08-16",
    },
    {
      id: "doc-3",
      name: "Valid ID (Back).jpg",
      url: "#",
      type: "image/jpeg",
      uploaded_at: "2025-08-16",
    },
  ],
  lab_results: [
    {
      id: "lab-1",
      name: "CBC-Result.pdf",
      url: "#",
      type: "application/pdf",
      taken_at: "2025-08-15",
      summary: "Within normal limits",
    },
    {
      id: "lab-2",
      name: "Chest X-Ray.jpg",
      url: "#",
      type: "image/jpeg",
      taken_at: "2025-08-15",
      summary: "No acute cardiopulmonary disease",
    },
  ],

  // Optional consolidated attachments array if your subpages expect `attachments`
  attachments: {
    pre_screening_form: "pre_screening_form",
    required_documents: "required_documents",
    lab_results: "lab_results",
  },
});

const AdminCancerManagementView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Prefer state from navigation; otherwise build a sample record
  const fallbackSample = useMemo(() => buildSampleRecord(id), [id]);
  const [record, setRecord] = useState(location.state?.record || null);

  // Status local state (for the dropdown)
  const [status, setStatus] = useState(
    location.state?.record?.status || fallbackSample.status
  );

  // Try to recover from sessionStorage (list page stored cm_sample_data), else use our sample
  useEffect(() => {
    if (!record) {
      const raw = sessionStorage.getItem("cm_sample_data");
      if (raw) {
        const list = JSON.parse(raw);
        const found = list.find((x) => String(x.id) === String(id));
        setRecord(found || fallbackSample);
        setStatus((found || fallbackSample).status);
      } else {
        setRecord(fallbackSample);
        setStatus(fallbackSample.status);
      }
    }
  }, [id, record, fallbackSample]);

  if (!record) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold mb-4">Record not found.</p>
          <button
            onClick={() => navigate("/Admin/CancerManagement")}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const statusPillClasses =
    status === "Complete"
      ? "bg-green-100 text-green-700 border border-green-200"
      : "bg-gray-100 text-gray-700 border border-gray-200";

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">Cancer Management</h1>
        <Link to={"/Admin/CancerManagement"}>
          <img
            src="/images/back.png"
            alt="Back"
            className="h-6 cursor-pointer"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="h-full w-full overflow-auto p-5 flex flex-col gap-4">
        {/* Screening Information (copied layout) */}
        <div className="bg-white rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Screening Information</h2>
            <span className={`text-xs px-2 py-1 rounded ${statusPillClasses}`}>
              {status}
            </span>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex gap-2">
              <span className="font-medium w-40">Patient ID</span>
              <span className="text-gray-700">
                {record.patient?.patient_id || "---"}
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Patient Name</span>
              <span className="text-gray-700">
                {record.patient?.full_name || "---"}
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Procedure Name</span>
              <span className="text-gray-700">
                {record.procedure_name || "---"}
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Procedure Details</span>
              <span className="text-gray-700">
                {record.procedure_details || "---"}
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Cancer Site</span>
              <span className="text-gray-700">
                {record.cancer_site || "---"}
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Date Submitted</span>
              <span className="text-gray-700">
                {record.created_at
                  ? new Date(record.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "---"}
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Status</span>
              <select
                className="-ml-1 outline-none focus:ring-0 text-gray-700"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Screening Date</span>
              <span className="text-gray-700">
                {record.screening_date
                  ? new Date(record.screening_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "---"}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Information (with documents) */}
        <div className="bg-white rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Additional Information</h2>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex gap-2">
              <span className="font-medium w-40">Pre-Screening Form</span>
              <Link
                className="text-blue-700"
                to="/Admin/CancerManagement/view/AdminCancerManagementViewPreScreeningForm"
                state={record}
              >
                View
              </Link>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Required Documents</span>
              <Link
                className="text-blue-700"
                to="/Admin/CancerManagement/view/AdminCancerManagementViewAttachments"
                state={record}
              >
                View
              </Link>
            </div>

            <div className="flex gap-2">
              <span className="font-medium w-40">Lab Results</span>
              <Link
                className="text-blue-700"
                to="/Admin/CancerManagement/view/AdminCancerManagementViewResults"
                state={record}
              >
                View
              </Link>
            </div>
          </div>
        </div>

        {/* LOA Actions */}
        <div className="bg-white rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">LOA Actions</h2>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex gap-2">
              <span className="font-medium w-40">Generate LOA</span>
              <span
                className="text-blue-700 cursor-pointer"
                onClick={() => window.print()}
              >
                Download
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Send LOA</span>
              <span
                className="text-blue-700 cursor-pointer"
                onClick={() => alert("Sample only: attach LOA and send")}
              >
                Send
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCancerManagementView;
