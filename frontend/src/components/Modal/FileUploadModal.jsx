const FileUploadModal = ({ open, title, recipient, onFileChange, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>

        {recipient && (
          <p className="text-sm text-gray-600 mb-3">
            Recipient: <span className="font-medium">{recipient}</span>
          </p>
        )}

        <input
          type="file"
          accept="application/pdf"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4"
          onChange={(e) => onFileChange(e.target.files[0])}
        />

        <div className="flex justify-end gap-3">
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
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
