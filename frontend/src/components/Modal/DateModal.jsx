import React, {useState} from "react";

const DateModal = ({ 
  open, 
  title = "Set Date", 
  value, 
  onChange, 
  onConfirm, 
  onCancel 
}) => {

  const [errors, setErrors] = useState({});

  if (!open) return null;

  const validate = () => {
    const newErrors = {};

    if (value && value < new Date().toISOString().split('T')[0])
      newErrors["date_validation"] = "Invalid Date - Date should not be in the past";

    return newErrors;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
        
        <input
          type="date"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {/* <span className="text-xs text-red-500">Invalid Date - Date should not be in the past</span> */}
        {errors.date_validation && (
          <span className="text-red-500 text-xs">
            {errors.date_validation}
          </span>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
            onClick={() => {
              const validationErrors = validate();

              if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
              }

              setErrors({});
              onConfirm();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateModal;
