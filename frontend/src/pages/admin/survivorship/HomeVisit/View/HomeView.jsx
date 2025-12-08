import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import { Save, Calendar, ArrowLeft, Send, Printer } from "lucide-react";

import api from "src/api/axiosInstance";

// Components
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
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
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [visitDate, setVisitDate] = useState(null);

  // Narrative Fields
  const [visitPurpose, setVisitPurpose] = useState("");
  const [findings, setFindings] = useState("");
  const [recommendations, setRecommendations] = useState("");

  // Loading & Notification
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );

  // Modals State
  const [modalOpen, setModalOpen] = useState(false); // Confirmation
  const [modalText, setModalText] = useState("Confirm Action?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateModalTitle, setDateModalTitle] = useState("Set Visitation Date");

  const [sendReportModalOpen, setSendReportModalOpen] = useState(false);
  const [reportFile, setReportFile] = useState(null);

  const [showModal, setShowModal] = useState(false); // Info Modal
  const [modalInfo, setModalInfo] = useState({
    type: "info",
    title: "Info",
    message: "",
  });

  // Narrative Modals
  const [visitPurposeModalOpen, setVisitPurposeModalOpen] = useState(false);
  const [findingsModalOpen, setFindingsModalOpen] = useState(false);
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/survivorship/home-visit/view/${id}/`);
      setData(data);
      setStatus(data.status);
      setVisitDate(data.visit_date || null);
      setVisitPurpose(data.purpose_of_visit || "");
      setFindings(data.findings || "");
      setRecommendations(data.recommendations || "");
    } catch (error) {
      console.error("Error fetching record:", error);
      setNotificationType("error");
      setNotification("Failed to load record details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Auto-hide notification
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  // --- Handlers ---

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "Processing") {
      setDateModalTitle("Set Visitation Date");
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else {
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    }
  };

  const handleDateModalConfirm = () => {
    if (!visitDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    setModalAction((prev) => ({ ...prev, newvisitDate: visitDate }));
    setDateModalOpen(false);
  };

  const handleSendReport = async () => {
    if (!reportFile) {
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

      await api.post(`/survivorship/home-visit/send-report/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotificationType("success");
      setNotification("Report sent successfully.");
    } catch (error) {
      setNotificationType("error");
      setNotification("Something went wrong while sending the report.");
    } finally {
      setLoading(false);
      setReportFile(null);
    }
  };

  const handleSaveChanges = () => {
    setModalText("Save changes?");
    setModalDesc("Confirm to save the changes.");
    setModalOpen(true);
    // setModalAction({ newStatus: null }); // Preserve existing changes
  };

  const handleModalConfirm = async () => {
    try {
      setLoading(true);
      setModalOpen(false);

      let payload = {
        status: modalAction?.newStatus || status,
        visit_date: modalAction?.newvisitDate || visitDate,
        purpose_of_visit: modalAction?.newVisitPurpose || visitPurpose,
        findings: modalAction?.newFindings || findings,
        recommendations: modalAction?.newRecommendations || recommendations,
      };

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
  };

  const generatePdf = () => {
    if (!data) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const M = 48;
    let y = 60;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("PATIENT HOME VISIT REPORT", width / 2, y, { align: "center" });
    y += 32;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const drawLabelLine = (label, value) => {
      const text = `${label}:`;
      doc.text(text, M, y);
      const startX = M + doc.getTextWidth(text) + 6;
      const endX = width - M;
      doc.setDrawColor(180);
      doc.line(startX, y + 3, endX, y + 3);
      if (value && value !== "—") {
        doc.setTextColor(20);
        doc.text(String(value), startX + 4, y);
        doc.setTextColor(0);
      }
      y += 22;
    };

    drawLabelLine("Name of Patient", data.patient.full_name);
    drawLabelLine(
      "Current Cancer Diagnosis",
      data.patient.diagnosis[0]?.diagnosis
    );
    drawLabelLine("Date & Time of Visit", `${data.visit_date}`);
    y += 4;

    doc.setFont("helvetica", "bold");
    doc.text("Purpose of Visit:", M, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    const bullets = [`${data.purpose_of_visit}`];
    const maxW = width - M * 2 - 16;
    bullets.forEach((b) => {
      const wrapped = doc.splitTextToSize(b, maxW);
      doc.circle(M + 3, y - 3, 1.5, "F");
      doc.text(wrapped, M + 12, y);
      const h = doc.getTextDimensions(wrapped).h;
      y += h + 8;
    });
    doc.setDrawColor(200);
    doc.line(M, y, width - M, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Findings/ Observations:", M, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    const findingsWrapped = doc.splitTextToSize(
      data.findings || "",
      width - M * 2
    );
    doc.text(findingsWrapped, M, y);
    y += doc.getTextDimensions(findingsWrapped).h + 6;
    const drawRuled = (count, gap = 16) => {
      for (let i = 0; i < count; i++) {
        doc.setDrawColor(210);
        doc.line(M, y, width - M, y);
        y += gap;
      }
    };
    drawRuled(6);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Recommendations:", M, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    const recoWrapped = doc.splitTextToSize(
      data.recommendations || "",
      width - M * 2
    );
    doc.text(recoWrapped, M, y);
    y += doc.getTextDimensions(recoWrapped).h + 6;
    drawRuled(3);
    y += 24;

    doc.setDrawColor(220, 38, 38);
    doc.line(M, y, M + 200, y);
    doc.line(width - M - 200, y, width - M, y);
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Prepared by: ${data.prepared_by || "Representative"}`, M, y + 18);
    doc.text(
      `Approved by: ${data.approved_by || "Administrator"}`,
      width - M - 200,
      y + 18
    );
    doc.setFontSize(10);
    doc.text("EJACC Representative", M, y + 34);
    doc.save(`PatientHomeVisit_${id}.pdf`);
  };

  if (!data && !loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Record not found.</p>
      </div>
    );
  }

  // --- Helper Styles ---
  const getStatusColor = (st) => {
    switch (st) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Closed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "Recommendation":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const statusLevels = {
    Pending: 0,
    Processing: 1,
    Recommendation: 2,
    Completed: 3,
  };
  const currentLevel = statusLevels[data?.status] || 0;

  return (
    <>
      {loading && <SystemLoader />}

      {/* --- Modals --- */}
      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />

      <Notification message={notification} type={notificationType} />

      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

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

      {/* Narrative Modals */}
      <TextAreaModal
        open={visitPurposeModalOpen}
        title="Edit Purpose of Visit"
        value={visitPurpose}
        onChange={setVisitPurpose}
        onConfirm={() => setVisitPurposeModalOpen(false)}
        onCancel={() => setVisitPurposeModalOpen(false)}
      />
      <TextAreaModal
        open={findingsModalOpen}
        title="Edit Findings"
        value={findings}
        onChange={setFindings}
        onConfirm={() => setFindingsModalOpen(false)}
        onCancel={() => setFindingsModalOpen(false)}
      />
      <TextAreaModal
        open={recommendationModalOpen}
        title="Edit Recommendations"
        value={recommendations}
        onChange={setRecommendations}
        onConfirm={() => setRecommendationModalOpen(false)}
        onCancel={() => setRecommendationModalOpen(false)}
      />

      {/* --- Main Content --- */}
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-5 px-5 md:px-5 flex flex-col flex-1">
          {/* Top Title */}
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Application Details
          </h2>

          {/* White Card Container */}
          <div className="flex flex-col gap-6 w-full bg-white rounded-lg py-7 px-5 md:px-8 flex-1 overflow-auto shadow-sm">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
              <h1 className="font-bold text-[24px] md:text-2xl text-yellow">
                Home Visit
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(
                  data?.status
                )}`}
              >
                {data?.status}
              </span>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column: Patient & Status */}
              <div className="space-y-8">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500 font-medium">
                      Patient ID
                    </span>
                    <span className="col-span-2 text-gray-900 font-semibold">
                      {data?.patient?.patient_id || "---"}
                    </span>

                    <span className="text-gray-500 font-medium">Full Name</span>
                    <span className="col-span-2 text-gray-900 font-semibold">
                      {data?.patient?.full_name || "---"}
                    </span>

                    <span className="text-gray-500 font-medium">Diagnosis</span>
                    <span className="col-span-2 text-gray-900">
                      {data?.patient?.diagnosis?.[0]?.diagnosis || "---"}
                    </span>

                    <span className="text-gray-500 font-medium">
                      Date Created
                    </span>
                    <span className="col-span-2 text-gray-900">
                      {data?.created_at
                        ? new Date(data.created_at).toLocaleDateString(
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

                {/* Status Management */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Status Management
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-sm items-center">
                    <span className="text-gray-500 font-medium">
                      Update Status
                    </span>
                    <div className="col-span-2">
                      <select
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-primary outline-none transition-shadow"
                        value={status}
                        onChange={handleStatusChange}
                        disabled={data?.status === "Completed"}
                      >
                        <option value="Pending" disabled={currentLevel > 0}>
                          Pending
                        </option>
                        <option value="Processing" disabled={currentLevel > 1}>
                          Processing
                        </option>
                        <option
                          value="Recommendation"
                          disabled={currentLevel > 2}
                        >
                          Recommendation
                        </option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <span className="text-gray-500 font-medium">
                      Visit Date
                    </span>
                    <div className="col-span-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <span className="text-gray-900 font-medium">
                        {visitDate
                          ? new Date(visitDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Not Set"}
                      </span>
                      {status === "Processing" && (
                        <button
                          onClick={() => setDateModalOpen(true)}
                          className="p-1 hover:bg-gray-200 rounded text-blue-600"
                          title="Edit Visit Date"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Wellbeing Tool Link */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Wellbeing Tool
                  </h3>
                  <div>
                    <Link
                      to={`/admin/survivorship/view/${data?.id}/wellbeing-form`}
                      state={data}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary">
                        Wellbeing Form
                      </span>
                      <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-primary" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative & Report */}
              <div className="space-y-8">
                {/* Narrative */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                    Narrative Details
                  </h3>

                  <div className="space-y-3">
                    {/* Purpose */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          Purpose of Visit
                        </span>
                        <button
                          onClick={() => setVisitPurposeModalOpen(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {visitPurpose ? "Edit" : "Add"}
                        </button>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {visitPurpose || "No purpose specified."}
                      </p>
                    </div>

                    {/* Findings & Recommendations (only if processed) */}
                    {data?.status !== "Pending" &&
                      data?.status !== "Processing" && (
                        <>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-gray-500 uppercase">
                                Findings / Observations
                              </span>
                              <button
                                onClick={() => setFindingsModalOpen(true)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {findings ? "Edit" : "Add"}
                              </button>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                              {findings || "No findings recorded."}
                            </p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-gray-500 uppercase">
                                Recommendations
                              </span>
                              <button
                                onClick={() => setRecommendationModalOpen(true)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {recommendations ? "Edit" : "Add"}
                              </button>
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                              {recommendations || "No recommendations recorded."}
                            </p>
                          </div>
                        </>
                      )}
                  </div>
                </div>

                {/* Report Generation (only if processed) */}
                {(data?.status === "Recommendation" ||
                  data?.status === "Completed") && (
                  <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-1">
                      Report Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Home Visit Report
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={generatePdf}
                            className="text-xs bg-white border border-blue-200 text-blue-700 py-2 px-3 rounded hover:bg-blue-100 transition text-left"
                          >
                            Download / Print
                          </button>
                          <button
                            onClick={() => setSendReportModalOpen(true)}
                            className="text-xs bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-left flex justify-between items-center"
                          >
                            Send via Email <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Footer Actions */}
            <div className="flex justify-around print:hidden mt-6">
              <Link
                to="/admin/survivorship"
                className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
              >
                Back
              </Link>
              <button
                onClick={handleSaveChanges}
                className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
              >
                {/* <Save className="w-4 h-4" /> */}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Footer */}
        <div className="h-16 bg-secondary shrink-0"></div>
      </div>
    </>
  );
};

export default HomeVisitView;