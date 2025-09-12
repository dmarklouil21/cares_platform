import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BeneficiarySidebar from "../../../../../../components/navigation/Beneficiary";

const RadioactiveWellBeingTool = () => {
  const navigate = useNavigate();

  // paragraph answer
  const [improve, setImprove] = useState("");

  // simple form state for the header fields
  const [form, setForm] = useState({
    name: "",
    date: "",
    address: "",
    diagnosis: "",
    generalStatus: "",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const updateForm = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const scale = [
    { value: 1, en: "Strongly Disagree", ceb: "Hugot nga di muuyon" },
    { value: 2, en: "Disagree", ceb: "Wala muuyon" },
    { value: 3, en: "Agree", ceb: "Uyon" },
    { value: 4, en: "Strongly Agree", ceb: "Uyon Kaayo" },
  ];

  const questions = [
    {
      id: 1,
      en: "I feel my body is doing well",
      ceb: "Pamati nako lagsik akong lawas",
    },
    {
      id: 2,
      en: "There are times that I suddenly feel dizzy",
      ceb: "Naay mga panahon nga kalit ko malipong",
    },
    {
      id: 3,
      en: "I can still help my family",
      ceb: "Makatabang gihapon ko sa akong pamilya",
    },
    {
      id: 4,
      en: "The side effects of the medicine are a hassle",
      ceb: "Nahasolan ko sa side effects sa tambal",
    },
    {
      id: 5,
      en: "I am still able to do my daily activities",
      ceb: "Kaya nako maglihok-lihok taga adlaw",
    },
    {
      id: 6,
      en: "The things and activities that I do are meaningful",
      ceb: "Akong mga buhat ug lihok kay naay hinungdan",
    },
    {
      id: 7,
      en: "I have lost weight even without dieting",
      ceb: "Nawad-an kog timbang bisan walay diyeta",
    },
    { id: 8, en: "I have gained weight", ceb: "Nisaka akong timbang" },
    {
      id: 9,
      en: "I have lost appetite in eating",
      ceb: "Nawad-an kog gana sa pagkaon",
    },
    {
      id: 10,
      en: "I feel tired most of the time nearly every day",
      ceb: "Bati-on ko ug kapoy kanunay halos kada adlaw",
    },
  ];

  // { [questionId]: 1|2|3|4 }
  const [answers, setAnswers] = useState({});

  const handleNext = () => {
    const payload = {
      ...form,
      improve: improve.trim(),
      answers, // e.g., {1:3, 2:2, ...}
    };
    console.log("[WellBeingTool] Submission:", payload);

    navigate(
      "/Beneficiary/services/cancer-management-options/radioactive/radio-active-documents"
    );
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">

      <div className="md:hidden">
        <BeneficiarySidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      <div className="bg-white py-4 px-10 flex justify-between items-center ">
        {/* Menu Button for Mobile */}
        <img
          className="md:hidden size-5 cursor-pointer"
          src="/images/menu-line.svg"
          onClick={() => setIsSidebarOpen(true)}
        />

        <div className="font-bold">Beneficiary</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>

      <div className="py-6 px-5 md:px-10 flex flex-col flex-1 overflow-auto">
        <div className="bg-white rounded-2xl flex p-7 flex-col gap-7">
          <div className="flex w-full justify-between gap-4 overflow-x-auto">
            
            <div className="flex flex-col w-[85%] gap-2">
              <div className="flex w-full md:flex-row flex-col gap-2">
                <label className="whitespace-nowrap">Name:</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={updateForm("name")}
                  className="border-b-2 outline-0 w-full"
                />
                <label className="whitespace-nowrap">Date:</label>
                <input
                  type="text"
                  value={form.date}
                  onChange={updateForm("date")}
                  className="border-b-2 outline-0 w-40"
                />
              </div>
              <div className="flex w-full md:flex-row flex-col gap-2">
                <label className="whitespace-nowrap">Address:</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={updateForm("address")}
                  className="border-b-2 outline-0 w-full"
                />
              </div>
              <div className="flex w-full md:flex-row flex-col gap-2">
                <label className="whitespace-nowrap">Diagnosis:</label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={updateForm("diagnosis")}
                  className="border-b-2 outline-0 w-full"
                />
              </div>
              <div className="flex w-full md:flex-row flex-col gap-2">
                <label className="whitespace-nowrap">
                  General Status/Name:
                </label>
                <input
                  type="text"
                  value={form.generalStatus}
                  onChange={updateForm("generalStatus")}
                  className="border-b-2 outline-0 w-full"
                />
              </div>
            </div>

            <div className="rounded-lg p-2 shrink-0 md:flex hidden">
              <img
                src="/images/logo_black_text.png"
                alt="Rafi icon"
                className="h-32 w-auto"
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
                        <div className="font-medium leading-tight">{q.en}</div>
                        <div className="text-primary text-xs leading-tight">
                          {q.ceb}
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

            <div className="p-6">
              <p className="text-[14px] md:text-[16px]">
                1. How do you think you can further improve your physical health
                and well being? Give specific activities/Scenarios.
              </p>
              <p className="text-primary text-[14px] md:text-[16px]">
                Sa imong hunahuna sa unsang paagi nimo mapauswag ang imong
                kahimsog sa panglawas? Paghatag ug espesipikong mga
                kalihokan/aktibidades.
              </p>

              {/* Lined textarea (real lines) */}
              <div className="mt-3">
                <div className="relative">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="h-10 border-b-2 border-black"></div>
                    <div className="h-10 border-b-2 border-black"></div>
                    <div className="h-10 border-b-2 border-black"></div>
                  </div>
                  <textarea
                    id="improve"
                    rows={3}
                    value={improve}
                    onChange={(e) => setImprove(e.target.value)}
                    className="relative w-full bg-transparent outline-none resize-none leading-[40px] pl-4 pr-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-between gap-8">
            <Link
              to="/Beneficiary/services/cancer-management-options/radioactive"
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

export default RadioactiveWellBeingTool;
