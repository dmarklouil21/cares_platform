import React from "react";

const CheckupSchedulesModal = ({ 
  open, 
  data, 
  onClose, 
  // handleMarkDone, 
  // handleReschedule, 
  // handleCancel 
}) => {
  if (!open) return null;

  const upcomingCheckups = data?.followup_checkups?.filter(
    (checkup) => checkup.status !== "Completed"
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-3xl">
        {/* Header */}
        <div className="border-b border-black/10 px-5 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Checkup Schedules
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-md">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left text-sm font-bold">Checkup Date</th>
                  <th className="py-2 px-4 border-b text-left text-sm font-bold">Note</th>
                  {/* <th className="py-2 px-4 border-b text-left text-sm font-bold">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {upcomingCheckups?.length > 0 ? (
                  upcomingCheckups.map((checkup, index) => (
                    <tr
                      key={checkup.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-4 border-b text-sm">
                        {checkup?.date ?? ""}
                      </td>
                      <td className="py-2 px-4 border-b text-sm">
                        {checkup?.note ?? ""}
                      </td>
                      {/* <td className="py-2 px-4 border-b text-sm">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleMarkDone(checkup?.id)} 
                            className="text-sm text-blue-700 hover:underline"
                          >
                            Mark as Done
                          </button>
                          <button 
                            onClick={() => handleReschedule(checkup?.id)} 
                            className="text-sm text-yellow-600 hover:underline"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => handleCancel(checkup?.id)} 
                            className="text-sm text-red-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 px-4 text-center text-sm text-gray-600" colSpan={3}>
                      No upcoming checkups available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-black/10 px-5 py-3">
          <button
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckupSchedulesModal;
