export default function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="mb-6 text-xl font-semibold text-gray-800">{text}</p>
        <div className="flex gap-4">
          <button
            className="px-5 py-2 bg-primary text-white rounded hover:bg-primary/50"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400" 
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 

// bg-red-500
// className="px-5 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary/50 cursor-pointer"
// className="px-5 py-1.5 rounded bg-gray-300 text-white font-semibold hover:bg-red-200 cursor-pointer" 