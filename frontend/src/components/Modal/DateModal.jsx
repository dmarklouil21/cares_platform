import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Assuming you have lucide-react, otherwise use text "<" ">"

const DateModal = ({
  open,
  title = "Set Date",
  value,
  onChange,
  onConfirm,
  onCancel,
}) => {
  // State for the calendar view (which month/year is currently visible)
  const [viewDate, setViewDate] = useState(new Date());
  const [errors, setErrors] = useState({});

  // Sync internal view with the selected value when modal opens
  useEffect(() => {
    if (open) {
      if (value) {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) {
          setViewDate(dateObj);
        }
      } else {
        setViewDate(new Date());
      }
      setErrors({});
    }
  }, [open, value]);

  if (!open) return null;

  // --- Calendar Helpers ---
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    // Create date string in YYYY-MM-DD format (local time)
    // We construct it manually to avoid timezone shifting issues
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateString = `${year}-${month}-${dayStr}`;

    onChange(dateString);
    setErrors({});
  };

  // --- Rendering Logic ---
  const daysInCurrentMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayIndex = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()); // 0 = Sunday
  
  // Calculate "Today" to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renderCalendarDays = () => {
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Days of current month
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
      const isPast = currentDayDate < today;
      
      // Check if this specific day is the currently selected value
      let isSelected = false;
      if (value) {
        const [selYear, selMonth, selDay] = value.split('-').map(Number);
        if (
          selYear === viewDate.getFullYear() &&
          selMonth === viewDate.getMonth() + 1 &&
          selDay === i
        ) {
          isSelected = true;
        }
      }

      days.push(
        <button
          key={i}
          disabled={isPast}
          onClick={() => handleDateClick(i)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all
            ${isPast 
              ? "text-gray-300 cursor-not-allowed" 
              : isSelected
                ? "bg-primary text-white font-bold hover:bg-primary/90 shadow-md"
                : "text-gray-700 hover:bg-gray-100 font-medium"
            }
          `}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  // --- Validation ---
  const validate = () => {
    const newErrors = {};
    if (!value) {
        newErrors["date_validation"] = "Please select a date.";
    } else if (value < new Date().toISOString().split('T')[0]) {
        // Double check specifically for past dates just in case
        newErrors["date_validation"] = "Invalid Date - Date should not be in the past";
    }
    return newErrors;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">{title}</h2>

        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4 px-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="font-semibold text-gray-800 text-lg">
            {months[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>

          <button 
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <span key={day} className="text-xs font-bold text-gray-400">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 place-items-center mb-4">
          {renderCalendarDays()}
        </div>

        {/* Error Display */}
        {errors.date_validation && (
          <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded text-center">
             <span className="text-red-500 text-xs font-medium">
                {errors.date_validation}
             </span>
          </div>
        )}

        {/* Selected Date Display (Optional Helper) */}
        {value && (
            <div className="text-center text-sm text-gray-500 mb-4">
                Selected: <span className="font-semibold text-primary">{new Date(value).toLocaleDateString('en-US', { dateStyle: 'long'})}</span>
            </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <button
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-all active:scale-95"
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