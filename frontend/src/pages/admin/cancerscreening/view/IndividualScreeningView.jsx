import { Link } from "react-router-dom";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const IndividualScreeningView = () => {
  const location = useLocation();
  const record = location.state?.record;
  const [form, setForm] = useState({});

  useEffect(() => {
    if (record) {
      setForm(record);
    }
  }, [record]);

  // Helper functions for checkboxes/radios
  const isChecked = (field, value) => {
    if (!form) return false;
    if (Array.isArray(form[field])) return form[field].includes(value);
    return false;
  };
  const isRadio = (field, value) => {
    if (!form) return false;
    return form[field] === value;
  };

  // For nested fields
  const get = (obj, path, fallback = "") => {
    return path
      .split(".")
      .reduce((o, k) => (o && o[k] !== undefined ? o[k] : fallback), obj);
  };

  const handleViewClick = (patientId) => {
    const selected = tableData.find((item) => item.id === patientId);
    navigate(`/Admin/cancerscreening/view/ViewAttachments`, {
      state: { record: selected },
    });
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="bg-white py-4 px-10 flex justify-between items-center">
        <div className="font-bold">Admin</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>

      <div className="py-6 px-10 flex flex-col">
        <div className="flex justify-between p-3 items-center">
          <h3 className="text-2xl font-bold text-secondary">
            INDIVIDUAL SCREENING
          </h3>

          <Link to={"/Admin/cancerscreening/AdminIndividualScreening"}>
            <img
              src="/images/back.png"
              alt="Back button icon"
              className="h-7"
            />
          </Link>
        </div>
        <form className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8 ">
          <div className="flex flex-col ">
            <h2 className="text-2xl font-semibold">
              {form?.name || ""} Details
            </h2>
            {/* <p className="text-gray2 ">
              Monitor and manage cancer screening procedures, generate LOA, and
              upload diagnostic results.
            </p> */}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="screeningprocedure">Patient ID</label>
              <input
                type="text"
                name="screeningprocedure"
                id="screeningprocedure"
                placeholder="ex: Mammogram, MRI"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={form?.id || ""}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="proceduredetials">Name</label>
              <input
                type="text"
                name="proceduredetials"
                id="proceduredetials"
                placeholder="ex: Breast screening due to palpable mass"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={form?.name || ""}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="cancetsite">Date Approved</label>
              <input
                type="text"
                name="cancetsite"
                id="cancetsite"
                placeholder="ex: Breast"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={form?.Dateapproved || ""}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="cancetsite">LGU</label>
              <input
                type="text"
                name="cancetsite"
                id="cancetsite"
                placeholder="ex: Breast"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={form?.lgu || ""}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="cancetsite">Status</label>
              <input
                type="text"
                name="cancetsite"
                id="cancetsite"
                placeholder="ex: Breast"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={form?.status || ""}
                readOnly
              />
            </div>
          </div>
          <div className="flex justify-between w-full ">
            <Link className="bg-primary w-[23%] hover:bg-primary/50 text-center py-2.5 text-white rounded-md">
              Screening Procedure
            </Link>
            <Link className="bg-primary w-[23%] hover:bg-primary/50 text-center py-2.5 text-white rounded-md">
              Pre Screening Form
            </Link>
            <Link
              to={"/Admin/cancerscreening/view/ViewAttachments"}
              className="bg-primary w-[23%] hover:bg-primary/50 text-center py-2.5 text-white rounded-md"
            >
              View Attachments
            </Link>
            <Link className="bg-primary w-[23%] hover:bg-primary/50 text-center py-2.5 text-white rounded-md">
              Change Status
            </Link>
          </div>
        </form>
      </div>

      <div className="h-16 bg-secondary"></div>
    </div>
  );
};
export default IndividualScreeningView;
