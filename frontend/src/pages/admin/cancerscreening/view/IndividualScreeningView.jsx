import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";
import api from "src/api/axiosInstance";

const IndividualScreeningView = () => {
  const location = useLocation();
  const record = location.state?.record;
  const [status, setStatus] = useState("");
  const [patient, setPatient] = useState("");
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
      setPatient(record.patient);
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
    }

    /* setModalText(`Confirm status change to "${selectedStatus}"?`);
    setModalAction({ newStatus: selectedStatus });
    setModalOpen(true); */
  };

  const handleDateModalConfirm = () => {
    if (!tempDate) {
      alert("Please select a date before proceeding.");
      return;
    }
    setScreeningDate(tempDate);
    setModalText(`Confirm screening date to ${tempDate}?`);
    // setModalAction({ newDate: tempDate});
    setIsNewDate(true);
    setModalOpen(true);
    setDateModalOpen(false);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.newStatus) {
      setStatus(modalAction.newStatus);
      
      setLoading(true);
      try {
        const payload = {
          status: modalAction.newStatus,
        };

        if (screeningDate) {
          payload.screening_date = screeningDate;
        };

        // if (modalAction.newStatus === "Approve") {
        //   payload.date_approved = new Date().toISOString().split("T")[0];
        // }

        const response = await api.patch(`/cancer-screening/individual-screening/status-update/${record.id}/`,
          payload
        ); 
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Successfully change.",
        });
        setShowModal(true);
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to update status changes",
          message: "Something went wrong while submitting the form.",
        });
        setShowModal(true);
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    } else if(isNewDate) {
      setLoading(true);
      try {
        const response = await api.patch(`/cancer-screening/individual-screening/status-update/${record.id}/`, {
          // status: modalAction.newStatus,
          screening_date: screeningDate,
        }); 
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Successfully change.",
        });
        setShowModal(true);
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to update screening date",
          message: "Something went wrong while submitting the form.",
        });
        setShowModal(true);
        console.error(error.message);
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
      setLoading(true);
      setRemarksModalOpen(false);
      try{
        const response = await api.post(`/cancer-screening/individual-screening/return-remarks/${record.id}/`, {
          remarks: remarks
        })
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Send successfully.",
        });
        setShowModal(true);
      } catch (error) {
        setModalInfo({
            type: "error",
            title: "Failed to send screening remarks.",
            message: "Something went wrong while sending the remarks.",
          });
          setShowModal(true);
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else if (modalAction?.newStatus === "Reject") {
      setStatus(modalAction.newStatus);
      
      setLoading(true);
      setRemarksModalOpen(false);
      try {
        const payload = {
          status: modalAction.newStatus,
          remarks: remarks,
        };

        const response = await api.patch(`/cancer-screening/individual-screening/status-reject/${record.id}/`,
          payload
        ); 
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Successfully change.",
        });
        setShowModal(true);
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to update status changes",
          message: "Something went wrong while submitting the form.",
        });
        setShowModal(true);
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    setModalOpen(false);
    setModalAction(null);
    setModalText("");
  };

  return (
    <>
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
          <div className="bg-white rounded-2xl p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Set Screening Date</h2>
            <input
              type="date"
              className="w-full p-3 border border-gray2 rounded-md mb-4"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => setDateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/50"
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
          <div className="bg-white rounded-2xl p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Remarks</h2>
            <textarea
              className="w-full p-3 border border-gray2 rounded-md mb-4 resize-none"
              rows={4}
              placeholder="Enter your remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => setRemarksModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/50"
                onClick={handleReturn}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-6 px-10 flex flex-col">
          <div className="flex justify-between p-3 items-center">
            <h3 className="ttext-2xl font-bold text-secondary">INDIVIDUAL SCREENING</h3>
            <Link to={"/Admin/cancerscreening/AdminIndividualScreening"}>
              <img
                src="/images/back.png"
                alt="Back button icon"
                className="h-7"
              />
            </Link>
          </div>
          <div className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold">
                {record?.patient.full_name}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="patient_id">Patient ID</label>
                <input
                  type="text"
                  id="patient_id"
                  name="patient_id"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value={record?.patient.patient_id}
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="patient_name">Name</label>
                <input
                  type="text"
                  name="patient_name"
                  id="patient_name"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value={record?.patient.full_name}
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="date_approved">Date Created</label>
                <input
                  type="text"
                  name="date_approved"
                  id="date_approved"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value="June 1, 2025"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="lgu">LGU</label>
                <input
                  type="text"
                  name="lgu"
                  id="lgu"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value="Argao"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="status">Status</label>
                <select
                  name="status"
                  id="status"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value={status}
                  onChange={handleStatusChange}
                  // onChange={(e) => setStatus(e.target.value)}
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
              <div className="flex flex-col gap-2">
                <label htmlFor="screening_schedule">Screening Date</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    name="screening_schedule"
                    id="screening_schedule"
                    className="w-[85%] p-3 border border-gray2 rounded-md"
                    value={screeningDate}
                    readOnly
                  />
                  {screeningDate && (
                    <button
                      className="p-3 bg-gray-300 rounded-md hover:bg-gray-400"
                      onClick={() => {
                        setTempDate(screeningDate || "");
                        setDateModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
                {/* <input
                  type="date"
                  name="screening_schedule"
                  id="screening_schedule"
                  className="w-[85%] p-3 border border-gray2 rounded-md"
                  value="2025-08-06"
                /> */}
              </div>
            </div>
            <div className="flex justify-between w-full ">
              <Link 
                className="bg-primary w-[23%] hover:bg-primary/50 text-center py-2.5 text-white rounded-md"
                to="/Admin/cancerscreening/view/ViewScreeningProcedure"
                state={record}
              >
                Screening Procedure
              </Link>
              <Link 
                className="bg-primary w-[23%] hover:bg-primary/50 text-center py-2.5 text-white rounded-md"
                to="/Admin/cancerscreening/view/ViewPreScreeningForm"
                state={record}
              >
                Pre Screening Form
              </Link>
              <Link
                className="bg-primary w-[23%] hover:bg-primary/50 text-center py-2.5 text-white rounded-md"
                to={"/Admin/cancerscreening/view/ViewAttachments"}
                state={record}
              >
                View Attachments
              </Link>
              <Link 
                className="bg-primary w-[23%] hover:bg-primary/50 text-center py-2.5 text-white rounded-md"
                to={"/Admin/cancerscreening/view/ViewResults"}
                state={record}
              >
                View Results
              </Link>
            </div>
          </div>
        </div>

        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
};
export default IndividualScreeningView;
