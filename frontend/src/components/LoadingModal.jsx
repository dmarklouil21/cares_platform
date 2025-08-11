import React from "react";

export default function LoadingModal ({ text = "Loading...", open = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-sm w-full">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 font-medium">{text}</p>
      </div>
    </div>
  );
};
