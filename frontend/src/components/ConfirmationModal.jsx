export default function ConfirmationModal({ open, desc, onConfirm, onCancel, title }) {
  if (!open) return null;
  return (
    // version 1
    // <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    //   <div className="bg-white rounded-md shadow-lg p-8 min-w-[300px] flex flex-col items-center">
    //     <p className="text-lg font-semibold mb-4 text-gray-800">{text}</p>
    //     <div className="flex gap-4">
    //        <button
    //         className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors" 
    //         onClick={onCancel}
    //       >
    //         Cancel
    //       </button>
    //       <button
    //         className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
    //         onClick={onConfirm}
    //       >
    //         Confirm
    //       </button>
    //     </div>
    //   </div>
    // </div>
    // version 2
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{desc}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-[#749AB6] text-white hover:bg-[#5f86a7]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
} 
