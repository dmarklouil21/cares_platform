// components/SystemSuccess.jsx
import React from "react";
import { CheckCircle2 } from "lucide-react"; // lightweight icon library

const SystemSuccess = ({ message = "Transaction Successful!" }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
      {/* Success icon */}
      <CheckCircle2 className="text-primary w-20 h-20 mb-4" />

      {/* Success text */}
      <p className="text-white text-lg font-semibold">{message}</p>
    </div>
  );
};

export default SystemSuccess;