import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

import api from "src/api/axiosInstance";

const RadioTherapyWellBeingTool = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceType = location.state;
  const { user } = useAuth();
  // const [ patient, setPatient ] = useState(null);
  const [questions, setQuestions] = useState([]);

  // paragraph answer
  const [improve, setImprove] = useState("");

  // simple form state for the header fields
  const [form, setForm] = useState({
    name: "",
    address: "",
    diagnosis: "",
    serviceType: serviceType,
    generalStatus: "",
  });

  const updateForm = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const scale = [
    { value: 1, en: "Strongly Disagree", ceb: "Hugot nga di muuyon" },
    { value: 2, en: "Disagree", ceb: "Wala muuyon" },
    { value: 3, en: "Agree", ceb: "Uyon" },
    { value: 4, en: "Strongly Agree", ceb: "Uyon Kaayo" },
  ];

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/beneficiary/patient/details/`);
        // setPatient(data);
        setForm((prev) => {
          return {
            ...prev,
            name: data.full_name,
            address: data.address,
            diagnosis: data.diagnosis[0]?.diagnosis,
          };
        });
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/cancer-management/well-being-questions/`
        );
        // setPatient(data);
        console.log("Questions: ", data);
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleNext = () => {
    const wellBeningData = {
      ...form,
      improve: improve.trim(),
      answers,
    };

    navigate("/beneficiary/services/cancer-management/apply/upload-documents", {
      state: { wellBeningData },
    });
  };
  console.log("Service Type: ", serviceType);
  // console.log("Next Link: ", nextLink);

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      {/* <div className="bg-white py-4 px-10 flex justify-between items-center">
        <div className="font-bold">Beneficiary</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div> */}

      <div className="py-6 px-4 md:px-10 flex flex-col flex-1 overflow-auto">
        <div className="bg-white rounded-2xl flex p-4 md:p-7 flex-col gap-7">
          {/* Header */}
          <div className="flex w-full justify-between gap-6 p-4  rounded-xl shadow-sm bg-gray-50 overflow-x-auto ">
            <div className="flex flex-col w-[500px] md:w-full gap-3 ">
              <div className="flex w-[500px] md:w-full  gap-2  items-start">
                <label className="font-medium text-gray-700 whitespace-nowrap ">
                  Name:
                </label>
                <input
                  type="text"
                  value={form.name}
                  className="outline-none font-bold  w-full border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                  readOnly
                />
                <label className="font-medium text-gray-700 whitespace-nowrap">
                  Date:
                </label>
                <input
                  type="text"
                  value={formatDate(new Date())}
                  className="outline-none font-bold  w-full border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                  readOnly
                />
              </div>

              <div className="flex w-[500px] md:w-full items-center gap-2">
                <label className="font-medium text-gray-700 whitespace-nowrap">
                  Address:
                </label>
                <input
                  type="text"
                  value={form.address}
                  className="outline-none font-bold w-full border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                  readOnly
                />
              </div>

              <div className="flex w-[500px] md:w-full items-center gap-2">
                <label className="font-medium text-gray-700 whitespace-nowrap">
                  Diagnosis:
                </label>
                <input
                  type="text"
                  value={form.diagnosis}
                  className="outline-none font-bold w-full border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                  readOnly
                />
              </div>

              <div className="flex w-[500px] md:w-full items-center gap-2">
                <label className="font-medium text-gray-700 whitespace-nowrap">
                  General Status/Name:
                </label>
                <input
                  type="text"
                  value={form.generalStatus}
                  onChange={updateForm("generalStatus")}
                  className="outline-none w-full border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Logo */}
            <div className="rounded-lg p-3 bg-white shrink-0 flex items-center justify-center">
              <img
                src="/images/logo_black_text.png"
                alt="Rafi icon"
                className="h-30 md:h-30 object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="font-semibold text-lg">
              THE CURRENT WELL-BEING OF THE CANCER PATIENT
            </h1>
            <p>
              Encircle the number from 1 to 4 that you agree with what you have
              been currently experiencing for the past 2 weeks.
            </p>
            <p className="text-primary">
              Lingini ang numero 1 hangtud 4 nga mo-angay sa imong gibati sulod
              sa 2 ka semana.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[800px] w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      colSpan={2}
                      className="border border-gray-300 p-2 text-center font-semibold"
                    >
                      Health Status
                      <div className="text-primary text-xs">
                        Panglawas nga Kahimtang
                      </div>
                    </th>
                    {scale.map((s) => (
                      <th
                        key={s.value}
                        className="border border-gray-300 p-2 text-center"
                      >
                        <div className="font-medium">{s.en}</div>
                        <div className="text-primary text-xs">{s.ceb}</div>
                        <div className="mt-1 text-xs font-semibold">
                          {s.value}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr key={q.id}>
                      <td className="border border-gray-300 p-2 w-10 text-center">
                        {idx + 1}.
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <div className="font-medium leading-tight">
                          {q.text_en}
                        </div>
                        <div className="text-primary text-xs leading-tight">
                          {q.text_ceb}
                        </div>
                      </td>
                      {scale.map((s) => (
                        <td
                          key={s.value}
                          className="border border-gray-300 text-center align-middle"
                        >
                          <div className="flex items-center justify-center py-3">
                            <input
                              type="radio"
                              className="h-4 w-4"
                              name={`q${q.id}`}
                              value={s.value}
                              checked={answers[q.id] === s.value}
                              onChange={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: s.value,
                                }))
                              }
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="py-6">
              <p>
                1. How do you think you can further improve your physical health
                and well being? Give specific activities/Scenarios.
              </p>
              <p className="text-primary">
                Sa imong hunahuna sa unsang paagi nimo mapauswag ang imong
                kahimsog sa panglawas? Paghatag ug espesipikong mga
                kalihokan/aktibidades.
              </p>

              {/* Lined textarea (real lines) */}
              <div className="mt-3">
                <div className="relative">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="h-10 border-b border-dashed border-gray-400"></div>
                    <div className="h-10 border-b border-dashed border-gray-400"></div>
                    <div className="h-10 border-b border-dashed border-gray-400"></div>
                    {/* <div className="h-10 border-b-2 border-black"></div>
                    <div className="h-10 border-b-2 border-black"></div>
                    <div className="h-10 border-b-2 border-black"></div> */}
                  </div>
                  <textarea
                    id="improve"
                    rows={3}
                    value={improve}
                    onChange={(e) => setImprove(e.target.value)}
                    className="relative w-full bg-transparent outline-none resize-none leading-[40px] pl-1 pr-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-between gap-8">
            <Link
              to="/beneficiary/services/cancer-management"
              className="border py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={handleNext}
              className="bg-[#749AB6] text-center font-bold text-white py-2 w-full border-[1px] border-[#749AB6] hover:border-[#C5D7E5] hover:bg-[#C5D7E5] rounded-md cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioTherapyWellBeingTool;
