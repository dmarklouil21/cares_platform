import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ShieldAlert, 
  Check, 
  X, 
  FileText,
  Activity 
} from "lucide-react";

const NotePanel = ({ onAccept }) => {
  const location = useLocation();
  const serviceType = location.state;

  return (
    <div className="w-full h-screen bg-gray flex flex-col overflow-auto">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 md:p-8">
        <div className="w-full max-w-2xl flex flex-col gap-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-blue-50 rounded-full text-primary mb-2">
                    <Activity className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Cancer Treatment Registration
                </h1>
                <p className="text-gray-500 text-sm">
                    Please review the requirements before proceeding.
                </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                
                {/* Body Content */}
                <div className="p-8 space-y-6">
                    
                    {/* Pre-requisite Notice */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4 items-start">
                        <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                                Survey Required
                            </h3>
                            <p className="text-sm text-blue-900 leading-relaxed">
                                Before applying for this service, you must first complete the <strong>well-being survey form</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Disclaimer Box */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex gap-4 items-start">
                        <ShieldAlert className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wide">
                                Important Notice
                            </h3>
                            <p className="text-sm text-orange-900 leading-relaxed">
                                Completion of this form <strong>does not guarantee assistance</strong> from RAFI and Eduardo J. Aboitiz Cancer Center (EJACC). All applications are subject to review by the EJACC team.
                            </p>
                        </div>
                    </div>

                    {/* Data Privacy Text */}
                    <div className="text-gray-600 text-sm leading-7 text-justify pt-2">
                        <p>
                            Any personal information that you share within this registration form will be treated as <span className="font-semibold text-gray-900">sensitive information</span> and will only be used for checking your eligibility, processing your application, and sending you updates.
                        </p>
                        <p className="mt-4">
                            Your information will <strong>not</strong> be shared outside of RAFI without your permission.
                        </p>
                    </div>

                </div>

                {/* Footer / Actions */}
                <div className="flex justify-around print:hidden mt-6 mb-6">
                    <Link
                        to="/beneficiary/services/cancer-management"
                        // className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center gap-2"
                        className="w-[35%] text-center gap-2 px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:black/10 hover:border-black transition-all"
                    >
                        {/* <X className="w-4 h-4" /> */}
                        I Don't Accept
                    </Link>

                    <Link
                        to="/beneficiary/services/cancer-management/apply/well-being-tool"
                        state={serviceType} // Pass service type state to next page
                        onClick={onAccept}
                        // className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-primary text-white font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        className="text-center w-[35%] cursor-pointer gap-2 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all transform active:scale-95"
                    >
                        {/* <Check className="w-4 h-4" /> */}
                        I Accept
                    </Link>
                </div>

            </div>

            {/* Footer Text */}
            <p className="text-center text-xs text-gray-400">
                By clicking "I Accept", you proceed to the Well-being Survey.
            </p>
        </div>
      </div>
    </div>
  );
};

export default NotePanel;