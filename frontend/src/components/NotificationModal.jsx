import React from "react";
import { CheckCircle, XCircle, Info } from "lucide-react"; 

const iconMap = {
  success: <CheckCircle className="w-10 h-10 text-green-500 mb-4" />,
  error: <XCircle className="w-10 h-10 text-red-500 mb-4" />,
  info: <Info className="w-10 h-10 text-blue-500 mb-4" />,
};

export default function NotificationModal ({ show, type = "success", title = "Success!", message, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
          {iconMap[type]}
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
