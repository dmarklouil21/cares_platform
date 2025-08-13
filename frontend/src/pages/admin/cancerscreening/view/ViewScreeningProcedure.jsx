import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/ConfirmationModal";
import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";

const ViewScreeningProcedure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const record = location.state;
  const [patient, setPatient] = useState('');
  const [screening_procedure, setScreening_procedure] = useState({});

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

  useEffect(() => {
    if (record) {
      setPatient(record.patient);
      setScreening_procedure(record.screening_procedure);
    }
  }, [record]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScreening_procedure((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setModalText('Save changes?');
    setModalAction({ type: "submit" }); 
    setModalOpen(true);
  };

  const handleDelete = () => {
    setModalText("Are you sure you want to delete this screening procedure?");
    setModalAction({ type: "delete" });
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "submit") {
      try { 
        setLoading(true);
        const response = await api.patch(`/cancer-screening/individual-screening/screening-procedure/update/${screening_procedure.id}/`, screening_procedure);
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Your form was submitted.",
        });
        setShowModal(true);
        /* navigate("/Admin/cancerscreening/view/AdminIndividualScreeningView", {
          state: {record: record}
        }); */
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to save changes",
          message: "Something went wrong while submitting the form.",
        });
        setShowModal(true);
        console.error("Error submitting a request:", error);
      } finally {
        setLoading(false);
      }
    } else if (modalAction?.type === "delete") {
      try {
        setLoading(true);
        await api.delete(
          `/cancer-screening/individual-screening/screening-procedure/delete/${screening_procedure.id}/`
        );
        setModalInfo({
          type: "success",
          title: "Deleted!",
          message: "The screening procedure has been deleted successfully.",
        });
        setShowModal(true);
        navigate("/Admin/cancerscreening/view/AdminIndividualScreeningView", {
          state: { record },
        });
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to delete",
          message: "Something went wrong while deleting the record.",
        });
        setShowModal(true);
        console.error("Error deleting record:", error);
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
      <div className="h-screen w-full flex flex-col justify-between items-center bg-[#F8F9FA]">
        <div className="bg-lightblue h-[10%] px-5 w-full flex justify-between items-center">
          <h1 className="text-md font-bold">Screening Procedure</h1>
          <div className="p-3">
            <Link 
              to={"/Admin/cancerscreening/view/AdminIndividualScreeningView"}
              state={{record: record}}
            >
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
            <div className="bg-lightblue rounded-sm py-3 px-5 w-full flex justify-between items-center">
              <h1 className="text-md font-bold">Patient ID - {record?.patient.patient_id}</h1>
            </div>
            {/* <div className="flex justify-between p-3 items-center">
              <h2 className="text-xl font-semibold">{record?.patient.full_name || ""} - {record?.patient.patient_id}</h2>
              <Link 
                to={"/Admin/cancerscreening/view/AdminIndividualScreeningView"}
                state={{record: record}}
              >
                <img
                  src="/images/back.png"
                  alt="Back button icon"
                  className="h-7"
                />
              </Link>
            </div> */}
            {!screening_procedure ? (
              <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-2xl py-10 px-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-600">No Screening Procedure Found</h2>
                <p className="text-gray-500 mt-2">
                  This patient doesn't have a screening procedure record yet.
                </p>
                <Link
                  to="/Admin/cancerscreening/view/AdminIndividualScreeningView"
                  state={{ record }}
                  className="text-center font-bold bg-primary text-white mt-5 py-2 w-[15%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
                >
                  Go Back
                </Link>
              </div>
            ) : (
              <form 
                className="flex flex-row gap-8 p-4"
                // onSubmit={handleSave}
              >
                <div className="flex flex-col gap-3 w-1/2">
                  <div>
                    <label htmlFor="screening_procedure_name" className="block text-gray-700 mb-1">Screening Procedure:</label>
                    <input
                      type="text"
                      name="screening_procedure_name"
                      id="screening_procedure_name"
                      placeholder="ex: Mammogram, MRI"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                      value={screening_procedure?.screening_procedure_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="proceduredetials" className="block text-gray-700 mb-1">Procedure Details</label>
                    <input
                      type="text"
                      name="procedure_details"
                      id="procedure_details"
                      placeholder="ex: Breast screening due to palpable mass"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                      value={screening_procedure?.procedure_details}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="cancer_site" className="block text-gray-700 mb-1">Cancer Site</label>
                    <input
                      type="text"
                      name="cancer_site"
                      id="cancer_site"
                      placeholder="ex: Breast"
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                      value={screening_procedure?.cancer_site}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </form>
            )}
          </div>
          {screening_procedure && (
            <div className="w-full flex justify-around">
              <button
                type="button"
                onClick={handleDelete}
                className="text-center bg-white text-black py-2 w-[35%] border border-black hover:border-black/15 rounded-md"
              >
                Delete
              </button>
              <button
                // type="submit"
                type="button"
                onClick={handleSave}
                className="text-center font-bold bg-primary text-white py-2 w-[35%] border border-primary hover:border-lightblue hover:bg-lightblue rounded-md"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
};
export default ViewScreeningProcedure;
