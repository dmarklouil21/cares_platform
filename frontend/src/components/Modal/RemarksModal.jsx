import React from "react";

const RemarksModal = ({
  open,
  title = "Remarks",
  placeholder = "Enter your remarks here...",
  value,
  onChange,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md animate-fadeIn">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>

        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4 resize-none"
          rows={4}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemarksModal;
