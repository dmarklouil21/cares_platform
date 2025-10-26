import {useState, useEffect} from "react";
import { useLocation, Link, useParams } from "react-router-dom";

const HistoricalUpdates = () => {
  const location = useLocation();
  const record = location.state
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    if (record) {
      setPatient(record.patient)
    }
  }, [record]);
  console.log("Patient: ", patient);

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-gray overflow-auto">
      {/* <div className="bg-white h-[10%] px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">View Patient</h1>
        <div className="p-3">
          <Link to={"/admin/patient/master-list"}>
            <img src="/images/back.png" alt="Back" className="h-6 cursor-pointer" />
          </Link>
        </div>
      </div> */}

      <form className="h-full w-full p-5 flex flex-col justify-between gap-5 bg[#F8F9FA]">
        <div className="border border-black/15 p-3 bg-white rounded-md">
          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Treatment/Services Recieved
            </h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left text-sm font-bold">Type</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-bold">Date Completed</th>
                    {/* <th className="py-2 px-4 border-b text-left text-sm font-bold">Result</th> */}
                  </tr>
                </thead>
                <tbody>
                  {(patient?.service_received ?? []).map((service, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-4 border-b text-sm">
                        {service?.service_type ?? ""}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {service?.date_completed ?? ""}
                      </td>
                    </tr>
                  ))}
                  {(patient?.service_received ?? []).length === 0 && (
                    <tr>
                      <td className="py-2 px-4 border-b text-sm" colSpan={2}>
                        No service/treatment recieve yet.
                      </td>
                    </tr>
                  )}
                  {/* <tr
                    className={"bg-white"}
                  >
                    <td className="py-2 px-4 border-b text-sm">
                      Cancer Screening
                    </td>
                    <td className="py-2 px-4 border-b text-sm">
                      September 21, 2025
                    </td>
                  </tr>
                  <tr
                    className={"bg-white"}
                  >
                    <td className="py-2 px-4 border-b text-sm">
                      Radiotherapy
                    </td>
                    <td className="py-2 px-4 border-b text-sm">
                      September 11, 2025
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Patient Historical Updates
            </h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left text-sm font-bold">Last Checkup</th>
                    <th className="py-2 px-4 border-b text-left text-sm font-bold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(patient?.historical_updates ?? []).map((update, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-4 border-b text-sm">
                        {update?.date ?? ""}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {update?.note ?? ""}
                      </td>
                    </tr>
                  ))}
                  {(patient?.historical_updates ?? []).length === 0 && (
                    <tr>
                      <td className="py-2 px-4 border-b text-sm" colSpan={2}>
                        No history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black rounded-md"
            to={`/private/patients/view/cancer-data`}
            state={{patient: patient}}
          >
            Back
          </Link>
        </div>
        <br />
      </form>
    </div>
  );
};

export default HistoricalUpdates;
