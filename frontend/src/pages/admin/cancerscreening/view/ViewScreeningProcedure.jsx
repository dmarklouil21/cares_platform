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
      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        {/* <div className="bg-white py-4 px-10 flex justify-between items-center">
          <div className="font-bold">Beneficary</div>
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <img
              src="/images/Avatar.png"
              alt="User Profile"
              className="rounded-full"
            />
          </div>
        </div> */}

        <div className="py-6 px-10 flex flex-col flex-1">
          <div className="flex justify-between p-3 items-center">
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
          </div>
          {!screening_procedure ? (
            <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-2xl py-10 px-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-600">No Screening Procedure Found</h2>
              <p className="text-gray-500 mt-2">
                This patient does not have a screening procedure record yet.
              </p>
              <Link
                to="/Admin/cancerscreening/view/AdminIndividualScreeningView"
                state={{ record }}
                className="mt-6 px-6 py-3 bg-[#749AB6] text-white rounded-md hover:bg-[#5a7e9c]"
              >
                Go Back
              </Link>
            </div>
          ) : (
            <form 
              className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8 flex-1 overflow-auto"
              onSubmit={handleSave}
            >
              {/* <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-bold text-secondary">
                  INDIVIDUAL SCREENING
                </h3>
                <p className="text-gray2 ">
                  Monitor and manage cancer screening procedures, generate LOA, and
                  upload diagnostic results.
                </p>
              </div> */}
              <div className="flex flex-col gap-6">
                <h1 className="font-bold text-xl">Screening Procedure</h1>
                <div className="flex flex-col gap-2">
                  <label htmlFor="screening_procedure_name">Screening Procedure:</label>
                  <input
                    type="text"
                    name="screening_procedure_name"
                    id="screening_procedure_name"
                    placeholder="ex: Mammogram, MRI"
                    className="w-[85%] p-3 border border-gray2 rounded-md"
                    value={screening_procedure?.screening_procedure_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="proceduredetials">Procedure Details</label>
                  <input
                    type="text"
                    name="procedure_details"
                    id="procedure_details"
                    placeholder="ex: Breast screening due to palpable mass"
                    className="w-[85%] p-3 border border-gray2 rounded-md"
                    value={screening_procedure?.procedure_details}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="cancetsite">Cancer Site</label>
                  <input
                    type="text"
                    name="cancer_site"
                    id="cancer_site"
                    placeholder="ex: Breast"
                    className="w-[85%] p-3 border border-gray2 rounded-md"
                    value={screening_procedure?.cancer_site}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex w-full justify-between gap-8">
                <button
                  type="button"
                  onClick={handleDelete}
                  className=" border  py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
                  // to="/Admin/cancerscreening/view/AdminIndividualScreeningView"
                  // state={{record: record}}
                >
                  Delete
                </button>
                <button
                  type="submit"
                  className="bg-[#749AB6] text-center font-bold text-white py-2 w-full border-[1px] border-[#749AB6] hover:border-[#C5D7E5] hover:bg-[#C5D7E5] rounded-md cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        {/* <div className="h-16 bg-secondary"></div> */}
      </div>
    </>
  );
};
export default ViewScreeningProcedure;
