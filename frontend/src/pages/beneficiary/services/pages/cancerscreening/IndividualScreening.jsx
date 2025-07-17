import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const IndividualScreening = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formValues, setFormValues] = useState({
    screeningprocedure: "",
    proceduredetials: "",
    cancetsite: "",
  });
  const fileInputRef = useRef();

  // Print form values whenever they change
  useEffect(() => {
    console.log("Current form values:", formValues);
  }, [formValues]);

  // Print uploaded files whenever they change
  useEffect(() => {
    console.log(
      "Current uploaded files:",
      uploadedFiles.map((file) => ({
        name: file.file.name,
        type: file.file.type,
        size: file.file.size,
      }))
    );
  }, [uploadedFiles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithPreview = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    setUploadedFiles((prev) => [...prev, ...filesWithPreview]);
  };

  const handleDelete = (indexToRemove) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      const fileToDelete = updated[indexToRemove];
      if (fileToDelete.preview) URL.revokeObjectURL(fileToDelete.preview);
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleContinue = (e) => {
    e.preventDefault();
    // Navigation logic remains the same
    window.location.href =
      "/Beneficiary/services/cancer-screening/pre-screening-form";
  };

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      <div className="bg-white py-4 px-10 flex justify-between items-center">
        <div className="font-bold">Beneficary</div>
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <img
            src="/images/Avatar.png"
            alt="User Profile"
            className="rounded-full"
          />
        </div>
      </div>

      <div className="py-6 px-10 flex flex-col flex-1">
        <h2 className="text-xl font-semibold mb-6">Cancer Screening</h2>

        <form className="flex flex-col gap-6 w-full bg-white rounded-2xl py-7 px-8 flex-1 overflow-auto">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold text-secondary">
              INDIVIDUAL SCREENING
            </h3>
            <p className="text-gray2 ">
              Monitor and manage cancer screening procedures, generate LOA, and
              upload diagnostic results.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h1 className="font-bold text-xl">Screening Procedure</h1>
            <div className="flex flex-col gap-2">
              <label htmlFor="screeningprocedure">Screening Procedure:</label>
              <input
                type="text"
                name="screeningprocedure"
                id="screeningprocedure"
                placeholder="ex: Mammogram, MRI"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={formValues.screeningprocedure}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="proceduredetials">Procedure Details</label>
              <input
                type="text"
                name="proceduredetials"
                id="proceduredetials"
                placeholder="ex: Breast screening due to palpable mass"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={formValues.proceduredetials}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="cancetsite">Cancer Site</label>
              <input
                type="text"
                name="cancetsite"
                id="cancetsite"
                placeholder="ex: Breast"
                className="w-[85%] p-3 border border-gray2 rounded-md"
                value={formValues.cancetsite}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h1 className="font-bold text-xl">Requirements/Attachments</h1>
            <div className="font-bold px-3 flex flex-col gap-4">
              <div className="flex gap-5">
                <img src="/public/images/check-icon.svg" alt="check icon" />
                <p>Medical Certificate (Optional)</p>
              </div>
              <div className="flex gap-5">
                <img src="/public/images/check-icon.svg" alt="check icon" />
                <p>Laboratory Request</p>
              </div>
              <div className="flex gap-5">
                <img src="/public/images/check-icon.svg" alt="check icon" />
                <p>Barangay Certificate of Indigency</p>
              </div>
            </div>
            <div
              className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer"
              onClick={handleDivClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="bg-primary p-2 rounded-full">
                <img
                  src="/src/assets/images/services/cancerscreening/upload_icon.svg"
                  alt="Upload icon"
                />
              </div>
              <p className="font-semibold mt-4">Choose file</p>
              <p className="text-sm text-gray-500 mt-1">Size limit: 10MB</p>

              {uploadedFiles.length > 0 && (
                <div className="mt-6 w-full">
                  <p className="text-sm font-semibold mb-2">
                    {uploadedFiles.length} file(s) uploaded:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {uploadedFiles.map((item, index) => (
                      <div
                        key={index}
                        className="relative w-32 rounded-lg p-2 bg-yellow/60 shadow flex flex-col items-center text-sm"
                      >
                        <button
                          className="absolute top-1 right-2 text-red-500 font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                        >
                          X
                        </button>

                        {item.preview ? (
                          <img
                            src={item.preview}
                            alt="preview"
                            className="w-full h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-20 bg-primary flex items-center justify-center rounded text-xs text-gray-600 text-center px-1">
                            <img
                              src="/src/assets/images/services/cancerscreening/fileicon.svg"
                              alt="file icon"
                              className="h-13 w-13"
                            />
                          </div>
                        )}

                        <p className="mt-1 truncate w-full text-center text-xs">
                          {item.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between gap-5">
              <Link
                to="/Beneficiary/services/cancer-screening/individual-screening-req"
                className=" border  py-3 rounded-md text-center w-full hover:bg-black/10 hover:border-white"
              >
                Cancel
              </Link>
              <button
                onClick={handleContinue}
                className="bg-primary text-white py-3 rounded-md font-bold text-center w-full hover:bg-primary/50"
              >
                Continue
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="h-16 bg-secondary"></div>
    </div>
  );
};

export default IndividualScreening;
