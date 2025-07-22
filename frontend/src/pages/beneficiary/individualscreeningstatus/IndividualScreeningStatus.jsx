// Modal component for confirmation
function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-xl font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/50"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-1.5 rounded bg-red-500 text-white font-semibold hover:bg-red-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
const sampleApplications = [
  {
    id: "APP-2025-003",
    serviceType: "Individual Screening",
    dateApproved: "4/12/2025",
    status: "Approved",
    lastUpdated: "4/12/2025",
  },
  {
    id: "APP-2025-004",
    serviceType: "Results Upload",
    dateApproved: "4/13/2025",
    status: "Upload",
    lastUpdated: "4/13/2025",
  },
  {
    id: "APP-2025-005",
    serviceType: "Ongoing Step",
    dateApproved: "4/14/2025",
    status: "Ongoing",
    lastUpdated: "4/14/2025",
  },
];

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const IndividualScreeningStatus = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [notification, setNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAppId, setModalAppId] = useState(null);

  const navigate = useNavigate();

  const handleCancel = (id) => {
    setModalText("Are you sure you want to cancel this application?");
    setModalAppId(id);
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    setNotification(`Application ${modalAppId} cancelled successfully.`);
    setTimeout(() => setNotification(""), 3000);
    setModalOpen(false);
    setModalAppId(null);
    setModalText("");
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalAppId(null);
    setModalText("");
  };

  const handleView = (app) => {
    navigate("/Beneficiary/individualscreeningstatus/individualstatus-view", {
      state: { status: app.status, application: app },
    });
  };

  const filteredApplications = sampleApplications.filter((app) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      app.id.toLowerCase().includes(query) ||
      app.serviceType.toLowerCase().includes(query);
    const matchesStatus = app.status !== "Pending";
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      {notification && (
        <div className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500">
          <div className="bg-gray2 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3">
            <img
              src="/images/logo_white_notxt.png"
              alt="Rafi Logo"
              className="h-[25px]"
            />
            <span>{notification}</span>
          </div>
        </div>
      )}
      <div class="w-full h-screen bg-gray overflow-auto">
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

        <div class="px-10 h-[89%] p-5 bg-[#F0F2F5]">
          <div class="bg-white flex flex-col gap-3 py-5 px-5 rounded-lg h-full">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">
              Individual Screening Status
            </h2>
            <hr class="border-2 border-[#749AB6]" />

            <div class="flex justify-between">
              <input
                type="text"
                placeholder="Search by application ID or service type..."
                class="border-[1px] border-[#E1E4E8] py-2 w-[50%] px-5 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                class="border-[1px] border-[#E1E4E8] rounded-md p-2 bg-white appearance-none pr-8"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                {/* <option value="requirements">Requirements</option> */}
                <option value="approved">Approved</option>
              </select>
              <input
                type="date"
                class="border-[1px] border-[#E1E4E8] py-2 px-5 rounded-md"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <button
                class="bg-[#C5D7E5] px-7 rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Filter
              </button>
            </div>
            <div class="overflow-x-auto h-full bg-white shadow">
              <table class="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[17%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead>
                  <tr class="bg-lightblue">
                    <th
                      scope="col"
                      class=" text-center text-sm  py-3 !bg-lightblue"
                    >
                      Patient ID
                    </th>
                    {/* <th scope="col" class="w-[20%]  text-sm py-3">
                      Service Type
                    </th> */}
                    <th scope="col" class="  py-3 text-center text-sm">
                      Date Approved
                    </th>
                    <th scope="col" class="  py-3 text-center text-sm">
                      Status
                    </th>
                    <th scope="col" class="  py-3 text-center text-sm">
                      Last Updated
                    </th>
                    <th
                      scope="col"
                      class="   py-3 text-center text-sm tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-[277px] min-h-[277px] overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 border-spacing-0">
                  <colgroup>
                    <col className="w-[18%]" />
                    {/* <col className="w-[20%] " /> */}
                    <col className="w-[20%]" />
                    <col className="w-[20%]" />
                    <col className="w-[17%]" />
                    <col className="w-[25%]" />
                  </colgroup>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="6" class="text-center py-4 text-gray-500">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id}>
                          <td class=" py-2 text-sm text-center text-[#333333]">
                            {app.id}
                          </td>
                          {/* <td class=" py-2 text-sm text-center text-[#333333]">
                            {app.serviceType}
                          </td> */}
                          <td class=" py-2 text-sm text-center text-[#333333]">
                            {app.dateApproved}
                          </td>
                          <td class=" py-2 text-sm text-center text-[#333333]">
                            {app.status === "Approved" && (
                              <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#E8F5E9] text-[#4CAF50]">
                                Approved
                              </span>
                            )}
                            {app.status === "Upload" && (
                              <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FFF9C4] text-[#FBC02D]">
                                Upload
                              </span>
                            )}
                            {app.status === "Ongoing" && (
                              <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#E3F2FD] text-[#1976D2]">
                                Ongoing
                              </span>
                            )}
                          </td>
                          <td class=" py-2 text-sm text-center text-[#333333]">
                            {app.lastUpdated}
                          </td>
                          <td class="  flex py-2 gap-2 px-2 justify-around text-sm text-center text-[#333333]">
                            <button
                              type="button"
                              class="custom-shadow w-[50%] cursor-pointer text-white bg-primary py-[5px] rounded-md px-3"
                              onClick={() => handleView(app)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndividualScreeningStatus;
