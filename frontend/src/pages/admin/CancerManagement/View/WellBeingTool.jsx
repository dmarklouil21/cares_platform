import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";

import api from "src/api/axiosInstance";

const RadioTherapyWellBeingTool = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const record = location.state;
  const { id } = useParams();
  const [wellBeingAssessment, setWellBeingAssessment] = useState();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [questions, setQuestions] = useState([]);

  // paragraph answer
  const [improve, setImprove] = useState("");

  // simple form state for the header fields
  const [form, setForm] = useState(null);

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
    setPatient(record.patient);
    setWellBeingAssessment(record.wellbeing_assessment);
  }, []);

  console.log("Wellbeing Assesment: ", wellBeingAssessment);

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

  useEffect(() => {
    if (wellBeingAssessment?.answers) {
      const mapped = {};
      wellBeingAssessment.answers.forEach((a) => {
        mapped[a.question.id] = a.value; // or use a.question.id if needed
      });
      setAnswers(mapped);
    }
  }, [wellBeingAssessment]);

  useEffect(() => {
    if (wellBeingAssessment?.improve) {
      setImprove(wellBeingAssessment.improve);
    }
  }, [wellBeingAssessment]);

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
      answers, // e.g., {1:3, 2:2, ...}
    };

    navigate(
      "/beneficiary/services/cancer-management-options/radiotherapy/documents",
      { state: { wellBeningData } }
    );
  };

  return (
    <>
    <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray overflow-auto">
      <div className="h-full w-full flex flex-col justify-between">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Wellbeing Form</h2>
        <div className="border border-black/15 p-3 bg-white rounded-lg">
          {/* Header */}
          <div className="flex w-full justify-between gap-6 p-4">
            <div className="flex flex-col w-[85%] gap-3">
              <div className="flex w-full items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Name:
                </label>
                <input
                  type="text"
                  value={patient?.full_name}
                  className="outline-none text-sm w-full border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                  readOnly
                />
                <label className="font-medium text-sm text-gray-700 whitespace-nowrap">
                  Date:
                </label>
                <input
                  type="text"
                  value={formatDate(new Date(wellBeingAssessment?.created_at))}
                  className="outline-none text-sm w-40 border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                  readOnly
                />
              </div>

              <div className="flex w-full items-center gap-2">
                <label className="font-medium text-sm text-gray-700 whitespace-nowrap">
                  Address:
                </label>
                <input
                  type="text"
                  value={patient?.address}
                  className="outline-none text-sm w-full border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                  readOnly
                />
              </div>

              <div className="flex w-full items-center gap-2">
                <label className="font-medium text-sm text-gray-700 whitespace-nowrap">
                  Diagnosis:
                </label>
                <input
                  type="text"
                  value={patient?.diagnosis[0]?.diagnosis}
                  className="outline-none w-full text-sm border-b border-dashed border-gray-400 bg-transparent text-gray-900"
                  readOnly
                />
              </div>

              <div className="flex w-full items-center gap-2">
                <label className="font-medium text-sm text-gray-700 whitespace-nowrap">
                  General Status/Name:
                </label>
                <input
                  type="text"
                  value={wellBeingAssessment?.general_status}
                  onChange={updateForm("generalStatus")}
                  className="outline-none w-full text-sm border-b border-dashed border-gray-400 bg-transparent text-gray-900"
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

          <div className="flex flex-col gap-3 p-4">
            <h1 className="font-semibold text-md">
              THE CURRENT WELL-BEING OF THE CANCER PATIENT
            </h1>
            <p className="text-sm">
              Encircle the number from 1 to 4 that you agree with what you have
              been currently experiencing for the past 2 weeks.
            </p>
            <p className="text-primary text-sm">
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
                              // onChange={() =>
                              //   setAnswers((prev) => ({
                              //     ...prev,
                              //     [q.id]: s.value,
                              //   }))
                              // }
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="py-6 text-sm">
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
                  </div>
                  <textarea
                    id="improve"
                    rows={3}
                    value={improve}
                    // onChange={(e) => setImprove(e.target.value)}
                    className="relative w-full bg-transparent outline-none resize-none leading-[40px] pl-1 pr-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end mt-6 mb-2">
            <Link
              to={`/admin/cancer-management/view/${id}`}
              className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
            >
              Back
            </Link>
        </div>
        </div>
        <br />
      </div>
    </div>
    </>
  );
};

export default RadioTherapyWellBeingTool;
