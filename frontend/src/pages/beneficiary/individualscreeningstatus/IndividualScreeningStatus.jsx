import { useState, useEffect } from "react";
import { data, useNavigate } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";
import api from "src/api/axiosInstance";

import NotificationModal from "src/components/NotificationModal";
import LoadingModal from "src/components/LoadingModal";
import ConfirmationModal from "src/components/ConfirmationModal";
import BeneficiarySidebar from "../../../components/navigation/Beneficiary";

const IndividualScreeningStatus = () => {
  const { user } = useAuth();
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [notification, setNotification] = useState("");

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
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [modalAppId, setModalAppId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await api.get(`/beneficiary/individual-screening/list/`);
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching pre-enrollment requests:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleCancel = (id) => {
    setModalText("Are you sure you want to cancel this application?");
    setModalAction({ type: "cancel", id: id });
    setModalOpen(true);
    // setModalAppId(id);
    // setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "cancel") {
      try {
        setLoading(true);
        const response = await api.delete(
          `/beneficiary/individual-screening/cancel-request/${modalAction.id}/`
        );
        setModalInfo({
          type: "success",
          title: "Success!",
          message: "Canceled Successfully.",
        });
        setShowModal(true);
      } catch (error) {
        setModalInfo({
          type: "error",
          title: "Failed to delete this object",
          message: "Something went wrong while submitting the request.",
        });
        setShowModal(true);
        console.error(error);
      } finally {
        fetchData();
        setLoading(false);
      }
    }
    // setNotification(`Application ${modalAppId} cancelled successfully.`);
    // setTimeout(() => setNotification(""), 3000);

    setModalOpen(false);
    setModalAction(null);
    // setModalAppId(null);
    setModalText("");
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setModalAppId(null);
    setModalText("");
  };

  const handleView = (id) => {
    // console.log("Value Passed: ", app);
    navigate("/Beneficiary/individualscreeningstatus/individualstatus-view", {
      state: { id: id },
    });
  };

  const filteredData = tableData.filter((record) => {
    const statusMatch =
      statusFilter === "All" || record.status === statusFilter;
    const searchMatch =
      !searchQuery ||
      record.patient.patient_id.includes(searchQuery) ||
      record.patient.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const recordDate = new Date(record.created_at).toISOString().split("T")[0];
    const dateMatch = !dateFilter || recordDate === dateFilter;

    return statusMatch && searchMatch && dateMatch;
  });
  // const filteredData = tableData;
  console.log("Filtered Data:", filteredData);

  return (
    <>
      <ConfirmationModal
        open={modalOpen}
        text={modalText}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal open={loading} text="Submitting your data..." />
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
      <div class="w-full h-screen  bg-gray overflow-auto">
        {/*! mobile sidebar  */}
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

        <div className="w-full flex-1 py-5 flex flex-col h-full px-5 gap-5 ">
          <h2 className="text-xl font-bold text-left w-full pl-5">
            Individual Screening
          </h2>

          <div className="lex flex-col bg-white rounded-[4px] w-full shadow-md px-5 py-5 gap-3">
            <p className="text-md font-semibold text-yellow mb-3">
              Individual Screening
            </p>
            {/* <h2 className="text-xl font-bold text-left w-full pl-5">
              Individual Screening
            </h2> */}
            {/* <hr className="border-2 border-[#749AB6]" /> */}

            <div className="flex justify-between flex-wrap gap-3 mb-3">
              <input
                type="text"
                placeholder="Search by application ID ..."
                className="border border-gray-200 py-2 w-[48%] px-5 rounded-md text-[12px] md:text-[16px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="border border-gray-200 rounded-md p-2 bg-white text-[12px] md:text-[16px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                {/* <option value="requirements">Requirements</option> */}
                <option value="approved">Approve</option>
              </select>
              <input
                type="date"
                className="border border-gray-200 py-2 px-5 rounded-md text-[14px] md:text-[16px]"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <button
                className="px-7 rounded-md text-[12px] md:text-sm bg-[#C5D7E5]"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Filter
              </button>
            </div>

            <div className="bg-white shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[17%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead>
                  <tr className="bg-lightblue">
                    <th
                      scope="col"
                      className=" text-center text-[10px] md:text-sm  py-3 !bg-lightblue"
                    >
                      Patient ID
                    </th>
                    <th
                      scope="col"
                      className="  py-3 text-center text-[10px] md:text-sm"
                    >
                      Date Created
                    </th>
                    <th
                      scope="col"
                      className="  py-3 text-center text-[10px] md:text-sm"
                    >
                      Date Approved
                    </th>
                    <th
                      scope="col"
                      className="  py-3 text-center text-[10px] md:text-sm"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className=" text-[10px] md:text-sm  py-3 text-center text-sm "
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
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-gray-500"
                        >
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((app) => (
                        <tr key={app.id}>
                          <td className=" p-2 text-[12px] md:text-sm text-center text-[#333333]">
                            {app.patient.patient_id}
                          </td>
                          <td className=" p-2 text-[12px] md:text-sm text-center text-[#333333]">
                            {app.created_at.split("T")[0]}
                          </td>
                          <td className=" p-2 text-[12px] md:text-sm text-center text-[#333333]">
                            {app.date_approved
                              ? app.date_approved.split("T")[0]
                              : "--"}
                          </td>
                          <td className=" p-2 text-[12px] md:text-sm text-center text-[#333333]">
                            <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-[#1976D2]">
                              {app.status}
                            </span>
                          </td>
                          <td className="text-center text-sm py-4 flex gap-2 justify-center">
                            {" "}
                            {/*flex py-2 gap-2 px-2 justify-around text-sm text-center text-[#333333]" */}
                            {app.status !== "Pending" && (
                              <button
                                type="button"
                                className="text-white py-1 px-3 rounded-md shadow bg-primary cursor-pointer"
                                onClick={() => handleView(app.id)}
                              >
                                {" "}
                                {/*custom-shadow w-[50%] cursor-pointer text-white bg-primary py-[5px] rounded-md px-3 */}
                                View
                              </button>
                            )}
                            {app.status !== "Complete" && (
                              <button
                                type="button"
                                className="text-white py-1 px-3 rounded-md shadow bg-red-500 cursor-pointer"
                                onClick={() => handleCancel(app.id)}
                              >
                                Cancel
                              </button>
                            )}
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
        <div className="h-16 bg-secondary "></div>
      </div>
    </>
  );
};

export default IndividualScreeningStatus;
