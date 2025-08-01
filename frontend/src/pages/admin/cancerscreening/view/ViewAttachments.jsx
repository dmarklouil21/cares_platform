import { useState } from "react";
import { Link } from "react-router-dom";

const ViewAttachments = () => {
  const [files, setFiles] = useState([
    {
      name: "MRIReport.pdf",
      type: "pdf",
      url: "/files/shit.pdf",
    },
    {
      name: "ClinicReferral.docx",
      type: "doc",
      url: "/files/Project-Adviser-Appointment-Form-EDITED.docx",
    },
    {
      name: "BrainScan.jpg",
      type: "image",
      url: "/src/assets/images/admin/cancerscreening/individualscreening/Image.svg",
    },
  ]);

  const handleAddFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    input.onchange = (e) => {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        type: file.type.split("/")[1] || "file",
        url: URL.createObjectURL(file),
        fileObject: file, // Store the actual file object
      }));

      setFiles([...files, ...newFiles]);
    };

    input.click();
  };

  const handleDelete = (index, e) => {
    e.stopPropagation();
    if (files[index].url.startsWith("blob:")) {
      URL.revokeObjectURL(files[index].url);
    }
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleViewFile = (file, e) => {
    e.stopPropagation();
    if (file.fileObject) {
      // For newly uploaded files
      const fileURL = URL.createObjectURL(file.fileObject);
      window.open(fileURL, "_blank");
    } else {
      // For sample files
      window.open(file.url, "_blank");
    }
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
          <h3 className="text-2xl font-bold text-secondary">ATTACHMENTS</h3>
          <Link to={"/Admin/cancerscreening/view/AdminIndividualScreeningView"}>
            <img
              src="/images/back.png"
              alt="Back button icon"
              className="h-7"
            />
          </Link>
        </div>
        <div className="w-full bg-white rounded-2xl py-7 px-8 ">
          <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-6 flex flex-row gap-4 flex-wrap items-center justify-start min-h-[120px]">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="relative group"
                onClick={(e) => handleViewFile(file, e)}
              >
                <div className="w-32 h-32 bg-white rounded-lg shadow flex flex-col items-center justify-center cursor-pointer border border-gray-200 hover:shadow-lg transition">
                  {file.type.match(/image/) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-16 h-16 object-contain mb-2"
                    />
                  ) : file.type.includes("pdf") ? (
                    <img
                      src="/src/assets/images/admin/cancerscreening/individualscreening/pdf.svg"
                      alt="PDF"
                      className="w-12 h-12 mb-2"
                    />
                  ) : file.type.match(/docx?/) ? (
                    <img
                      src="/src/assets/images/admin/cancerscreening/individualscreening/docs.svg"
                      alt="DOC"
                      className="w-12 h-12 mb-2"
                    />
                  ) : (
                    <span className="w-12 h-12 mb-2 bg-gray-300 rounded" />
                  )}
                  <span className="text-xs text-center break-all px-1">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(idx, e)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={handleAddFile}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAttachments;
