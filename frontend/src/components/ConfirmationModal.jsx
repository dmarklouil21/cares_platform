export default function ConfirmationModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[300px] flex flex-col items-center">
        <p className="text-lg font-semibold mb-4 text-gray-800">{text}</p>
        <div className="flex gap-4">
           <button
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
} 
