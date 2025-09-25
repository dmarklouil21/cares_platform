import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

import DateModal from "src/components/Modal/DateModal";
import FileUploadModal from "src/components/Modal/FileUploadModal";

import LOAPrintTemplate from "./LOAPrintTemplate/";

const AdminCancerManagementView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [record, setRecord] = useState(null);

  const [status, setStatus] = useState("Pending");
  const [treatmentDate, setTreatmentDate] = useState(null);
  const [isNewDate, setIsNewDate] = useState(false);

  const [dateModalTitle, setDateModalTitle] = useState("");

  // Interview Date Modal
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  // Loading State
  const [loading, setLoading] = useState(false);

  // Confirmation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Status Change?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Treatment Date Modal State
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState("");

  // Remark Message Modal State
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Send LOA Modal State
  const [sendLOAModalOpen, setSendLOAModalOpen] = useState(false);
  const [loaFile, setLoaFile] = useState(null);

  // Send Case Summary Modal State
  const [sendCaseSummaryModalOpen, setSendCaseSummaryModalOpen] =
    useState(false);
  const [caseSummaryFile, setCaseSummaryFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/cancer-management/details/${id}/`);
        console.log("Response Data: ", data);
        setRecord(data);
        setStatus(data.status);
      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "Approved") {
      setTempDate(treatmentDate || "");
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
    } else if (selectedStatus === "Interview Process") {
      setInterviewDate(record?.interview_date || "");
      setInterviewModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
    } else if (selectedStatus === "Return" || selectedStatus === "Rejected") {
      setRemarksModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
    } else {
      setModalText(`Mark this request as '${selectedStatus}'?`);
      setModalDesc(
        "Marking this as complete means that the treatment is done."
      );
      setModalAction({ newStatus: selectedStatus });
      setModalOpen(true);
      // setStatus(selectedStatus);
    }
  };

  const handleInterviewConfirm = () => {
    if (!interviewDate) {
      alert("Please select an interview date before proceeding.");
      return;
    }
    setModalText(`Confirm Interview Date to ${interviewDate}?`);
    setIsNewDate(true);
    setModalOpen(true);
    setInterviewModalOpen(false);
  };

  const handleDateModalConfirm = () => {
    if (!tempDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    setTreatmentDate(tempDate);
    setModalText(`Confirm Treatment Date to ${tempDate}?`);
    setIsNewDate(true);
    setModalOpen(true);
    setDateModalOpen(false);
  };

  const handleSendLOA = async () => {
    if (!loaFile) {
      setSendLOAModalOpen(false);
      setModalInfo({
        type: "info",
        title: "Note",
        message: "Please select a file before sending.",
      });
      setShowModal(true);
      return;
    }
    setSendLOAModalOpen(false);
    setLoaFile(null);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", loaFile);
      formData.append("patient_name", record.patient.full_name);
      formData.append("email", record.patient.email);

      await api.post(`/cancer-management/send-loa/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setModalInfo({
        type: "success",
        title: "LOA Sent",
        message: "The LOA has been sent successfully.",
      });
      setShowModal(true);
    } catch (error) {
      setModalInfo({
        type: "error",
        title: "Failed",
        message: "Something went wrong while sending the LOA.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCaseSummary = async () => {
    if (!caseSummaryFile) {
      setSendCaseSummaryModalOpen(false);
      setModalInfo({
        type: "info",
        title: "Note",
        message: "Please select a file before sending.",
      });
      setShowModal(true);
      return;
    }
    setSendCaseSummaryModalOpen(false);
    setCaseSummaryFile(null);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", caseSummaryFile);
      formData.append("patient_name", record.patient.full_name);
      formData.append("email", record.patient.email);

      await api.post(`/cancer-management/send-case-summary/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setModalInfo({
        type: "success",
        title: "Case Summary Sent",
        message: "The case summary has been sent successfully.",
      });
      setShowModal(true);
    } catch (error) {
      setModalInfo({
        type: "error",
        title: "Failed",
        message: "Something went wrong while sending the case summary.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = async () => {
    if (modalAction?.newStatus) {
      setStatus(modalAction.newStatus);
      setModalOpen(false);
      setLoading(true);
      try {
        const payload = { status: modalAction.newStatus };
        if (treatmentDate) payload.treatment_date = treatmentDate;
        if (interviewDate) payload.interview_date = interviewDate;

        await api.patch(
          `/cancer-management/cancer-treatment/status-update/${record.id}/`,
          payload
        );
        console.log(payload);
        navigate("/admin/cancer-management", {
          state: {
            type: "success",
            message: "Updated Successfully.",
          },
        });
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Update Failed",
          message: "Something went wrong while submitting the form.",
        });
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    } else if (isNewDate) {
      setModalOpen(false);
      setLoading(true);
      try {
        await api.patch(
          `/cancer-management/cancer-treatment/status-update/${record.id}/`,
          { treatment_date: treatmentDate }
        );

        navigate("/admin/cancer-management", {
          state: {
            type: "success",
            message: "Treatment date updated Successfully.",
          },
        });
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed",
          message: "Something went wrong while updating screening date.",
        });
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  const handleReturn = async () => {
    if (modalAction?.newStatus === "Return") {
      setModalOpen(false);
      setLoading(true);
      setRemarksModalOpen(false);
      try {
        await api.post(
          `/cancer-screening/individual-screening/return-remarks/${record.id}/`,
          { remarks }
        );

        navigate("/Admin/cancerscreening/AdminIndividualScreening", {
          state: {
            type: "success",
            message: "Return remarks sent.",
          },
        });
      } catch {
        setModalInfo({
          type: "error",
          title: "Failed",
          message: "Something went wrong while sending remarks.",
        });
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    } else if (modalAction?.newStatus === "Reject") {
      setStatus(modalAction.newStatus);
      setModalOpen(false);
      setLoading(true);
      setRemarksModalOpen(false);
      try {
        await api.patch(
          `/cancer-screening/individual-screening/status-reject/${record.id}/`,
          { status: modalAction.newStatus, remarks }
        );
        navigate("/Admin/cancerscreening/AdminIndividualScreening", {
          state: {
            type: "success",
            message: "Request Rejected.",
          },
        });
      } catch {
        setModalInfo({
          type: "error",
          title: "Failed",
          message: "Something went wrong while rejecting request.",
        });
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const statusPillClasses =
    status === "Completed"
      ? "bg-green-100 text-green-700 border border-green-200"
      : status === "Interview Process"
      ? "bg-blue-100 text-blue-700 border border-blue-200"
      : status === "Approved"
      ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
      : status === "Case Summary Generation"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : status === "Rejected"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-yellow-100 text-yellow-700";

  if (!record) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">Record not found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && <SystemLoader />}

      <ConfirmationModal
        open={modalOpen}
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalAction(null);
          setModalText("");
        }}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />

      {/* Schedule Modal */}
      <DateModal
        open={dateModalOpen}
        title="Set Treatment Date"
        value={tempDate}
        onChange={setTempDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />
      <DateModal
        open={interviewModalOpen}
        title="Set Interview Date"
        value={interviewDate}
        onChange={setInterviewDate}
        onConfirm={handleInterviewConfirm}
        onCancel={() => setInterviewModalOpen(false)}
      />

      {/* Return remarks Modal */}
      {remarksModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Remarks
            </h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4 resize-none"
              rows={4}
              placeholder="Enter your remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setRemarksModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                onClick={handleReturn}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send LOA Modal */}
      <FileUploadModal
        open={sendLOAModalOpen}
        title="Send LOA"
        recipient={record?.patient?.email}
        onFileChange={setLoaFile}
        onConfirm={handleSendLOA}
        onCancel={() => setSendLOAModalOpen(false)}
      />

      {/* Send Case Summary Modal */}
      <FileUploadModal
        open={sendCaseSummaryModalOpen}
        title="Send Case Summary"
        recipient={record?.patient?.email}
        onFileChange={setCaseSummaryFile}
        onConfirm={handleSendCaseSummary}
        onCancel={() => setSendCaseSummaryModalOpen(false)}
      />

      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray overflow-auto">
        {/* Header */}
        <div className=" h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Cancer Management</h1>
          <div>
            <Link to={"/admin/cancer-management"}>
              <img
                src="/images/back.png"
                alt="Back"
                className="h-6 cursor-pointer"
              />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="h-fit w-full  flex flex-col gap-4">
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Request Information</h2>
              <span
                className={`text-xs px-2 py-1 rounded ${statusPillClasses}`}
              >
                {status}
              </span>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-medium w-40">Patient ID</span>
                <span className="text-gray-700">
                  {record?.patient?.patient_id || "---"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Patient Name</span>
                <span className="text-gray-700">
                  {record?.patient?.full_name || "---"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Service Requested</span>
                <span className="text-gray-700">
                  {record?.service_type || "---"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Date Submitted</span>
                <span className="text-gray-700">
                  {record?.date_submitted
                    ? new Date(record?.date_submitted).toLocaleDateString(
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

              <div className="flex gap-2">
                <span className="font-medium w-40">Status</span>
                <select
                  className="-ml-1 outline-none focus:ring-0 text-gray-700"
                  value={status}
                  onChange={handleStatusChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Interview Process">Interview Process</option>
                  <option value="Case Summary Generation">
                    Case Summary Generation
                  </option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Treatment Date</span>
                <span className="text-gray-700">
                  {record?.treatment_date
                    ? new Date(record?.treatment_date).toLocaleDateString(
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

              <div className="flex gap-2">
                <span className="font-medium w-40">Interview Schedule</span>
                <span className="text-gray-700">
                  {record?.interview_date
                    ? new Date(record?.interview_date).toLocaleDateString(
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
                  to={`/admin/cancer-management/view/${record?.id}/pre-screening-form`}
                  state={record?.patient}
                >
                  View
                </Link>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Well Being Form</span>
                <Link
                  className="text-blue-700"
                  to={`/admin/cancer-management/view/${record?.id}/well-being-form`}
                  state={record}
                >
                  View
                </Link>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Required Documents</span>
                <Link
                  className="text-blue-700"
                  to={`/admin/cancer-management/view/${record?.id}/attachments`}
                  state={record}
                >
                  View
                </Link>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Lab Results</span>
                <Link
                  className="text-blue-700"
                  to={`/admin/cancer-management/view/${record?.id}/results`}
                  state={record}
                >
                  View
                </Link>
              </div>

              {/* <div className="flex gap-2">
                <span className="font-medium w-40">Signed Case Summary</span>
                <Link
                  className="text-blue-700"
                  to={`/admin/cancer-management/view/${record?.id}/results`}
                  state={record}
                >
                  View
                </Link>
              </div> */}
            </div>
          </div>

          {/* LOA Actions */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">LOA Actions</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-medium w-40">Letter of Authority</span>
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
                  onClick={() => setSendLOAModalOpen(true)}
                >
                  Send
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Case Summary</span>
                <Link
                  className="text-blue-700 cursor-pointer"
                  to={`/admin/cancer-management/view/${record?.id}/case-summary`}
                  state={record}
                  // onClick={() => setSendLOAModalOpen(true)}
                >
                  Create
                </Link>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Send Case Summary</span>
                <span
                  className="text-blue-700 cursor-pointer"
                  onClick={() => setSendCaseSummaryModalOpen(true)}
                >
                  Send
                </span>
              </div>
            </div>
          </div>
        </div>
        <LOAPrintTemplate loaData={record} />
      </div>
    </>
  );
};

export default AdminCancerManagementView;
