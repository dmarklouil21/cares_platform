import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
// import LOAPrintTemplate from "../generate/LOAPrintTemplate";
import api from "src/api/axiosInstance";

// Components
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import Notification from "src/components/Notification";
import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal";
import FileUploadModal from "src/components/Modal/FileUploadModal";
import TextAreaModal from "src/components/Modal/TextAreaModal";

const HomeVisitView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Data
  const [data, setData] = useState({});
  const [status, setStatus] = useState("");
  const [visitDate, setVisitDate] = useState(null);
  const [isNewDate, setIsNewDate] = useState(false);

  // Loading & Notification
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(location.state?.type || "");

  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Action?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Visit Date Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [dateModalTitle, setDateModalTitle] = useState("Set Laboratory Test Date");

  // Send Report Modal
  const [sendReportModalOpen, setSendReportModalOpen] = useState(false);
  const [reportFile, setReportFile] = useState(null);

  // Remark Message Modal
  const [visitPurposeModalOpen, setVisitPurposeModalOpen] = useState(false);
  const [visitPurpose, setVisitPurpose] = useState("");

  const [findingsModalOpen, setFindingsModalOpen] = useState(false);
  const [findings, setFindings] = useState("");

  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState("");

  // Fetch Data
  const fetchData = async () => {
    try {
      const { data } = await api.get(`/survivorship/home-visit/view/${id}/`);
      setData(data);
      setStatus(data.status);
      setVisitDate(data.visit_date || null);
      setVisitPurpose(data.purpose_of_visit || "")
      setFindings(data.findings || "");
      setRecommendations(data.recommendations || "");
    } catch (error) {
      console.error("Error fetching record:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log("Data: ", data);

  // Auto-hide notification
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Handlers
  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "Processing") {
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else {
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    }
  };

  const handleDateModalConfirm = async () => {
    if (!visitDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    // setVisitDate(tempDate);
    setModalAction((prev) => ({ ...prev, newvisitDate: tempDate }));
    // setIsNewDate(true);
    setDateModalOpen(false);
  };

  const handleSendReport = async () => {
    if (!loaFile) {
      setSendReportModalOpen(false);
      setModalInfo({
        type: "info",
        title: "Note",
        message: "Please select a file before sending.",
      });
      setShowModal(true);
      return;
    }

    try {
      setSendReportModalOpen(false);
      setLoading(true);
      const formData = new FormData();
      formData.append("file", reportFile);
      formData.append("patient_name", data.patient?.full_name);
      formData.append("email", data.patient?.email);

      await api.post(`/post-treatment/send-loa/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotificationType("success");
      setNotification("Success.");

    } catch (error) {
      setNotificationType("error");
      setNotification("Something went wrong while submitting the changes.");
    } finally {
      setLoading(false);
      setLoaFile(null);
    }
  };

  const handleSaveChanges = () => {
    setModalText("Save changes?");
    setModalDesc("Confirm to save the changes.");
    setModalOpen(true);
    setModalAction({ newStatus: null });
  };

  const handleModalConfirm = async () => {
    try {
      setLoading(true);
      setModalOpen(false);

      let payload = {
        status: modalAction.newStatus || status,
        visit_date: modalAction.newvisitDate || visitDate,
        purpose_of_visit: modalAction.newVisitPurpose || visitPurpose,
        findings: modalAction.newFindings || findings,
        recommendations: modalAction.newRecommendations || recommendations
      };
      console.log("Payload: ", payload);
      await api.patch(`/survivorship/home-visit/update/${data.id}/`, payload);

      setNotificationType("success");
      setNotification("Success.");
      fetchData();
    } catch (error) {
      setNotificationType("error");
      setNotification("Something went wrong while submitting the changes.");
    } finally {
      setLoading(false);
      setModalAction(null);
    }
  }

  const loaData = {
    patient: {
      full_name: data.patient?.full_name,
      city: data.patient?.city,
      age: data.patient?.age,
      diagnosis: [{}],
    },
    procedure_name: data.procedure_name,
  };

  const statusPillClasses =
    data?.status === "Completed"
      ? "bg-green-100 text-green-700 border border-green-200"
      : data?.status === "Processing"
      ? "bg-blue-100 text-blue-700 border border-blue-200"
      : data?.status === "Closed"
      ? "bg-gray-100 text-gray-700 border border-gray-200"
      : data?.status === "Pending"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : data?.status === "Rejected"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-yellow-100 text-yellow-700";

  return (
    <>
      {loading && <SystemLoader />}

      {/* Modals */}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />
      <Notification message={notification} type={notificationType} />
      <DateModal
        open={dateModalOpen}
        title={dateModalTitle}
        value={visitDate}
        onChange={setVisitDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />
      <FileUploadModal
        open={sendReportModalOpen}
        title="Send Report"
        recipient={data?.patient?.email}
        onFileChange={setReportFile}
        onConfirm={handleSendReport}
        onCancel={() => setSendReportModalOpen(false)}
      />
      {/* Visit Purpose */}
      <TextAreaModal 
        open={visitPurposeModalOpen}
        title="Add Purpose of Visit"
        value={visitPurpose}
        onChange={setVisitPurpose}
        onConfirm={() => setVisitPurposeModalOpen(false)}
        onCancel={() => setVisitPurposeModalOpen(false)}
      />
      {/* Findings */}
      <TextAreaModal 
        open={findingsModalOpen}
        title="Add Findings"
        value={findings}
        onChange={setFindings}
        onConfirm={() => setFindingsModalOpen(false)}
        onCancel={() => setFindingsModalOpen(false)}
      />
      {/* Recommendations */}
      <TextAreaModal 
        open={recommendationModalOpen}
        title="Add Recommendations"
        value={recommendations}
        onChange={setRecommendations}
        onConfirm={() => setRecommendationModalOpen(false)}
        onCancel={() => setRecommendationModalOpen(false)}
      />

      {/* Page Content */}
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray overflow-auto">
        {/* Header */}
        {/* <div className="h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Treatment Info</h1>
          <Link to={"/admin/treatment-assistance/post-treatment"}>
            <img src="/images/back.png" alt="Back" className="h-6 cursor-pointer" />
          </Link>
        </div> */}

        {/* Home Visit Info */}
        <div className="h-fit w-full flex flex-col gap-4">
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Patient Home Visit Details</h2>
              <span className={`text-xs px-2 py-1 rounded ${statusPillClasses}`}>
                {data?.status}
              </span>
              {/* <div className="flex gap-2">
                <h2 className="text-lg font-semibold">Post-Treatment Laboratory Request</h2>
                <span className={`text-xs px-2 py-1 rounded ${statusPillClasses}`}>
                  {data?.status}
                </span>
              </div>
              <div>
                <Link to={"/admin/treatment-assistance/post-treatment"}>
                  <img src="/images/back.png" alt="Back" className="h-6 cursor-pointer" />
                </Link>
              </div> */}
            </div>
            {/* Info Fields */}
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-medium w-40">Patient ID</span>
                <span className="text-gray-700">{data?.patient?.patient_id || "---"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Patient Name</span>
                <span className="text-gray-700">{data?.patient?.full_name || "---"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Diagnosis</span>
                <span className="text-gray-700">
                  {data?.patient?.diagnosis?.[0]?.diagnosis || "---"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Status</span>
                <select
                  className="-ml-1 outline-none focus:ring-0 text-gray-700"
                  value={status}
                  onChange={handleStatusChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Date Created</span>
                <span className="text-gray-700">
                  {data?.created_at
                    ? new Date(data?.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "---"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Visit Date</span>
                <span className="text-gray-700">
                  {visitDate
                    ? new Date(visitDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "---"}
                </span>
                {status === "Processing" && visitDate && (
                  <span
                    className="text-sm text-blue-700 cursor-pointer"
                    onClick={() => setDateModalOpen(true)}
                  >
                    Edit
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Wellbeing Tool */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Wellbeing Tool</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-medium w-40">Wellbeing Form</span>
                <Link
                  className="text-blue-700"
                  to={`/admin/survivorship/view/${data?.id}/wellbeing-form`}
                  state={data}
                >
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {data?.status !== "Pending" && (
            <div className="bg-white rounded-md shadow border border-black/10">
              <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Narrative</h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-medium w-40">Purpose of Visit</span>
                  <span
                    className="text-gray-700 break-words flex-1"
                  >
                    {visitPurpose}
                    {!visitPurpose && 
                      <span 
                        className="text-blue-700 cursor-pointer"
                        onClick={() => setVisitPurposeModalOpen(true)}
                      >
                        Add
                      </span>
                    }
                  </span>
                  {visitPurpose &&
                    <span
                      className="text-sm text-blue-700 cursor-pointer"
                      onClick={() => setVisitPurposeModalOpen(true)}
                    >
                      Edit
                    </span>
                  }
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium w-40 shrink-0">Findings/Observation</span>
                  <span
                    className="text-gray-700 break-words flex-1"
                  >
                    {findings}
                    {!findings && 
                      <span 
                        className="text-blue-700 cursor-pointer"
                        onClick={() => setFindingsModalOpen(true)}
                      >
                        Add
                      </span>
                    }
                  </span>
                  {findings &&
                    <span
                      className="text-sm text-blue-700 cursor-pointer"
                      onClick={() => setFindingsModalOpen(true)}
                    >
                      Edit
                    </span>
                  }
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium w-40 shrink-0">Recommendation</span>
                  <span
                    className="text-gray-700 break-words flex-1"
                  >
                    {recommendations}
                    {!recommendations && 
                      <span 
                        className="text-blue-700 cursor-pointer"
                        onClick={() => setRecommendationModalOpen(true)}
                      >
                        Add
                      </span>
                    }
                  </span>
                  {recommendations &&
                    <span
                      className="text-sm text-blue-700 cursor-pointer"
                      onClick={() => setRecommendationModalOpen(true)}
                    >
                      Edit
                    </span>
                  }
                </div>
              </div>
            </div>
          )}

          {/* Report Generation */}
          {data?.status === "Completed" && (
            <div className="bg-white rounded-md shadow border border-black/10">
              <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Report Generation</h2>
              </div>
              <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex gap-2">
                  <span className="font-medium w-40">Generate Report</span>
                  <span
                    className="text-blue-700 cursor-pointer"
                    onClick={() => window.print()}
                  >
                    Download
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium w-40">Send Report</span>
                  <span
                    className="text-blue-700 cursor-pointer"
                    // onClick={() => setSendLOAModalOpen(true)}
                  >
                    Send
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-around print:hidden">
            <Link
              to={`/admin/survivorship`}
              className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md"
            >
              Back
            </Link>
            <button
              onClick={handleSaveChanges}
              className="py-2 w-[30%] bg-primary rounded-md text-white hover:opacity-90 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeVisitView;
