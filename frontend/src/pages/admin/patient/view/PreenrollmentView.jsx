import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "src/api/axiosInstance"; 

const Details = () => {
  const { beneficiary_id } = useParams();
  const [patient, setPatient] = useState(null);
  console.log("Beneficiary ID:", beneficiary_id);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await api.get(`/ejacc/pre-enrollment/details/${beneficiary_id}/`);
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

  }, [beneficiary_id]);

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

  const handleVerifyClick = async (beneficiary_id) => {
    try{
      await api.post(`/ejacc/pre-enrollment/verify/${beneficiary_id}/`);
      alert("Validated Successfully");
    } catch (error) {
      console.error("There's an error occured while verifying this beneficiary", error);
    }
  };

  const handleDeleteClick = async (beneficiary_id) => {
      try{
        await api.delete(`/ejacc/pre-enrollment/delete/${beneficiary_id}/`);
      alert("Deleted Successfully");
    } catch (error) {
      console.error("There's an error occured while deleting this beneficiary", error);
    }
  }

  if (!patient) {
    return <div className="p-6">Loading patient details...</div>;
  }
  return (
    <div className="h-screen w-full bg-white">
      <div className="bg-primary/50 h-[10%] px-5 flex justify-between items-center">
        <h1 className="text-md font-bold">Beneficiary Details</h1>
      </div>
      <div className="h-[90%] overflow-auto  px-5 py-3 flex flex-col gap-3">
        <div className="flex justify-between px-5">
          <h2 className="text-xl font-bold">Beneficiary ID: {patient.beneficiary_id}</h2>
          <Link to={"/Admin/patient/AdminPreEnrollment"}>
            <img
              src="/images/back.png"
              alt="Back button icon"
              className="h-6"
            />
          </Link>
        </div>

        <div className="border rounded-md flex flex-col border-black/30">
          <div className="flex flex-col">
            <div className="bg-gray rounded-t-md py-2 px-5 flex justify-between items-center">
              <h1 className="text-md font-bold">Beneficiary Profile</h1>
            </div>
            <div className="flex justify-center bg-white p-5">
              <ul className="w-[100%] bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">
                  Last Name
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  First Name
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Middle Name
                </li>
                <li className="border-b border-black/20 pl-4 py-2">Sex</li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.last_name}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.first_name}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.middle_name}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.sex}
                </li>
              </ul>
              <ul className="w-[100%] bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">
                  Date of Birth
                </li>
                <li className="border-b border-black/20 pl-4 py-2">Age</li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Civil Status
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Number of Children
                </li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.date_of_birth}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.age}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.civil_status}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.number_of_children}
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="bg-gray py-2 px-5 flex justify-between items-center">
              <h1 className="text-md font-bold">Contact & Address</h1>
            </div>
            <div className="flex  bg-white p-5">
              <ul className="w-[100%] bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">
                  Permanent Address
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  City/Municipality
                </li>
                <li className="border-b border-black/20 pl-4 py-2">Barangay</li>
                <li className="border-b border-black/20 pl-4 py-2">Email</li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.address}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.city}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.barangay}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.email}
                </li>
              </ul>
              <ul className="w-[100%] h-fit bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">
                  Mobile Number
                </li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.mobile_number}
                </li>
              </ul>
            </div>
          </div>
          <div className="flex h-fit flex-col">
            <div className="bg-gray rounded-t-md py-2 px-5 flex justify-between items-center">
              <h1 className="text-md font-bold">Additional Info</h1>
            </div>
            <div className="flex flex-col bg-white p-5 ">
              <h1 className="bg-gray py-1.5 px-5 w-[60%] border-b border-black/30">
                Source of Information (Where did you here about RAFI-EJACC?)
              </h1>
              <p className="p-3 h-fit border-b border-black/30 w-[60%]">
                {patient.source_of_information}
              </p>
              <h1 className="bg-gray py-1.5 px-5 w-[60%] border-b border-black/30">
                Other RAFI program you availed:
              </h1>
              <p className="p-3 h-fit border-b border-black/30 w-[60%]">
                {patient.other_rafi_programs_availed}
              </p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="bg-gray py-2 px-5 flex justify-between items-center">
              <h1 className="text-md font-bold">Socioeconomic Info</h1>
            </div>
            <div className="flex  bg-white p-5">
              <ul className="w-[100%] bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">
                  Highest Educational Attainment
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Source of Income
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Occupation
                </li>
                <li className="border-b border-black/20 pl-4 py-2">Income</li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.highest_educational_attainment}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.source_of_income}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.occupation}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.monthly_income}
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="bg-gray rounded-t-md py-2 px-5 flex justify-between items-center">
              <h1 className="text-md font-bold">Emergency Contact 1</h1>
            </div>
            <div className="flex justify-center bg-white p-5">
              <ul className="w-[100%] bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">Name</li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Relationship to Patient
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Landline Number
                </li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[0]?.name || 'None'}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[0]?.relationship_to_patient || 'None'}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[0]?.landline_number || 'None'}
                </li>
              </ul>
              <ul className="w-[100%] bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">Address</li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Email Address
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Mobile Number
                </li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[0]?.address || 'None'}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[0]?.email || 'None'}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[0]?.mobile_number || 'None'}
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="bg-gray rounded-t-md py-2 px-5 flex justify-between items-center">
              <h1 className="text-md font-bold">Emergency Contact 2</h1>
            </div>
            <div className="flex justify-center bg-white p-5">
              <ul className="w-[100%] bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">Name</li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Relationship to Patient
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Landline Number
                </li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[1]?.name || 'None'}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[1]?.relationship_to_patient || 'None'}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[1]?.landline_number || 'None'}
                </li>
              </ul>
              <ul className="w-[100%] bg-gray/50">
                <li className="border-b border-black/20 pl-4 py-2">Address</li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Email Address
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  Mobile Number
                </li>
              </ul>
              <ul className="w-[100%]">
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[1]?.address || 'None'}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[1]?.email || 'None'}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergency_contacts[1]?.mobile_number || 'None'}
                </li>
              </ul>
            </div>
          </div>
        </div>
        {
          patient.status === "pending" ? 
            <button 
              onClick={() => handleActionClick(patient.beneficiary_id, "validate")}
              className="flex justify-start px-12 py-1.5 bg-primary rounded-md w-fit font-bold text-white">
              Verify
            </button>
          : 
            <button 
              onClick={() => handleActionClick(patient.beneficiary_id, "delete")}
              className="flex justify-start px-12 py-1.5 bg-primary rounded-md w-fit font-bold text-white">
              Delete
            </button>
        }
      </div>
    </div>
  );
};

export default Details;
