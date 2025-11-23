import React, { useState, useEffect } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import api from "src/api/axiosInstance";

const PatientView = () => {
  const location = useLocation();
  const { patient_id } = useParams();
  const [patient, setPatient] = useState(null);

  const raw = location.state?.patient ?? {};

  const SAMPLE_2X2 = "https://placehold.co/600x600/png?text=2x2+Photo";
  const photoUrl = SAMPLE_2X2;

  // const patient = {
  //   patient_id: raw.patient_id ?? "",
  //   full_name: raw.full_name ?? "",
  //   first_name: raw.first_name ?? "",
  //   middle_name: raw.middle_name ?? "",
  //   last_name: raw.last_name ?? "",
  //   suffix: raw.suffix ?? "",
  //   date_of_birth: raw.date_of_birth ?? "",
  //   age: raw.age ?? "",
  //   sex: raw.sex ?? "",
  //   civil_status: raw.civil_status ?? "",
  //   number_of_children: raw.number_of_children ?? "",
  //   address: raw.address ?? "",
  //   city: raw.city ?? "",
  //   barangay: raw.barangay ?? "",
  //   email: raw.email ?? "",
  //   mobile_number: raw.mobile_number ?? "",
  //   source_of_information: raw.source_of_information ?? "",
  //   other_rafi_programs_availed: raw.other_rafi_programs_availed ?? "",
  //   highest_educational_attainment: raw.highest_educational_attainment ?? "",
  //   source_of_income: raw.source_of_income ?? "",
  //   occupation: raw.occupation ?? "",
  //   monthly_income: raw.monthly_income ?? "",
  //   photo_url: raw.photo_url ?? "",
  //   pre_screening_form: raw.patient?.pre_screening_form ?? {},
  //   diagnosis: Array.isArray(raw.diagnosis) ? raw.diagnosis : [],
  //   emergency_contacts: Array.isArray(raw.emergency_contacts)
  //     ? raw.emergency_contacts
  //     : [],
  //   historical_updates: Array.isArray(raw.historical_updates)
  //     ? raw.historical_updates
  //     : [],
  // };
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await api.get(`/patient/details/${patient_id}/`);
        if (isMounted) {
          setPatient(response.data);
        }
      } catch (error) {
        console.error("Error fetching beneficiary data:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [patient_id]);

  return (
    <div className="h-screen w-full flex flex-col justify-start p-5 gap-3 items-center bg-gray overflow-auto">
      {/* <div className=" px-5 w-full flex justify-between items-center">
        <h1 className="text-md font-bold">View Patient</h1>
        <Link to={"/rhu/patients"}>
          <img
            src="/images/back.png"
            alt="Back"
            className="h-6 cursor-pointer"
          />
        </Link>
      </div> */}

      <form className="h-full w-full  flex flex-col justify-between gap-5 bg[#F8F9FA]">
        <div className="border border-black/15 p-3 bg-white rounded-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between py-3 px-5 items-start md:items-center gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold">PATIENT PROFILE</h1>
              <p className="text-sm text-gray-600">
                Patient ID:{" "}
                <span className="font-semibold">
                  {patient?.patient_id || "N/A"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Photo */}
              <div className="w-[120px] h-[120px] border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={patient?.photo_url_display}
                  alt="2x2 ID"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Logo */}
              <img
                src="/images/logo_black_text.png"
                alt="rafi logo"
                className="h-30 md:h-30 object-contain"
              />
            </div>
          </div>

          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Personal Information
            </h2>
          </div>

          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={patient?.full_name || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-medium block mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={patient?.first_name || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={patient?.middle_name || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={patient?.last_name || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Suffix</label>
                <input
                  type="text"
                  value={patient?.suffix || "N/A"}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Birthdate
                </label>
                <input
                  type="text"
                  value={patient?.date_of_birth || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Age</label>
                <input
                  type="text"
                  value={patient?.age || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Sex</label>
                <input
                  type="text"
                  value={patient?.sex || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Number of Children
                </label>
                <input
                  type="text"
                  value={patient?.number_of_children || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Civil Status
                </label>
                <input
                  type="text"
                  value={patient?.civil_status || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray/50"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Contact & Address
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Permanent Address
                </label>
                <input
                  type="text"
                  value={patient?.address || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  City/Municipality
                </label>
                <input
                  type="text"
                  value={patient?.city || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Barangay
                </label>
                <input
                  type="text"
                  value={patient?.barangay || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">Email</label>
                <input
                  type="text"
                  value={patient?.email || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={patient?.mobile_number || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Additional Info
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Source of Information (Where did you hear about RAFI-EJACC?)
                </label>
                <input
                  type="text"
                  value={patient?.source_of_information || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Other RAFI program you availed
                </label>
                <input
                  type="text"
                  value={patient?.other_rafi_programs_availed || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Socioeconomic Info
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Highest Educational Attainment
                </label>
                <input
                  type="text"
                  value={patient?.highest_educational_attainment || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Source of Income
                </label>
                <input
                  type="text"
                  value={patient?.source_of_income || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={patient?.occupation || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Income</label>
                <input
                  type="text"
                  value={patient?.monthly_income || ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 mt-8 border-b border-gray-200 px-5">
            <h2 className="text-md font-bold tracking-wide uppercase pb-1">
              Emergency Contacts
            </h2>
          </div>
          <div className="flex flex-row gap-8 p-4">
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">Name</label>
                <input
                  type="text"
                  value={patient?.emergency_contacts?.[0]?.name ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Relationship to Patient
                </label>
                <input
                  type="text"
                  value={
                    patient?.emergency_contacts?.[0]?.relationship_to_patient ??
                    ""
                  }
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Landline Number
                </label>
                <input
                  type="text"
                  value={
                    patient?.emergency_contacts?.[0]?.landline_number ?? ""
                  }
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={patient?.emergency_contacts?.[0]?.address ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  value={patient?.emergency_contacts?.[0]?.email ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={patient?.emergency_contacts?.[0]?.mobile_number ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>

            {/* Second Contact */}
            <div className="flex flex-col gap-3 w-1/2">
              <div>
                <label className="text-sm font-medium block mb-1">Name</label>
                <input
                  type="text"
                  value={patient?.emergency_contacts?.[1]?.name ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Relationship to Patient
                </label>
                <input
                  type="text"
                  value={
                    patient?.emergency_contacts?.[1]?.relationship_to_patient ??
                    ""
                  }
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Landline Number
                </label>
                <input
                  type="text"
                  value={
                    patient?.emergency_contacts?.[1]?.landline_number ?? ""
                  }
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={patient?.emergency_contacts?.[1]?.address ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  value={patient?.emergency_contacts?.[1]?.email ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={patient?.emergency_contacts?.[1]?.mobile_number ?? ""}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end">
          <Link
            className="text-center bg-white text-black py-2 w-[35%] border border-black/15 hover:border-black rounded-md"
            to="/private/patients/view/cancer-data"
            state={{ patient: patient }}
          >
            NEXT
          </Link>
        </div>
        <br />
      </form>
    </div>
  );
};

export default PatientView;
