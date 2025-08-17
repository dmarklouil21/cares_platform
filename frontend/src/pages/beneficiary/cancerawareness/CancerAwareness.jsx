const CancerAwareness = () => {
  return (
    <div className="w-full h-screen bg-gray flex flex-col justify-start ">
      <div className="bg-white py-4 px-10 flex justify-between items-center ">
        <div className="font-bold">Beneficary</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>
      <div className="overflow-auto ">
        <div className="py-6 px-10">
          <h1 className="text-lg font-bold mb-6">Cancer Awareness</h1>
          <div className="bg-white rounded-lg p-10 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-yellow mb-4">
              Cancer Awareness Activities
            </h2>
            <p className="mb-4 font-bold">
              Stay informed about past and upcoming cancer awareness programs
              and events.
            </p>
            <div className="flex flex-col gap-7">
              <div className="flex justify-start gap-8 p-5 border-b-[1.5px] border-primary">
                <img
                  src="/public/images/Screenshot 2025-06-21 230616.png"
                  alt="sample pic"
                  className="h-40 w-72 rounded-md"
                />
                <div className="flex flex-col justify-between py-2 w-[50%]">
                  <h1 className="font-bold text-primary text-xl">
                    Breast Cancer Awareness Walk
                  </h1>
                  <p className="text-[12px] text-yellow">May 31, 2025</p>
                  <p className="font-medium">
                    Join us for a community walk to raise awareness about breast
                    cancer and support survivors.
                  </p>
                  <div className="flex items-center justify-start gap-2">
                    <img
                      src="/src/assets/images/input_icons/attachmenticon.svg"
                      alt="attachment icon"
                      className="h-3.5 w-3.5"
                    />
                    <p className="text-[12px] text-blue-600 underline">
                      Download
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-start gap-8 p-5 border-b-[1.5px] border-primary">
                <img
                  src="/public/images/Screenshot 2025-06-21 230616.png"
                  alt="sample pic"
                  className="h-40 w-72 rounded-md"
                />
                <div className="flex flex-col justify-between py-2 w-[50%]">
                  <h1 className="font-bold text-primary text-xl">
                    Lung Cancer Awareness Seminar
                  </h1>
                  <p className="text-[12px] text-yellow">November 5, 2025</p>
                  <p className="font-medium">
                    Attend our seminar featuring expert speaker discussing lung
                    cancer prevention and treatment.
                  </p>
                  <div className="flex items-center justify-start gap-2">
                    <img
                      src="/src/assets/images/input_icons/attachmenticon.svg"
                      alt="attachment icon"
                      className="h-3.5 w-3.5"
                    />
                    <p className="text-[12px] text-blue-600 underline">
                      Download
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-start gap-8 p-5 border-b-[1.5px] border-primary">
                <img
                  src="/public/images/Screenshot 2025-06-21 230616.png"
                  alt="sample pic"
                  className="h-40 w-72 rounded-md"
                />
                <div className="flex flex-col justify-between py-2 w-[50%]">
                  <h1 className="font-bold text-primary text-xl">
                    Skin Cancer Prevention Workshop
                  </h1>
                  <p className="text-[12px] text-yellow">July 20 2025</p>
                  <p className="font-medium">
                    Learn how to protect your skin from harmful UV rays and
                    reduce your risk of skin cancer.
                  </p>
                  <div className="flex items-center justify-start gap-2">
                    <img
                      src="/src/assets/images/input_icons/attachmenticon.svg"
                      alt="attachment icon"
                      className="h-3.5 w-3.5"
                    />
                    <p className="text-[12px] text-blue-600 underline">
                      Download
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-yellow h-14 w-full"></div>
      </div>
    </div>
  );
};
export default CancerAwareness;
