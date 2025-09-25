import React from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

const iconMap = {
  success: <CheckCircle className="w-7 h-7 text-green-500 " />,
  error: <XCircle className="w-7 h-7 text-red-500 " />,
  info: <Info className="w-7 h-7 text-blue-500" />,
};

export default function NotificationModal({
  show,
  type = "success",
  title = "Success!",
  message,
  onClose,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex justify-center items-center gap-3">
            {iconMap[type]}
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
          <p className="text-gray-600 ">{message}</p>
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
}
