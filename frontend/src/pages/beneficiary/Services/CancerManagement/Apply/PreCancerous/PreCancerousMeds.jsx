import { useRef, useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance";

import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import SystemLoader from "src/components/SystemLoader";

const PreCancerousMeds = () => {
  const navigate = useNavigate();

  // Form States
  const [interpretationOfResult, setInterpretationOfResult] = useState("");
  const [requestDestination, setRequestDestination] = useState("");
  const [selectedRHU, setSelectedRHU] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("");

  // Modal States
  const [confirmation, setConfirmation] = useState({
    open: false,
    text: "",
    desc: "",
    action: null,
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Loading
  const [loading, setLoading] = useState(false);

  const [rhuList, setRhuList] = useState([])
  const [privateList, setPrivateList] = useState([]);

  const privatePartners = [
    "Chong Hua Hospital",
    "Perpetual Succour Hospital",
    "UCMed",
    "Cebu Doctors Hospital",
  ];

  const fetchRhu = async () => {
    const { data } = await api.get("/rhu/list/")
    console.log("RHU List: ", data);
    setRhuList(data);
  };

  const fetchPrivate = async () => {
    const { data } = await api.get("/partners/private/list/")
    setPrivateList(data);
  };

  useEffect(() => {
    fetchRhu();
    fetchPrivate();
  }, []);

  // Submit Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmation({
      open: true,
      text: "Confirm Submit?",
      desc: "Make sure all your inputs are correct!",
      action: "submit",
    });
  };

  const handleConfirm = async () => {
    if (confirmation.action !== "submit") return;

    setConfirmation({ open: false, text: "", desc: "", action: null });
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("interpretation_of_result", interpretationOfResult);
      formData.append("request_destination", requestDestination);
      const payload = {
        interpretation_of_result: interpretationOfResult,
        request_destination: requestDestination,
        destination_name: selectedPartner || selectedRHU || 'Rafi-EJACC'
      }

      // await api.post(
      //   `/beneficiary/precancerous-meds/submit/`,
      //   formData,
      //   {
      //     headers: { "Content-Type": "multipart/form-data" },
      //   }
      // );
      console.log("Payload: ", payload);
      await api.post(`/beneficiary/precancerous-meds/submit/`, payload);

      navigate("/beneficiary/success-application", {
        state: { okLink: "beneficiary/applications/individual-screening" },
      });
    } catch (error) {
      let message = "Something went wrong while submitting the form.";
      if (error.response?.data?.non_field_errors) {
        message = error.response.data.non_field_errors[0];
      }

      setNotification({
        show: true,
        type: "error",
        title: "Submission Failed",
        message,
      });

      console.error("Error submitting a request:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("RHUv2: ", rhuList);

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmation.open}
        title={confirmation.text}
        desc={confirmation.desc}
        onConfirm={handleConfirm}
        onCancel={() =>
          setConfirmation({ open: false, text: "", desc: "", action: null })
        }
      />

      {/* Notification Modal */}
      <NotificationModal
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />

      {/* Loader */}
      {loading && <SystemLoader />}

      <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
        <div className="py-6 px-10 flex flex-col flex-1">
          <h2 className="text-xl font-semibold mb-6">
            Pre-Cancerous Medication Application
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8 flex-1 overflow-auto"
          >
            <div className="flex flex-col gap-6">
              <h1 className="font-bold text-[22px] md:text-3xl text-yellow">
                Pre-Cancerous Medication
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span>Diagnosis/Impression</span>
                  <input
                    type="text"
                    name="diagnosisImpression"
                    placeholder="ex: Breast Mass, right"
                    className="w-full p-3 border border-gray2 rounded-md"
                    value={"Breast Mass, right"}
                    // onChange={(e) => setProcedureDetails(e.target.value)}
                    readOnly
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span>Interpretation of Result</span>
                  <select
                    name="interpretation_of_result"
                    value={interpretationOfResult}
                    onChange={(e) => setInterpretationOfResult(e.target.value)}
                    className="w-full p-3 border border-gray2 rounded-md"
                  >
                    <option value="">Select</option>
                    <option value="Negative">Negative</option>
                    <option value="ASC-US">ASC-US</option>
                    <option value="HPV Positive">HPV Positive</option>
                    <option value="Unsatisfactory">Unsatisfactory</option>
                    {/* <option value="">Other</option> */}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span>Request Destination</span>
                  <select
                    name="request_destination" 
                    value={requestDestination}
                    onChange={(e) => setRequestDestination(e.target.value)}
                    className="w-full p-3 border border-gray2 rounded-md"
                  >
                    <option value="">Select</option>
                    <option value="RAFI - EJACC">RAFI - EJACC</option>
                    <option value="Rural Health Unit">Rural Health Unit</option>
                    <option value="Private Partners">Private Partners</option>
                  </select>
                </label>

                {/* Conditional Selects */}
                {requestDestination === "Rural Health Unit" && (
                  <label className="flex flex-col gap-2">
                    <span className="font-medium">Select Rural Health Unit</span>
                    <select
                      value={selectedRHU}
                      onChange={(e) => setSelectedRHU(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md"
                    >
                      <option value="">Select RHU</option>
                      {rhuList.map((rhu) => (
                        <option key={rhu.id} value={rhu.lgu}>
                          {rhu.lgu}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {requestDestination === "Private Partners" && (
                  <label className="flex flex-col gap-2">
                    <span className="font-medium">Select Private Partner</span>
                    <select
                      value={selectedPartner}
                      onChange={(e) => setSelectedPartner(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Partner</option>
                      {privateList.map((partner) => (
                        <option key={partner.id} value={partner.institution_name}>
                          {partner.institution_name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </div>
                {/* Stop here */}
            <div className="mt-30 flex items-center justify-between flex-col-reverse md:flex-row gap-5">
              <Link
                to="/beneficiary/services/cancer-management"
                className="border border-black/15 py-3 rounded-md text-center px-6 hover:bg-black/10 hover:border-black w-full md:w-[40%]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                // onClick={handleSubmit}
                className="bg-[#749AB6] text-white w-full md:w-[40%] font-bold py-3 px-8 rounded-md border border-[#749AB6] hover:bg-[#C5D7E5] hover:border-[#C5D7E5]"
              >
                Submit
              </button>
            </div>

            {/* <div className="flex flex-col gap-6">
              {/* Actions *s/}
              <div className="mt-30 flex items-center justify-between flex-col-reverse md:flex-row gap-5">
                <Link
                  to="/beneficiary/services/cancer-management"
                  className="border border-black/15 py-3 rounded-md text-center px-6  hover:bg-black/10 hover:border-black w-full md:w-[40%]"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="bg-[#749AB6] text-white w-[40%] font-bold py-3 px-8 rounded-md border border-[#749AB6] hover:bg-[#C5D7E5] hover:border-[#C5D7E5 w-full md:w-[40%]]"
                >
                  Submit
                </button>

              </div>
            </div> */}
          </form>
        </div>
      </div>
    </>
  );
};

export default PreCancerousMeds;
