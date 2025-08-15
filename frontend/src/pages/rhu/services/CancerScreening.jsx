import React from "react";

const screeningOptions = [
  // {
  //   id: "individual",
  //   title: "Individual Screening",
  //   description:
  //     "One-on-one medical evaluation for persons experiencing symptoms or with high cancer risk (family history, genetic factors). Includes doctor consultations, targeted tests (e.g., mammograms, PSA tests), and personalized results review.",
  //   features: [
  //     "Tailored tests based on your symptoms / risk",
  //     "Physician-guided process",
  //     "Private results with counseling",
  //   ],
  //   icon: "/src/assets/images/patient/services/cancerscreening/individualscreeningicon.png",
  //   // link: "/Beneficiary/services/cancer-screening/individual-screening-req",
  //   link: "/Beneficiary/services/cancer-screening/pre-screening-form-note",
  //   isLink: true,
  // },
  {
    id: "mass",
    title: "Mass Screening",
    description:
      "Community-based health drives offering free basic cancer checks (e.g., clinical breast exams, oral cancer checks) for early detection. No appointments needed – walk-ins welcome at scheduled locations.",
    features: [
      "Accessible neighborhood events",
      "Quick procedures",
      "Group education on cancer prevention",
    ],
    icon: "/src/assets/images/patient/services/cancerscreening/masscreeningicon.png",
    isLink: false,
  },
];

const CancerScreening = () => {
  return (
    <div className="w-full h-screen bg-gray overflow-auto">
      <div className="bg-white py-4 px-10 flex justify-between items-center">
        <div className="font-bold">RHU</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>

      <div className="py-6 px-10">
        <h2 className="text-xl font-semibold mb-6">Cancer Management</h2>

        <div className="flex flex-col gap-3 w-full bg-white rounded-2xl py-7 px-8">
          <h3 className="text-2xl font-bold text-secondary">
            CANCER TREATMENT MANAGEMENT OPTION
          </h3>
          <p className="text-gray2 mb-4">
            Navigate your treatment journey with expert-guided support
          </p>

          <div className="">
            {screeningOptions.map((option) => (
              <div
                key={option.id}
                className="rounded-xl custom-shadow gap-5 flex justify-between py-4 px-12 items-center"
              >
                <div className="flex flex-col items-center w-1/2">
                  <div className="flex flex-col gap-2 text-center">
                    <h4 className="text-2xl font-bold text-black">
                      {option.title}
                    </h4>
                    <p className="text-gray2 text-sm">{option.description}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center w-1/2 justify-between h-40">
                  <div className="w-full flex flex-col items-center gap-1.5">
                    <h1 className="font-bold">Key Features:</h1>
                    <ul className="list-disc list-inside text-left">
                      {option.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href="#"
                    className="px-10 py-2 bg-primary text-white text-sm rounded hover:bg-[#5a7c94] transition"
                  >
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-16 bg-secondary"></div>
    </div>
  );
};

export default CancerScreening;
