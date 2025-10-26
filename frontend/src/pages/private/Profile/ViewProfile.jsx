import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import api from "src/api/axiosInstance";

const ViewProfile = () => {
  const navigate = useNavigate();

  // Start in read-only mode
  const [readOnly, setReadOnly] = useState(true);

  // Seed with sample values (UI-only). Replace with real values if you pass state/props.
  const [formData, setFormData] = useState({
    lgu: "RHU Argao",
    address: "Poblacion, Argao, Cebu",
    phone_number: "09171234567",
    email: "rhu.argaosec@example.com",
    representative_first_name: "Ana",
    representative_last_name: "Santos",
    official_representative_name: "Ana Santos",
    profilePic: "",
    profileFile: null,
    agreed: true,
  });

  // Keep a snapshot for cancel
  const [beforeEdit, setBeforeEdit] = useState(formData);

  // Modals & async state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notify, setNotify] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helpers
  const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const phoneOk = (p) => /^\d{11}$/.test(p);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    // keep phone digits only, max 11 (UI validation)
    if (name === "phone_number") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => ({ ...prev, [name]: digits }));
      return;
    }
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

  const handleSave = () => setConfirmOpen(true);

  const validateAll = () => {
    // Validate only changed fields
    const changed = {};
    Object.keys(formData).forEach((k) => {
      if (["profilePic", "profileFile", "agreed"].includes(k)) return;
      if (formData[k] !== beforeEdit[k]) changed[k] = true;
    });

    if (changed.phone_number && !phoneOk(formData.phone_number)) {
      setNotify({
        show: true,
        type: "info",
        title: "Invalid Phone Number",
        message: "Phone number must be exactly 11 digits.",
      });
      return false;
    }
    // email is read-only; no validation here
    return true;
  };

  const confirmSave = async () => {
    setConfirmOpen(false);
    if (!validateAll()) return;

    setSaving(true);
    try {
      const payload = new FormData();
      let hasChanges = false;

      if (formData.profileFile) {
        payload.append("avatar", formData.profileFile);
        hasChanges = true;
      }
      if (formData.lgu !== beforeEdit.lgu) {
        payload.append("lgu", formData.lgu);
        hasChanges = true;
      }
      if (formData.address !== beforeEdit.address) {
        payload.append("address", formData.address);
        hasChanges = true;
      }
      if (formData.phone_number !== beforeEdit.phone_number) {
        payload.append("phone_number", formData.phone_number);
        hasChanges = true;
      }
      if (
        formData.representative_first_name !==
        beforeEdit.representative_first_name
      ) {
        payload.append(
          "representative_first_name",
          formData.representative_first_name
        );
        hasChanges = true;
      }
      if (
        formData.representative_last_name !==
        beforeEdit.representative_last_name
      ) {
        payload.append(
          "representative_last_name",
          formData.representative_last_name
        );
        hasChanges = true;
      }
      if (
        formData.official_representative_name !==
        beforeEdit.official_representative_name
      ) {
        payload.append(
          "official_representative_name",
          formData.official_representative_name
        );
        hasChanges = true;
      }

      if (!hasChanges) {
        setNotify({
          show: true,
          type: "info",
          title: "No changes",
          message: "There are no changes to save.",
        });
        setSaving(false);
        return;
      }

      const res = await api.put("/rhu/profile/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const d = res.data;
      const mapped = {
        lgu: d.lgu || "",
        address: d.address || "",
        phone_number: d.phone_number || "",
        email: d.email || "",
        representative_first_name: d.representative_first_name || "",
        representative_last_name: d.representative_last_name || "",
        official_representative_name: d.official_representative_name || "",
        profilePic: d.avatar
          ? `http://localhost:8000${d.avatar}`
          : formData.profilePic,
        profileFile: null,
        agreed: true,
      };
      setFormData(mapped);
      setBeforeEdit(mapped);
      setReadOnly(true);
      setNotify({
        show: true,
        type: "success",
        title: "Saved",
        message: "RHU profile updated.",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save RHU profile.";
      setNotify({ show: true, type: "info", title: "Error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Fetch RHU profile on mount
  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/rhu/profile/");
        const d = res.data;
        const mapped = {
          lgu: d.lgu || "",
          address: d.address || "",
          phone_number: d.phone_number || "",
          email: d.email || "",
          representative_first_name: d.representative_first_name || "",
          representative_last_name: d.representative_last_name || "",
          official_representative_name: d.official_representative_name || "",
          profilePic: d.avatar ? `http://localhost:8000${d.avatar}` : "",
          profileFile: null,
          agreed: true,
        };
        setFormData(mapped);
        setBeforeEdit(mapped);
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Failed to load RHU profile.";
        setNotify({ show: true, type: "info", title: "Error", message: msg });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Shared field classes: subtle difference for view vs edit
  const fieldBase = "rounded-md p-2";
  const fieldView = "bg-gray-100";
  const fieldEdit = "bg-white border border-black/15";
  const fieldCls = `${fieldBase} ${readOnly ? fieldView : fieldEdit}`;

  // 🔙 Back (no Link)
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/"); // fallback
  };

  return (
    <>
      <ConfirmationModal
        open={confirmOpen}
        title="Save changes to your profile?"
        desc="This will update your RHU profile in the system."
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
        {/* Header */}
        <div className="flex items-center px-5 justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-lg font-bold">View Profile</h1>
            {readOnly ? (
              <button
                onClick={handleEdit}
                className="px-4 py-1 rounded bg-primary text-white hover:bg-primary/80"
              >
                Edit
              </button>
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

        {/* Content */}
        <div className="bg-white rounded-2xl shadow border border-black/10 p-5 md:p-8">
          <h2 className="text-lg font-semibold mb-4">RHU Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="h-auto w-full flex flex-col items-start gap-3 md:col-span-2 mt-5">
              <label className="text-sm">Profile Picture</label>

              <div className="relative">
                <img
                  src={formData.profilePic || "/images/bigAvatar.png"}
                  alt="Profile"
                  className="size-40 md:size-60 object-cover rounded-full border border-gray-300"
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

            <div className="flex flex-col gap-2">
              <label className="text-sm">LGU</label>
              <input
                name="lgu"
                value={formData.lgu}
                onChange={onChange}
                disabled={readOnly || saving || loading}
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
                disabled={true}
                className={fieldCls}
                type="email"
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Phone Number</label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={onChange}
                disabled={readOnly || saving || loading}
                className={fieldCls}
                type="tel"
                placeholder="0917XXXXXXX"
              />
              <p className="text-xs text-gray-400">
                11 digits (e.g., 09171234567)
              </p>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={onChange}
                disabled={readOnly || saving || loading}
                className={fieldCls}
                type="text"
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4">
            Representative Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm">Representative First Name</label>
              <input
                name="representative_first_name"
                value={formData.representative_first_name}
                onChange={onChange}
                disabled={readOnly || saving || loading}
                className={fieldCls}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Representative Last Name</label>
              <input
                name="representative_last_name"
                value={formData.representative_last_name}
                onChange={onChange}
                disabled={readOnly || saving || loading}
                className={fieldCls}
                type="text"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm">Official Representative Name</label>
              <input
                name="official_representative_name"
                value={formData.official_representative_name}
                onChange={onChange}
                disabled={readOnly || saving || loading}
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
