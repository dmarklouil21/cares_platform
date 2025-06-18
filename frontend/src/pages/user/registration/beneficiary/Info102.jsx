import React from "react";

const Info102 = () => {
  return (
    <div className="h-screen w-[75%] flex flex-col gap-12 bg-[#F5F7F9] py-12 px-12 overflow-auto">
      <div className="w-full flex justify-between px-9">
        <h1 className="font-bold text-2xl">Beneficiary registration</h1>
        <div className="flex text-right flex-col">
          <p className="text-sm">STEP 01/02</p>
          <h1 className="font-bold text-[#6B7280]">Info</h1>
        </div>
      </div>
      <form
        action=""
        method="post"
        className="bg-white p-9 flex flex-col gap-8 rounded-2xl"
      >
        <h1 className="font-bold text-2xl">Personal Details</h1>
        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
          <div className="flex gap-2 flex-col">
            <label className="">First Name</label>
            <input
              type="text"
              className="border-[#6B7280] border-[1px] rounded-md p-2"
            />
          </div>
          <div className="flex gap-2 flex-col">
            <label className="">Last Name</label>
            <input
              type="text"
              className="border-[#6B7280] border-[1px] rounded-md p-2"
            />
          </div>
          <div className="flex gap-2 flex-col">
            <label className="">Date of Birth</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <input
                type="date"
                className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                placeholder="Select date"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-col">
            <label className="">Age</label>
            <input
              type="text"
              className="border-[#6B7280] border-[1px] rounded-md p-2"
            />
          </div>
          <div className="flex gap-2 flex-col">
            <label className="">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <input
                type="email"
                className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                placeholder="ejacc@gmail.com"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-col">
            <label className="text-[#6B7280]">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="5"
                    y="2"
                    width="14"
                    height="20"
                    rx="2"
                    ry="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  ></rect>
                  <line
                    x1="12"
                    y1="18"
                    x2="12"
                    y2="18"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  ></line>
                  <line
                    x1="8"
                    y1="5"
                    x2="16"
                    y2="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  ></line>
                </svg>
              </div>
              <input
                type="tel"
                className="bg-white border border-[#6B7280] text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
                placeholder="123-456-7890"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <label className="">Are you a resident of Cebu (province)?</label>
            <div>
              <p className="text-[11px] text-[#B2B2B2]">
                Our cancer care services are currently limited to residents of
                Cebu.
              </p>
              <div className="relative">
                <select className="border-[#6B7280] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8">
                  <option value="" disabled selected>
                    Yes or No
                  </option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 flex-col h-23">
            <label className="">LGU</label>
            <input
              type="text"
              className="border-[#6B7280] border-[1px] rounded-md p-2"
            />
          </div>
          <div className="flex gap-2 flex-col col-span-2">
            <label className="">Address</label>
            <input
              type="text"
              className="border-[#6B7280] border-[1px] rounded-md p-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-bold text-2xl"></h1>
          <div className="flex gap-2">
            <input
              type="checkbox"
              name="myCheckbox"
              className="accent-[#749AB6]"
            />
            <p className="underline text-[12px]">
              Form notice & Data privacy notice
            </p>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <a className="text-black text-center py-2 w-[45%] border-[1px] hover:bg-[#F5F7F9] border-black hover:border-white rounded-md">
            BACK
          </a>
          <a
            href="../login_preenrollment/login.html"
            className="text-center font-bold bg-[#749AB6] text-white py-2 w-[45%] border-[1px] border-[#749AB6] hover:border-[#C5D7E5] hover:bg-[#C5D7E5] rounded-md"
          >
            SUBMIT
          </a>
        </div>
      </form>
    </div>
  );
};

export default Info102;
