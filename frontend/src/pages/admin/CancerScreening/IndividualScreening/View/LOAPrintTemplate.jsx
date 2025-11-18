import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LOAPrintTemplate = ({ loaData, onDownload }) => {
  const downloadPDF = async () => {
    try {
      const element = document.getElementById('loa-print-content');
      
      if (!element) {
        console.error('Print element not found');
        return;
      }

      // Show the element temporarily
      element.classList.remove('hidden');

      // Give it a moment to render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('loa-print-content');
          if (clonedElement) {
            clonedElement.style.display = 'flex';
            clonedElement.style.visibility = 'visible';
          }
        }
      });

      // Hide the element again
      element.classList.add('hidden');

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // A4 portrait dimensions (210mm x 297mm)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      // Calculate image dimensions to fit A4 portrait
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Download the PDF
      pdf.save(`LOA-${loaData?.patient?.full_name || 'document'}.pdf`);
      
      // Call the callback if provided
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Hide the element in case of error
      const element = document.getElementById('loa-print-content');
      if (element) {
        element.classList.add('hidden');
      }
    }
  };

  // If onDownload prop is provided, call downloadPDF when component mounts
  React.useEffect(() => {
    if (onDownload) {
      downloadPDF();
    }
  }, [onDownload]);

  return (
    <div
      id="loa-print-content"
      className="hidden print:flex fixed top-0 left-0 w-full h-full flex-col bg-white z-50"
      style={{ 
        margin: 0, 
        padding: 0,
        width: '210mm', // A4 width
        minHeight: '297mm', // A4 height
        left: '50%',
        transform: 'translateX(-50%)'
      }}
    >
      <style>{`
        @media print {
          @page { 
            margin: 0 !important; 
            size: A4 portrait;
          }
          body { 
            margin: 0 !important; 
            width: 210mm;
            height: 297mm;
          }
          #loa-print-content { 
            margin: 0 !important; 
            padding: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            position: relative !important;
            left: 0 !important;
            transform: none !important;
          }
        }
      `}</style>
      
      {/* Header Section */}
      <div className="flex flex-col w-full">
        <div
          className="absolute left-0 top-0 bg-primary px-5 py-4 rounded-br-4xl"
          style={{ width: 'auto' }}
        >
          <img 
            src="/images/logo_white_text.png" 
            alt="Rafi Logo" 
            style={{ height: '40px' }}
          />
        </div>
        
        <div className="bg-yellow w-full flex justify-end items-end text-sm pr-8 pb-1 h-8">
          <h1 className="text-gray2 font-bold">
            Touching People, Shaping the Future
          </h1>
        </div>
        
        <div className="bg-lightblue w-full flex justify-end items-end pr-8 py-1 h-6">
          <p className="text-gray2 text-xs font-bold">
            Upholding the dignity of man by working with communities to elevate their well-being
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 pt-20" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
        <h1 className="font-bold text-lg">CHONG HUA HOSPITAL-MANDAUE</h1>
        <p className="mb-6 text-sm">Cebu City</p>
        
        <h1 className="font-bold mb-4 text-right text-sm">Serial No DAA275</h1>
        <h1 className="font-bold mb-8 text-center text-lg">LETTER OF AUTHORITY (LOA)</h1>
        
        {/* Patient Information */}
        <div className="flex justify-between text-xs mb-8">
          <div>
            <p>
              <span className="font-bold">Patient Name: </span> {loaData?.patient?.full_name || 'N/A'}
            </p>
            <p>
              <span className="font-bold">Address: </span> {loaData?.patient?.city || 'N/A'}
            </p>
          </div>

          <div className="text-left">
            <p>
              <span className="font-bold">Date: </span> {new Date().toLocaleDateString()}
            </p>
            <p>
              <span className="font-bold">Age: </span> {loaData?.patient?.age || 'N/A'} years old
            </p>
          </div>
        </div>

        {/* Document Content */}
        <div className="text-xs space-y-4">
          <p>
            <span className="font-semibold">Diagnosis/ Impression: </span>
            {loaData?.patient?.diagnosis?.[0]?.diagnosis || 'N/A'}
          </p>

          <div>
            <p className="font-semibold">
              Diagnostic/ Treatment / Procedure:
              <span className="font-normal"> {loaData?.procedure_name || 'N/A'}</span>
            </p>
            <p className="italic pl-32 text-xs">(Excluding Doctor's Professional Fee)</p>
          </div>

          <p className="font-semibold">
            Please accommodate this request and send the result and bill of said patient to:
          </p>

          <div>
            <p>RAMON ABOITIZ FOUNDATION INC.</p>
            <p>35 Eduardo Aboitiz St. Brgy Tinago, Cebu City</p>
            <p>Tel. No. 411-1700</p>
          </div>

          <p className="font-semibold">This serves as an original LOA.</p>
          
          <div className="my-6"></div>
          
          <p>Thank you.</p>

          {/* Signatures Section */}
          <div className="flex justify-between mt-12">
            <div className="text-center">
              <p>Prepared by:</p>
              <div className="mt-8">
                <p className="font-bold uppercase">Gina A. Mariquit</p>
                <p>Senior Program Officer</p>
                <p>RAFI-EJACC</p>
              </div>
            </div>
            
            <div className="text-center">
              <p>Approved by:</p>
              <div className="mt-8">
                <p className="font-bold uppercase">Karen Jane D. Wenceslao</p>
                <p>Health Program-OIC</p>
                <p>RAFI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full mt-auto">
        <div className="bg-yellow h-2"></div>
        <div className="flex flex-wrap justify-end items-center gap-2 pr-4 py-1 bg-primary text-white text-[8px]">
          <div className="flex items-center gap-1">
            <img
              src="/src/assets/images/patient/applicationstatus/printlocation.svg"
              className="h-3"
              alt="location icon"
            />
            <span>35 Eduardo Aboitiz Street, Cebu City 6000 Philippines</span>
          </div>
          
          <div className="flex items-center gap-1">
            <img
              src="/src/assets/images/patient/applicationstatus/printtelephone.svg"
              className="h-3"
              alt="telephone icon"
            />
            <span>+63 (032) 265-5910, +63 998 967 1917, +63 998 966 0737</span>
          </div>
          
          <div className="flex items-center gap-1">
            <img
              src="/src/assets/images/patient/applicationstatus/printemail.svg"
              className="h-3"
              alt="email icon"
            />
            <span>communicate@rafi.ph</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#fff"
              className="w-3 h-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-7.5 9h15"
              />
            </svg>
            <span>www.rafi.org.ph</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LOAPrintTemplate;