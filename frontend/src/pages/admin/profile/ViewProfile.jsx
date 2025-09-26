import React, { useState } from "react";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import { useNavigate } from "react-router-dom";

const ViewProfile = () => {
  const navigate = useNavigate();

  // start in view-only mode
  const [readOnly, setReadOnly] = useState(true);

  // seed with sample values; adjust as you like
  const [formData, setFormData] = useState({
    firstName: "Juan",
    lastName: "Dela Cruz",
    birthDate: "1990-01-01",
    age: "35",
    email: "juan.delacruz@example.com",
    phone: "09171234567",
    isResident: "yes",
    lgu: "Cebu City",
    address: "123 Example St, Cebu",
    agreed: true,
  });

  // keep a snapshot for cancel
  const [beforeEdit, setBeforeEdit] = useState(formData);

  // confirm + notification modals
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notify, setNotify] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = () => {
    setBeforeEdit(formData);
    setReadOnly(false);
  };

  const handleCancel = () => {
    setFormData(beforeEdit);
    setReadOnly(true);
  };

  const handleSave = () => {
    setConfirmOpen(true);
  };

  const validate = () => {
    const essential = { ...formData };
    delete essential.agreed; // not required for editing
    return Object.entries(essential).every(
      ([, v]) => String(v ?? "").trim() !== ""
    );
  };

  const confirmSave = () => {
    setConfirmOpen(false);

    if (!validate()) {
      setNotify({
        show: true,
        type: "info",
        title: "Incomplete",
        message: "Please fill in all fields before saving.",
      });
      return;
    }

    // UI-only "save"
    setReadOnly(true);
    setNotify({
      show: true,
      type: "success",
      title: "Saved",
      message: "Your profile has been updated (UI only).",
    });
  };

  // Shared field classes: border only when editing
  const fieldBase = "rounded-md p-2";
  const fieldView = "bg-gray-100";
  const fieldEdit = "bg-white border border-black/15";
  const fieldCls = `${fieldBase} ${readOnly ? fieldView : fieldEdit}`;

  // 🔙 Real back behavior
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/admin"); // fallback (adjust if needed)
  };

  return (
    <>
      <ConfirmationModal
        open={confirmOpen}
        title="Save changes to your profile?"
        desc="This is a UI-only action. No data will be stored."
        onConfirm={confirmSave}
        onCancel={() => setConfirmOpen(false)}
      />

      <NotificationModal
        show={notify.show}
        type={notify.type}
        title={notify.title}
        message={notify.message}
        onClose={() => setNotify((n) => ({ ...n, show: false }))}
      />

      <div className="h-screen w-full flex flex-col gap-4 p-5 bg-gray overflow-auto">
        <div className="flex items-center px-5 justify-between">
          <div className="flex justitfy-center items-center gap-5">
            <h1 className="text-lg font-bold">View Profile</h1>
            {readOnly ? (
              <div className="flex gap-5 justify-center items-center">
                <button
                  onClick={handleEdit}
                  className="px-4 py-1 rounded bg-primary text-white hover:bg-primary/80"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1 rounded bg-white border border-black/15 hover:bg-gray"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1 rounded bg-primary text-white hover:bg-primary/80"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* 🔙 Back to previous page (no Link) */}
          <button
            type="button"
            onClick={handleBack}
            className="p-0 m-0 bg-transparent border-none"
            aria-label="Go back"
            title="Go back"
          >
            <img
              src="/images/back.png"
              alt="Back"
              className="h-6 cursor-pointer"
            />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow border border-black/10 p-5 md:p-8">
          <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="h-auto w-full flex flex-col items-start gap-3 md:col-span-2 mt-5">
              <label className="text-sm">Profile Picture</label>

              <div className="relative">
                <img
                  src={formData.profilePic || "/images/bigAvatar.png"}
                  alt="Profile"
                  className="h-28 md:h-50 object-cover rounded-full border border-gray-300"
                />
                {!readOnly && (
                  <label
                    htmlFor="profilePic"
                    className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-full cursor-pointer text-md hover:bg-primary/80"
                  >
                    Change
                  </label>
                )}
              </div>

              {!readOnly && (
                <input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData((prev) => ({
                          ...prev,
                          profilePic: reader.result,
                          profileFile: file,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              )}
            </div>

            <div className="flex flex-col gap-2 ">
              <label className="text-sm">First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Date of Birth</label>
              <input
                name="birthDate"
                value={formData.birthDate}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
                type="date"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Age</label>
              <input
                name="age"
                value={formData.age}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
                type="email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
                type="tel"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Resident of Cebu (province)</label>
              <select
                name="isResident"
                value={formData.isResident}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <p className="text-xs text-gray-400">
                Our cancer care services are currently limited to residents of
                Cebu.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">LGU</label>
              <input
                name="lgu"
                value={formData.lgu}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={onChange}
                disabled={readOnly}
                className={fieldCls}
                type="text"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewProfile;
