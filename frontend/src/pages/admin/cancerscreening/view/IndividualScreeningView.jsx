import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";

import api from "src/api/axiosInstance";

const IndividualScreeningView = () => {
  const location = useLocation();
  const record = location.state?.record;

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
  const [modalAction, setModalAction] = useState(null);

  // Screening Date Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState("");

  // Remark Message Modal
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (record) {
      setStatus(record.status);
      setScreeningDate(record.screening_date || "");
    }
  }, [record]);

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "In Progress") {
      setTempDate(screeningDate || "");
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
    } else if (selectedStatus === "Return" || selectedStatus === "Reject") {
      setRemarksModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
    } else {
      setModalText(`Confirm status change to "${selectedStatus}"?`);
      setModalAction({ newStatus: selectedStatus });
      setModalOpen(true);
      // setStatus(selectedStatus);
    }
  };

  const handleDateModalConfirm = () => {
    if (!tempDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    setScreeningDate(tempDate);
    setModalText(`Confirm screening date to ${tempDate}?`);
    setIsNewDate(true);
    setModalOpen(true);
    setDateModalOpen(false);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.newStatus) {
      setStatus(modalAction.newStatus);
      setModalOpen(false);
      setLoading(true);
      try {
        const payload = { status: modalAction.newStatus };
        if (screeningDate) payload.screening_date = screeningDate;

        await api.patch(
          `/cancer-screening/individual-screening/status-update/${record.id}/`,
          payload
        );

        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Successfully updated status.",
        });
        setShowModal(true);
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
          `/cancer-screening/individual-screening/status-update/${record.id}/`,
          { screening_date: screeningDate }
        );
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Screening date updated successfully.",
        });
        setShowModal(true);
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
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Remarks sent successfully.",
        });
        setShowModal(true);
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
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Request rejected successfully.",
        });
        setShowModal(true);
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
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">Record not found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global Modals */}
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
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
      <LoadingModal open={loading} text="Submitting changes..." />

      {/* Schedule Modal */}
      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Set Screening Date</h2>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => setDateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                onClick={handleDateModalConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Screen layout */}
      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        {/* Header bar */}
        <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Individual Screening</h1>
          <Link to={"/Admin/cancerscreening/AdminIndividualScreening"}>
            <img src="/images/back.png" alt="Back" className="h-6" />
          </Link>
        </div>

        {/* Content */}
        <div className="h-full w-full overflow-auto p-5 flex flex-col gap-4">
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
                {status}
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
                  <option value="LOA Generation">LOA Generation</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Return">Return</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Screening Date</span>
                <span className="text-gray-700">{record.screening_date ? (
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
                </span>
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
                <span className="font-medium w-40">Pre-Screening Form</span>
                <Link 
                  className="text-blue-700"
                  to="/Admin/cancerscreening/view/ViewPreScreeningForm"
                  state={record}
                >
                  View
                </Link>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Required Documents</span>
                <Link 
                  className="text-blue-700"
                  to={"/Admin/cancerscreening/view/ViewAttachments"}
                  state={record}
                >
                  View
                </Link>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Letter of Authority</span>
                <span className="text-blue-700">
                  View
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-40">Lab Results</span>
                <Link 
                  className="text-blue-700"
                  to={"/Admin/cancerscreening/view/ViewResults"}
                  state={record}
                >
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="w-full flex flex-col md:flex-row gap-3 justify-between">
            {/* <Link
              className="text-center font-bold bg-primary text-white py-2 w-full md:w-[23%] rounded-md shadow hover:opacity-90"
              to={"/Admin/cancerscreening/view/ViewResults"}
              state={record}
            >
              Save Changes
            </Link> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default IndividualScreeningView;
