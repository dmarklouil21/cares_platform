import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const Details = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const mockPatients = [
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
        highestEducation: "Bachelor's Degree",
        sourceOfIncome: "Employment",
        occupation: "Sewer",
        income: "15,000",
        sourceInfo:
          "Ingon kong mego nga akong lolo na ingon daw si lola nga si papa kay ni ingon nga si mama daw kay ni ingon nga ni ingon daw si kuya nga baho daw og tae",
        programAvailed:
          "Nalibang daw si pedro nga wa mangilo ka dagan dagan sa sapa ni langoy sa balas ga hakot og balas para iyabo.",
        emergencyContacts: [
          {
            name: "Maria Dela Cruz",
            relationship: "Spouse",
            landline: "032-123-4567",
            address: "Bogo, Argao, Cebu",
            email: "maria.delacruz@sample.com",
            mobile: "09123334455",
          },
          {
            name: "Pedro Reyes",
            relationship: "Brother",
            landline: "032-234-5678",
            address: "Cebu City, Cebu",
            email: "pedro.reyes@sample.com",
            mobile: "09127778899",
          },
        ],
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
        highestEducation: "Bachelor's Degree",
        sourceOfIncome: "Employment",
        occupation: "Teacher",
        income: "30,000",
        sourceInfo:
          "HAHAH kong mego nga akong lolo na ingon daw si lola nga si papa kay ni ingon nga si mama daw kay ni ingon nga ni ingon daw si kuya nga baho daw og tae",
        programAvailed:
          "HEHEH Nalibang daw si pedro nga wa mangilo ka dagan dagan sa sapa ni langoy sa balas ga hakot og balas para iyabo.",
        emergencyContacts: [
          {
            name: "Juan Santos",
            relationship: "Husband",
            address: "Poblacion, Argao, Cebu",
            mobile: "09125556677",
            landline: "032-345-6789",
            email: "juan.santos@sample.com",
          },
          {
            name: "Ana Garcia",
            relationship: "Sister",
            address: "Talisay City, Cebu",
            mobile: "09128889900",
            landline: "032-456-7890",
            email: "ana.garcia@sample.com",
          },
        ],
      },
    ];

    const foundPatient = mockPatients.find((p) => p.id === patientId);
    setPatient(foundPatient);
  }, [patientId]);

  if (!patient) {
    return <div className="p-6">Loading patient details...</div>;
  }
  return (
    <div className="h-screen w-full bg-white">
      <div className="bg-primary/50 h-[10%] px-5 flex justify-between items-center">
        <h1 className="text-md font-bold">Patient Details</h1>
      </div>
      <div className="h-[90%] overflow-auto  px-5 py-3 flex flex-col gap-3">
        <div className="flex justify-between px-5">
          <h2 className="text-xl font-bold">Patient No: {patient.id}</h2>
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
              <h1 className="text-md font-bold">Patient Profile</h1>
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
                  {patient.lastName}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.firstName}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.middleName}
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
                  {patient.dob}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.age}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.civilStatus}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.numChildren}
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
                  {patient.municipality}
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
                  {patient.mobile}
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
                {patient.sourceInfo}
              </p>
              <h1 className="bg-gray py-1.5 px-5 w-[60%] border-b border-black/30">
                Other RAFI program you availed:
              </h1>
              <p className="p-3 h-fit border-b border-black/30 w-[60%]">
                {patient.programAvailed}
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
                  {patient.highestEducation}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.sourceOfIncome}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.occupation}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.income}
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
                  {patient.emergencyContacts[0].name}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergencyContacts[0].relationship}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergencyContacts[0].landline}
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
                  {patient.emergencyContacts[0].address}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergencyContacts[0].email}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergencyContacts[0].mobile}
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
                  {patient.emergencyContacts[1].name}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergencyContacts[1].relationship}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergencyContacts[1].landline}
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
                  {patient.emergencyContacts[1].address}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergencyContacts[1].email}
                </li>
                <li className="border-b border-black/20 pl-4 py-2">
                  {patient.emergencyContacts[1].mobile}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <button className="flex justify-start px-12 py-1.5 bg-primary rounded-md w-fit font-bold text-white">
          Verify
        </button>
      </div>
    </div>
  );
};

export default Details;
