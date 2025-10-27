import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";

import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal";

import api from "src/api/axiosInstance";

import LOAPrintTemplate from "./LOAPrintTemplate";

const DetailedView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const { id } = useParams();
  // const record = location.state?.record;

  const [status, setStatus] = useState("");
  const [screeningDate, setScreeningDate] = useState(null);
  const [isNewDate, setIsNewDate] = useState(false);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "Success!",
    message: "The form has been submitted successfully.",
  });

  // Loading Modal
  const [loading, setLoading] = useState(false);

  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Status Change?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Screening Date Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [dateModalTitle, setDateModalTitle] = useState("Set Screening Date");

  // Remark Message Modal
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Send LOA Modal
  const [sendLOAModalOpen, setSendLOAModalOpen] = useState(false);
  const [loaFile, setLoaFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // individual-screening/details/<int:id>
        const { data } = await api.get(`/cancer-screening/individual-screening/details/${id}/`);
        console.log("Response Data: ", data);
        setRecord(data);
        setStatus(data.status);
        setScreeningDate(data.screening_date || null);
      } catch (error) {
        console.error("Error fetching screening data:", error);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   if (record) {
  //     setStatus(record.status);
  //     setScreeningDate(record.screening_date || null);
  //   }
  // }, [record]);

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "Approve") {
      // setTempDate(screeningDate || "");
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else if (selectedStatus === "Return" || selectedStatus === "Reject") {
      setRemarksModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
    } else {
      // setModalText(`Confirm status change to "${selectedStatus}"?`);
      // setModalDesc("Make sure the necessary procedure are finished before proceeding.");
      setModalAction({ newStatus: selectedStatus });
      // setModalOpen(true);
      setStatus(selectedStatus);
    }
  };

  const handleDateModalConfirm = () => {
    if (!screeningDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    setModalAction((prev) => ({ ...prev, newScreeningDate: screeningDate }));
    // setScreeningDate(tempDate);
    // setModalText(`Screening date set to ${tempDate}?`);
    // setModalDesc("Make sure the date is correct before proceeding.");
    // setIsNewDate(true);
    // setModalOpen(true);
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

      await api.post(
        `/cancer-screening/individual-screening/send-loa/`,
        formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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

  const handleSaveChanges = () => {
    setModalText("Save changes?");
    setModalDesc("Please confirm before proceeding.");
    setModalOpen(true);
    setModalAction({ newStatus: null });
  };

  const handleModalConfirm = async () => {
    // if (modalAction?.newStatus) {
      // setStatus(modalAction.newStatus);
      setModalOpen(false);
      setLoading(true);
      try {
        const payload = { 
          status: modalAction.newStatus || status,
          screening_date: modalAction.newScreeningDate || screeningDate,
        };
        // if (screeningDate) payload.screening_date = screeningDate;

        await api.patch(
          `/cancer-screening/individual-screening/status-update/${record.id}/`,
          payload
        );
        navigate("/admin/cancer-screening", { 
          state: { 
            type: "success", message: "Updated Successfully." 
          } 
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
    // } 
    /* else if (isNewDate) {
      setModalOpen(false);
      setLoading(true);
      try {
        await api.patch(
          `/cancer-screening/individual-screening/status-update/${record.id}/`,
          { screening_date: screeningDate }
        );

        navigate("/admin/cancer-screening", { 
          state: { 
            type: "success", message: "Screening date updated Successfully." 
          } 
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
    } */

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

        navigate("/admin/cancer-screening", { 
          state: { 
            type: "success", message: "Return remarks sent." 
          } 
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
        navigate("/admin/cancer-screening", { 
          state: { 
            type: "success", message: "Request Rejected." 
          } 
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

  if (!record) {
    return (
      <SystemLoader />
    );
  }

  return (
    <>
      {/* Global Modals */}
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
      {/* <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      /> */}
      <DateModal
        open={dateModalOpen}
        title={dateModalTitle}
        value={screeningDate}
        onChange={setScreeningDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />
      {/* <LoadingModal open={loading} text="Submitting changes..." /> */}

      {/* Return remarks Modal */}
      {remarksModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Remarks</h2>
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
      {sendLOAModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Send LOA</h2>
            
            <p className="text-sm text-gray-600 mb-3">
              Recipient: <span className="font-medium">{record.patient.email}</span>
            </p>

            <input
              type="file"
              accept="application/pdf"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4"
              onChange={(e) => setLoaFile(e.target.files[0])}
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setSendLOAModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                onClick={handleSendLOA}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen layout */}
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray overflow-auto">
        {/* Header bar */}
        {/* <div className="bg-[#F0F2F5] h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Individual Screening</h1>
          <Link to={"/admin/cancer-screening"}>
            <img src="/images/back.png" alt="Back" className="h-6 cursor-pointer" />
          </Link>
        </div> */}

        {/* Content */}
        <div className="h-full w-full flex flex-col gap-4">
          {/* Patient Info Card */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Screening Information</h2>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  status === "Complete"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {record?.status}
              </span>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-medium w-40">Patient ID</span>
                <span className="text-gray-700">
                  {record.patient.patient_id}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Patient Name</span>
                <span className="text-gray-700">{record.patient.full_name}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Procedure Name</span>
                <span className="text-gray-700">{record.procedure_name || "---"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Procedure Details</span>
                <span className="text-gray-700">{record.procedure_details || "---"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Cancer Site</span>
                <span className="text-gray-700">{record.cancer_site || "---"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Date Submitted</span>
                <span className="text-gray-700">{new Date(record.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
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
                  <option value="Approve">Approve</option>
                  {/* <option value="LOA Generation">LOA Generation</option> */}
                  {/* <option value="In Progress">In Progress</option> */}
                  <option value="Complete">Complete</option>
                  {/* <option value="Return">Return</option> */}
                  {/* <option value="Reject">Reject</option> */}
                </select>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Screening Date</span>
                <span className="text-gray-700">
                  {screeningDate
                    ? new Date(screeningDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "---"}
                </span>
                {status === "Approve" && screeningDate && (
                  <span
                    className="text-sm text-blue-700 cursor-pointer"
                    onClick={() => setDateModalOpen(true)}
                  >
                    Edit
                  </span>
                )}
                {/* <span className="text-gray-700">{record.screening_date ? (
                  new Date(record.screening_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )) : (
                    "---"
                  )}
                </span> */}
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Service Provider</span>
                <select
                  className="-ml-1 outline-none focus:ring-0 text-gray-700"
                  value={record?.service_provider || ""}
                  // onChange={handleStatusChange}
                >
                  <option value="Chong Hua Hospital Mandaue">Chong Hua Hospital Mandaue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Info Card */}
          <div className="bg-white rounded-md shadow border border-black/10">
            <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Additional Information</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-medium w-50">Pre-Screening Form</span>
                <Link 
                  className="text-blue-700"
                  to="/admin/cancer-screening/view/pre-screening-form"
                  state={record}
                >
                  View
                </Link>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-50">Required Documents</span>
                <Link 
                  className="text-blue-700"
                  to={"/admin/cancer-screening/view/attachments"}
                  state={record}
                >
                  View
                </Link>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-50">Screening Results <span className="text-xs text-red-500">(Missing)</span></span>
                <Link 
                  className="text-blue-700"
                  to={"/admin/cancer-screening/view/results"}
                  state={record}
                >
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {record?.status !== "Pending" && 
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
                    onClick={() => setSendLOAModalOpen(true)}
                    state={record}
                  >
                    Send
                  </span>
                </div>
              </div>
            </div>
          }

          <div className="flex justify-around print:hidden">
            <Link
              to={`/admin/cancer-screening`}
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
          <br />
        </div>
        <LOAPrintTemplate loaData={record} />
      </div>
    </>
  );
};

export default DetailedView;
