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
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
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

      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">View Screening</h1>
          <div className="p-3">
            {/* <h3 className="ttext-2xl font-bold text-secondary">INDIVIDUAL SCREENING</h3> */}
            <Link to={"/Admin/cancerscreening/AdminIndividualScreening"}>
              <img
                src="/images/back.png"
                alt="Back button icon"
                className="h-6"
              />
            </Link>
          </div>
        </div>
        <div className="h-full w-full p-5 flex flex-col justify-between">
          <div className="border border-black/15 p-3 bg-white rounded-sm">
            {/* <div className="flex flex-col">
              <h2 className="text-2xl font-semibold">
                {record?.patient.full_name}
              </h2>
            </div> */}
            <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
              <h1 className="text-md font-bold">Patient ID - {record?.patient.patient_id}</h1>
            </div>
            <div className="flex flex-row gap-8 p-4">
              {/* First Column */}
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label htmlFor="patient_name" className="block text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="patient_name"
                    id="patient_name"
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    value={record?.patient.full_name}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="date_approved" className="block text-gray-700 mb-1">Date Submitted</label>
                  <input
                    type="text"
                    name="date_approved"
                    id="date_approved"
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    value="June 1, 2025"
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="lgu" className="block text-gray-700 mb-1">LGU</label>
                  <input
                    type="text"
                    name="lgu"
                    id="lgu"
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    value="Argao"
                    readOnly
                  />
                </div>
              </div>
              {/* Second Column */}
              <div className="flex flex-col gap-3 w-1/2">
                <div>
                  <label htmlFor="status" className="block text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    id="status"
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
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
                <div>
                  <label htmlFor="screening_schedule" className="block text-gray-700 mb-1">Screening Date</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      name="screening_schedule"
                      id="screening_schedule"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                      value={screeningDate}
                      readOnly
                    />
                    {screeningDate && (
                      <button
                        className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() => {
                          setTempDate(screeningDate || "");
                          setDateModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div> 
          {/* <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5"> */}
          <div className="w-full flex justify-around">
            <Link 
              className="text-center font-bold bg-primary text-white py-2 w-[20%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              to="/Admin/cancerscreening/view/ViewScreeningProcedure"
              state={record}
            >
              Screening Procedure
            </Link>
            <Link 
              className="text-center font-bold bg-primary text-white py-2 w-[20%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              to="/Admin/cancerscreening/view/ViewPreScreeningForm"
              state={record}
            >
              Pre Screening Form
            </Link>
            <Link
              className="text-center font-bold bg-primary text-white py-2 w-[20%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              to={"/Admin/cancerscreening/view/ViewAttachments"}
              state={record}
            >
              View Attachments
            </Link>
            <Link 
              className="text-center font-bold bg-primary text-white py-2 w-[20%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              to={"/Admin/cancerscreening/view/ViewResults"}
              state={record}
            >
              View Results
            </Link>
          </div>
        </div>

        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
};
export default IndividualScreeningView;
