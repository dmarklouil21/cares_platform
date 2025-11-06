// src/pages/treatment/AdminprecancerousView.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  adminGetPreCancerousMedsDetail,
  adminSetReleaseDate,
  adminDonePreCancerousMeds,
} from "src/api/precancerous";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";
import DateModal from "src/components/Modal/DateModal";

import api from "src/api/axiosInstance";

const PreCancerousView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  // --- local state for release date, status, modal, and toast ---
  const [preCancerous, setPreCancerous] = useState([]);
  const [releaseDate, setReleaseDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'save' | 'done' | null
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // Loading & Notification
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(location.state?.type || "");

  // Confirmation Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Confirm Action?");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);

  // Notification Modal
  const [showModal, setShowModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "info",
    title: "Info",
    message: "The form has been submitted successfully.",
  });

  // Treatment Date Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateModalTitle, setDateModalTitle] = useState("Set Medicine Release Date");

  // fetch detail
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await adminGetPreCancerousMedsDetail(id);
        if (!mounted) return;
        setPreCancerous(data)
        // setPatient(data);
        setReleaseDate(data.release_date_of_meds || null);
        setStatus(data.status);
        console.log("Data: ", data);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load request details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Auto-hide toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === "Approved") {
      setDateModalOpen(true);
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    } else {
      setModalAction({ newStatus: selectedStatus });
      setStatus(selectedStatus);
    }
  };

  const handleDateModalConfirm = async () => {
    if (!releaseDate) {
      alert("Please select a date before proceeding.");
      return;
    }

    // setReleaseDate(tempDate);
    setModalAction((prev) => ({ ...prev, newReleaseDate: releaseDate }));
    // setIsNewDate(true);
    setDateModalOpen(false);
  };

  // Open confirmation modal for Save
  const handleSaveClick = () => {
    // setConfirmAction("save");
    // setConfirmOpen(true);

    setModalText("Save changes?");
    setModalDesc("Confirm to save the changes.");
    setModalOpen(true);
    setModalAction({ newStatus: null });
  };

  // Open confirmation modal for Mark as done
  const handleMarkDoneClick = () => {
    setConfirmAction("done");
    setConfirmOpen(true);
  };

  // Confirm handler for either action
  const handleModalConfirm = async () => {
    try {
      setLoading(true);
      setModalOpen(false);

      let payload = {
        status: modalAction.newStatus || status,
        release_date_of_meds: modalAction.newReleaseDate || releaseDate,
      };
      console.log("Payload: ", payload);

      // Stop here for now
      await api.patch(`/precancerous/update/${preCancerous.id}/`, payload);

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
  // const handleConfirmAction = async () => {
  //   const action = confirmAction;
  //   setConfirmOpen(false);
  //   setConfirmAction(null);

  //   try {
  //     if (action === "save") {
  //       await adminSetReleaseDate(id, releaseDate);
  //       setToast({ type: "success", message: "Release date saved." });
  //     }

  //     if (action === "done") {
  //       await adminDonePreCancerousMeds(id);
  //       setStatus("Done");
  //       setToast({ type: "success", message: "Marked as done." });
  //     }

  //     // refresh details
  //     const fresh = await adminGetPreCancerousMedsDetail(id);
  //     setPatient(fresh);
  //     setReleaseDate(fresh.release_date_of_meds || "");

  //     // Navigate back after a short delay
  //     setTimeout(() => {
  //       navigate("/Admin/treatment/precancerous");
  //     }, 900);
  //   } catch (e) {
  //     setToast({ type: "error", message: "Action failed. Please try again." });
  //   }
  // };

  // if (loading) {
  //   return (
  //     <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
  //       <div className="bg-white p-6 rounded shadow">
  //         <p className="font-semibold">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error || !preCancerous) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded shadow">
          <p className="font-semibold">{error || "Record not found."}</p>
        </div>
      </div>
    );
  }

  const statusPillClasses =
    preCancerous?.status === "Completed"
      ? "bg-green-100 text-green-700 border border-green-200"
      : preCancerous?.status === "Follow-up Required"
      ? "bg-blue-100 text-blue-700 border border-blue-200"
      : preCancerous?.status === "Approved"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : preCancerous?.status === "Closed"
      ? "bg-gray-100 text-gray-700 border border-gray-200"
      : preCancerous?.status === "Pending"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : preCancerous?.status === "Rejected"
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
      {/* <Notification message={notification} type={notificationType} /> */}

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
        value={releaseDate}
        onChange={setReleaseDate}
        onConfirm={handleDateModalConfirm}
        onCancel={() => setDateModalOpen(false)}
      />
      <div className="h-screen w-full flex flex-col p-5 gap-3 justify-start items-center bg-gray overflow-auto">
        {/* Toast (uses your markup) */}
        {toast && (
          <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
            <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
              <img
                src="/images/logo_white_notxt.png"
                alt="Rafi Logo"
                className="h-[25px]"
              />
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Request Pre-Cancerous Meds</h2>
            <span className={`text-xs px-2 py-1 rounded ${statusPillClasses}`}>
              {preCancerous?.status}
            </span>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex gap-2">
              <span className="font-medium w-40">Patient ID</span>
              <span className="text-gray-700">{preCancerous?.patient?.patient_id || "---"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Patient Name</span>
              <span className="text-gray-700">{preCancerous?.patient?.full_name || "---"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Diagnosis</span>
              <span className="text-gray-700">
                {preCancerous?.patient?.diagnosis?.[0]?.diagnosis || "---"}
              </span>
            </div>
            {/* <div className="flex gap-2">
              <span className="font-medium w-40">Interpretation of Result</span>
              <span className="text-gray-700">
                {patient.contact_number || "—"}
              </span>
            </div> */}
            <div className="flex gap-2">
              <span className="font-medium w-40">Status</span>
              <select
                className="-ml-1 outline-none focus:ring-0 text-gray-700"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            {/* Stop here for now */}
            <div className="flex gap-2">
              <span className="font-medium w-40">Date Submitted</span>
              <span className="text-gray-700">
                {preCancerous?.created_at
                  ? new Date(preCancerous?.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "---"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium w-40">Release Date</span>
              <span className="text-gray-700">{releaseDate || "---"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white w-full rounded-md shadow border border-black/10">
          <div className="border-b border-black/10 px-5 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Additional Information</h2>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex gap-2">
              <span className="font-medium w-45">Interpretation of Result</span>
              <span className="text-gray-700">{preCancerous?.interpretation_of_result || "---"}</span>
            </div>
    
            <div className="flex gap-2">
              <span className="font-medium w-40">Requested To</span>
              <span className="text-gray-700">
                {preCancerous?.request_destination === "Rural Health Unit" ? 
                  ("RHU - ") : 
                  ("")} 
                {preCancerous?.destination_name || "---"}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Row Table */}
        {/* <div className="bg-white w-full rounded-md shadow border border-black/10">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray/30">
                <th className="text-left text-sm font-semibold px-4 py-3">No.</th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Patient No.
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Last Name
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  First Name
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Middle Initial
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Date of Birth
                </th>
                <th className="text-left text-sm font-semibold px-4 py-3">
                  Interpretation of Result
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 text-sm">1</td>
                <td className="px-4 py-3 text-sm">{patient.patient_id}</td>
                <td className="px-4 py-3 text-sm">{patient.last_name}</td>
                <td className="px-4 py-3 text-sm">{patient.first_name}</td>
                <td className="px-4 py-3 text-sm">
                  {patient.middle_initial || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-sm">
                  {patient.interpretation_of_result}
                </td>
              </tr>
            </tbody>
          </table>
        </div> */}

        {/* Release Date input */}
        {/* <div className="bg-white w-full rounded-md shadow border border-black/10 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <label className="flex items-center gap-4">
              <span className="font-medium w-40">Release Date</span>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full md:w-auto"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </label>
          </div>
        </div> */}

        {/* Bottom actions */}
        <div className="w-full flex flex-col md:flex-row gap-3 justify-between md:justify-around">
          <Link
            className="text-center bg-white text-black py-2 md:w-[30%] w-full border border-black hover:border-black/15 rounded-md"
            to="/admin/treatment-assistance/pre-cancerous"
          >
            BACK
          </Link>

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!releaseDate}
            className={`text-center py-2 md:w-[30%] w-full rounded-md shadow ${
              !releaseDate
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            Save changes
          </button>

          {/* <button
            type="button"
            onClick={handleMarkDoneClick}
            disabled={status !== "Verified"}
            title={
              status !== "Verified"
                ? "Only available when status is Verified"
                : ""
            }
            className={`text-center py-2 md:w-[30%] w-full rounded-md shadow ${
              status !== "Verified"
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            Mark as done
          </button> */}
        </div>

        {/* Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmAction(null);
              }}
            />
            <div className="relative bg-white w-[92%] max-w-md rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                {confirmAction === "done" ? "Mark as done?" : "Confirm save"}
              </h3>

              {confirmAction === "done" ? (
                <p className="text-sm text-gray-700 mb-4">
                  Mark the request for{" "}
                  <strong>
                    {patient.first_name} {patient.last_name}
                  </strong>{" "}
                  (ID: {patient.patient_id}) as <strong>Done</strong>? This will
                  update the current status.
                </p>
              ) : (
                <p className="text-sm text-gray-700 mb-4">
                  Save changes for{" "}
                  <strong>
                    {patient.first_name} {patient.last_name}
                  </strong>{" "}
                  (ID: {patient.patient_id})
                  {releaseDate ? ` with release date ${releaseDate}` : ""}?
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmAction(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded text-white hover:opacity-90 ${
                    confirmAction === "done" ? "bg-green-600" : "bg-primary"
                  }`}
                  onClick={handleConfirmAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PreCancerousView;
