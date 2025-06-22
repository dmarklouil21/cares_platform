import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const IndividualScreening = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();

  const tableData = [
    {
      id: "001",
      name: "Juan Dela Cruz",
      submissionDate: "2025-04-12",
      lgu: "Municipality of Argao",
      status: "Pending",
      lastName: "dela Cruz",
      firstName: "Juan",
      middleName: "Reyes",
      dob: "1925-01-01",
      age: 100,
      civilStatus: "NCSB",
      sex: "Male",
      numChildren: 17,
      address: "Bogo, Argao, Cebu",
      mobile: "09122332332",
      municipality: "Argao",
      barangay: "Bogo",
      email: "email@sample.com",
    },
    {
      id: "002",
      name: "Maria Santos",
      submissionDate: "2025-04-10",
      lgu: "Municipality of Argao",
      status: "Verified",
      lastName: "Santos",
      firstName: "Maria",
      middleName: "Garcia",
      dob: "1980-05-15",
      age: 43,
      civilStatus: "Married",
      sex: "Female",
      numChildren: 3,
      address: "Poblacion, Argao, Cebu",
      mobile: "09123456789",
      municipality: "Argao",
      barangay: "Poblacion",
      email: "maria.santos@sample.com",
    },
  ];

  const filteredData = tableData.filter((record) => {
    const statusMatch =
      statusFilter === "All" || record.status === statusFilter;
    const searchMatch =
      !searchQuery ||
      record.id.includes(searchQuery) ||
      record.name.toLowerCase().includes(searchQuery.toLowerCase());
    const dateMatch = !dateFilter || record.submissionDate === dateFilter;

    return statusMatch && searchMatch && dateMatch;
  });

  const handleViewClick = (patientId) => {
    navigate(`/Admin/patient/view/AdminIndividualScreeningView`);
    // navigate(`/Admin/patient/view/AdminPatientDetails/${patientId}`);
  };

  return (
    <div className="h-full w-full bg-gray">
      <div className="bg-white py-4 px-5 flex justify-between items-center">
        <h1 className="text-md font-bold">Admin</h1>
      </div>
      <div className="px-5 py-7 flex flex-col gap-7">
        <h2 className="text-xl font-bold ml-5">Individual Screening</h2>

        <div className="flex flex-col bg-white h-[80%] rounded-2xl shadow-md px-5 py-5 gap-6">
          <a href="#" className="text-md font-semibold text-yellow">
            Individual Screening Applicant List
          </a>

          <div className="flex justify-between flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by patient ID ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 py-2 w-[48%] px-5 rounded-md"
            />

            <select
              className="border border-gray-200 rounded-md p-2 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
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
                    Patient ID
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
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="text-center text-sm py-4 text-gray-800">
                      {item.id}
                    </td>
                    <td className="text-center text-sm py-4 text-gray-800">
                      {item.name}
                    </td>
                    <td className="text-center text-sm py-4 text-gray-800">
                      {new Date(item.submissionDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="text-center text-sm py-4 text-gray-800">
                      {item.lgu}
                    </td>
                    <td className="text-center text-sm py-4 text-gray-800">
                      <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-md bg-amber-50 text-amber-600">
                        {item.status}
                      </span>
                    </td>
                    <td className="text-center text-sm py-4 flex gap-2 justify-center">
                      <button
                        onClick={() => handleViewClick(item.id)}
                        className="text-white py-1 px-3 rounded-md shadow bg-primary"
                      >
                        View
                      </button>
                      <button className="text-white py-1 px-3 rounded-md shadow bg-green-500">
                        Verify
                      </button>
                      <button className="text-white py-1 px-3 rounded-md shadow bg-red-500">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
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
              <select id="recordsPerPage" className="w-16 rounded-md shadow-sm">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-sm text-gray-700">
                1 – 10 of {filteredData.length}
              </span>
              <button className="text-gray-600">←</button>
              <button className="text-gray-600">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualScreening;
