import { useState, useEffect } from "react";
import { data, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "src/context/AuthContext";
import { RotateCcw } from "lucide-react";
import api from "src/api/axiosInstance";

import Notification from "src/components/Notification";

import NotificationModal from "src/components/Modal/NotificationModal";
import LoadingModal from "src/components/Modal/LoadingModal";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import BeneficiarySidebar from "src/components/navigation/Beneficiary";

const PostTreatmentStatus = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  // const [notification, setNotification] = useState("");

  // Notification
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState(
    location.state?.type || ""
  );
  const [notificationMessage, setNotificationMessage] = useState(
    location.state?.message || ""
  );

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
  const [modalDesc, setModalDesc] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [modalAppId, setModalAppId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (notificationType && notificationMessage) {
      setNotification(notificationMessage);

      navigate(location.pathname, { replace: true, state: {} });

      setTimeout(() => setNotification(""), 2000);
    }
  }, [notificationType, notificationMessage, navigate, location.pathname]);

  const fetchData = async () => {
    try {
      const response = await api.get(`/beneficiary/post-treatment/list/`);
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
    setModalText("Confirm Cancel?");
    setModalDesc("Are you sure you want to cancel this application?");
    setModalAction({ type: "cancel", id: id });
    setModalOpen(true);
    // setModalAppId(id);
    // setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (modalAction?.type === "cancel") {
      try {
        setModalOpen(false);
        setLoading(true);
        const response = await api.delete(
          `/beneficiary/individual-screening/cancel-request/${modalAction.id}/`
        );

        setNotificationMessage("Canceled Successfully.");
        setNotificationType("success");
        setNotification(notificationMessage);
        setTimeout(() => setNotification(""), 2000);
        // setModalInfo({
        //   type: "success",
        //   title: "Success!",
        //   message: "Canceled Successfully.",
        // });
        // setShowModal(true);
      } catch (error) {
        setNotificationMessage("Failed to cancel this request.");
        setNotificationType("error");
        setNotification(notificationMessage);
        setTimeout(() => setNotification(""), 2000);
        // setModalInfo({
        //   type: "error",
        //   title: "Failed to delete this object",
        //   message: "Something went wrong while submitting the request.",
        // });
        // setShowModal(true);
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
    console.log("What the heck?");
    navigate(`/beneficiary/applications/post-treatment/view/${id}`);
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
        title={modalText}
        desc={modalDesc}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      <Notification message={notification} type={notificationType} />
      <NotificationModal
        show={showModal}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={() => setShowModal(false)}
      />
      <LoadingModal open={loading} text="Submitting your data..." />
      {/* {notification && (
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
      )} */}
      <div className="w-full flex-1 py-2  flex flex-col justify-around px-5 overflow-auto bg-gray">
        <h2 className="text-xl font-bold text-left w-full pl-1">
          Post Treatment Laboratory Request
        </h2>

        <div className="flex flex-col bg-white rounded-[4px] w-full shadow-md px-5 py-5 gap-3">
          <p className="text-md font-semibold text-yellow mb-3">
            Track the status of your post treatment laboratory requests here.
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
              className="border border-gray-200 rounded-md p-2 bg-white"
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
              className="border border-gray-200 py-2 px-5 rounded-md"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button
              className="px-7 rounded-md text-sm bg-[#C5D7E5]"
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
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
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
                    Lab Test Date
                  </th>
                  <th
                    scope="col"
                    className="  py-3 text-center text-[10px] md:text-sm"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="   py-3 text-center text-[10px] md:text-sm tracking-wider"
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
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
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
                        <td className=" py-2 text-[12px] md:text-sm text-center text-[#333333]">
                          {app.patient.patient_id}
                        </td>
                        <td className=" py-2 text-[12px] md:text-sm text-center text-[#333333]">
                          {app.created_at.split("T")[0]}
                        </td>
                        <td className=" py-2 text-[12px] md:text-sm text-center text-[#333333]">
                          {app.date_approved
                            ? app.date_approved.split("T")[0]
                            : "--"}
                        </td>
                        <td className=" py-2 text-[12px] md:text-sm text-center text-[#333333]">
                          {app.laboratory_test_date
                            ? app.laboratory_test_date.split("T")[0]
                            : "--"}
                        </td>
                        <td className=" py-2 text-[12px] md:text-sm text-center text-[#333333]">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-[#1976D2]">
                            {app.status}
                          </span>
                        </td>
                        <td className="text-center text-sm py-4 flex gap-2 justify-center">
                          {" "} {/* Stop here for now. */}
                          {/*flex py-2 gap-2 px-2 justify-around text-sm text-center text-[#333333]" */}
                          {app.status !== "Pending" && app.status !== "Rejected" && (
                            <button
                              type="button"
                              className="text-white py-1 px-3 rounded-md shadow bg-primary cursor-pointer"
                              onClick={() => handleView(app.id)}
                            >
                              {" "}
                              View
                            </button>
                          )}
                          {app.status === "Rejected" && (
                            <button
                              type="button"
                              className="text-white py-1 px-3 rounded-md shadow bg-yellow cursor-pointer"
                              onClick={() => {
                                navigate("/beneficiary/services/cancer-management/apply/post-treatment", {
                                  state: { id: app.id },
                                });
                              }}
                            >
                              {" "}
                              <RotateCcw size={16} />
                            </button>
                          )}
                          {app.status !== "Completed" && (
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
    </>
  );
};

export default PostTreatmentStatus;
