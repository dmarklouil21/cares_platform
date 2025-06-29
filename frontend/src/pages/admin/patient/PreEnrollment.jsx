import { useState, useEffect, act } from "react";
import { useNavigate } from "react-router-dom";
import api from "src/api/axiosInstance"; 

const PreEnrollment = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await api.get("/ejacc/pre-enrollment/list/");
        console.log("Pre-enrollment requests:", response.data);
        if (isMounted) {
          setTableData(response.data);
        }
      } catch (error) {
        console.error("Error fetching pre-enrollment requests:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []); 

  useEffect(() => {
    setCurrentPage(1);
  }, [tableData, recordsPerPage]);

  const filteredResults = tableData.results?.filter((record) => {
    const matchesSearch =
      !searchQuery ||
      record.beneficiary_id?.toString().includes(searchQuery) ||
      record.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    const formattedDate = dateFilter
      ? new Date(dateFilter).toISOString().split('T')[0]
      : null;

    const matchesDate =
      !formattedDate || record.date_created === formattedDate;

    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // reset to first page
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const totalRecords = filteredResults.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const paginatedData = filteredResults.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );


  const handleActionClick = async (beneficiary_id, action) => {
    try {
      const url = `/ejacc/pre-enrollment/${action}/${beneficiary_id}/`;

      if (action === "delete") {
        await api.delete(url);
      } else {
        await api.patch(url, {
          status: action === "validate" ? "validated" : "rejected"
        });
      }

      alert(`${action} Successfully`);
    } catch (error) {
      console.error(`An error occurred while trying to ${action} this beneficiary`, error);
      alert(`Failed to ${action} beneficiary. Please try again.`);
    }
  };

  const handleViewClick = (beneficiary_id) => {
    navigate(`/Admin/patient/view/AdminPreenrollmentDetails/${beneficiary_id}`);
  };

  return (
    <div className="h-full w-full bg-gray">
      <div className="bg-white py-4 px-5 flex justify-between items-center">
        <h1 className="text-md font-bold">Admin</h1>
      </div>
      <div className="px-5 py-7 flex flex-col gap-7">
        <h2 className="text-xl font-bold ml-5">Pre-Enrollment</h2>

        <div className="flex flex-col bg-white h-[80%] rounded-2xl shadow-md px-5 py-5 gap-6">
          <a href="#" className="text-md font-semibold text-yellow">
            Pre-Enrollment Requests
          </a>

          <div className="flex justify-between flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by beneficiary ID ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
            />

            <select
              className="border border-gray-200 rounded-md p-2 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="validated">Validated</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              type="date"
              className="border border-gray-200 py-2 px-5 rounded-md"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            <button className="px-7 rounded-md text-sm text-white bg-lightblue">
              Filter
            </button>
          </div>

          <div className="overflow-x-auto bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-lightblue">
                  <th className="w-[13%] text-center text-sm py-3">
                    Beneficiary ID
                  </th>
                  <th className="w-[20%] text-sm py-3">Name</th>
                  <th className="w-[15%] text-center text-sm py-3">
                    Submission Date
                  </th>
                  <th className="w-[15%] text-center text-sm py-3">LGU</th>
                  <th className="w-[15%] text-center text-sm py-3">Status</th>
                  <th className="w-full text-center text-sm py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData?.map((item) => (
                  <tr key={item.beneficiary_id}>
                    <td className="text-center text-sm py-4 text-gray-800">
                      {item.beneficiary_id}
                    </td>
                    <td className="text-center text-sm py-4 text-gray-800">
                      {item.full_name}
                    </td>
                    <td className="text-center text-sm py-4 text-gray-800">
                      {new Date(item.date_created).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="text-center text-sm py-4 text-gray-800">
                      {item.city}
                    </td>
                    <td className="text-center text-sm py-4 text-gray-800">
                      <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-md bg-amber-50 text-amber-600">
                        {item.status}
                      </span>
                    </td>
                    <td className="text-center text-sm py-4 flex gap-2 justify-center">
                      <button
                        onClick={() => handleViewClick(item.beneficiary_id)}
                        className="text-white py-1 px-3 rounded-md shadow bg-primary"
                      >
                        View
                      </button>
                      {
                        item.status === "pending" && 
                          <button 
                            onClick={() => handleActionClick(item.beneficiary_id, "validate")} 
                            className="text-white py-1 px-3 rounded-md shadow bg-green-500">
                            Validate
                        </button>
                      }
                      {
                        item.status === "pending" ? 
                          <button 
                            onClick={() => handleActionClick(item.beneficiary_id, "reject")}
                            className="text-white py-1 px-3 rounded-md shadow bg-red-500">
                            Reject
                          </button> 
                        : 
                          <button 
                            onClick={() => handleActionClick(item.beneficiary_id, "delete")}
                            className="text-white py-1 px-3 rounded-md shadow bg-red-500">
                            Delete
                          </button>
                      }
                    </td>
                  </tr>
                ))}
                {paginatedData?.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="flex justify-end items-center py-2 gap-5">
            <div className="flex items-center gap-2">
              <label htmlFor="recordsPerPage" className="text-sm text-gray-700">
                Record per page:
              </label>
              <select id="recordsPerPage" className="w-16 rounded-md shadow-sm" value={recordsPerPage} onChange={handleRecordsPerPageChange}>
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-sm text-gray-700">
                {/* 1 – 10 of {filteredData.length} */}
                {Math.min((currentPage - 1) * recordsPerPage + 1, totalRecords)} –{' '}
                {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords}
              </span>
              <button onClick={handlePrev} disabled={currentPage === 1} className="text-gray-600">←</button>
              <button onClick={handleNext} disabled={currentPage === totalPages} className="text-gray-600">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreEnrollment;
