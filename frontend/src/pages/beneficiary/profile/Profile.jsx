// src/pages/beneficiary/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "src/components/Modal/ConfirmationModal";
import NotificationModal from "src/components/Modal/NotificationModal";
import api from "src/api/axiosInstance";

const Profile = () => {
  const navigate = useNavigate();

  // View-only by default
  const [readOnly, setReadOnly] = useState(true);

  // Profile form state (mapped to backend fields)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    age: "",
    email: "",
    phone: "",
    isResident: "",
    lgu: "",
    address: "",
    profilePic: "",
    profileFile: null,
    agreed: true,
  });

  // Snapshot for Cancel
  const [beforeEdit, setBeforeEdit] = useState(formData);

  // Async/UI state + Modals
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notify, setNotify] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Helpers
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const phoneOk = (v) => /^\d{11}$/.test(v); // PH mobile (11 digits)

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      setFormData((p) => ({ ...p, phone: digits }));
      return;
    }

    if (name === "age") {
      const digits = value.replace(/\D/g, "").slice(0, 3);
      setFormData((p) => ({ ...p, age: digits }));
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

  const validate = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "birthDate",
      "email",
      "phone",
      "lgu",
      "address",
    ];
    const allFilled = requiredFields.every((k) => String(formData[k] ?? "").trim() !== "");
    if (!allFilled) {
      setNotify({
        show: true,
        type: "info",
        title: "Incomplete",
        message: "Please fill in all required fields.",
      });
      return false;
    }
    if (!emailOk(formData.email)) {
      setNotify({
        show: true,
        type: "info",
        title: "Invalid Email",
        message: "Please enter a valid email address (e.g., user@example.com).",
      });
      return false;
    }
    if (!phoneOk(formData.phone)) {
      setNotify({
        show: true,
        type: "info",
        title: "Invalid Phone Number",
        message: "Phone number must be exactly 11 digits.",
      });
      return false;
    }
    return true;
  };

  const confirmSave = async () => {
    setConfirmOpen(false);
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("first_name", formData.firstName);
      payload.append("last_name", formData.lastName);
      payload.append("date_of_birth", formData.birthDate);
      if (String(formData.age ?? "").trim() !== "") payload.append("age", formData.age);
      payload.append("phone_number", formData.phone);
      if (formData.isResident !== "") {
        payload.append(
          "is_resident_of_cebu",
          formData.isResident === "yes" ? "true" : "false"
        );
      }
      payload.append("lgu", formData.lgu);
      payload.append("address", formData.address);
      if (formData.profileFile) payload.append("avatar", formData.profileFile);

      const res = await api.put("/user/profile/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const d = res.data;
      const mapped = {
        firstName: d.first_name || "",
        lastName: d.last_name || "",
        birthDate: d.date_of_birth || "",
        age: d.age != null ? String(d.age) : "",
        email: d.email || "",
        phone: d.phone_number || "",
        isResident: d.is_resident_of_cebu ? "yes" : "no",
        lgu: d.lgu || "",
        address: d.address || "",
        profilePic: d.avatar ? `http://localhost:8000${d.avatar}` : formData.profilePic,
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
        message: "Your profile has been updated.",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save profile.";
      setNotify({ show: true, type: "info", title: "Error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Fetch initial profile
  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/user/profile/");
        const d = res.data;
        const mapped = {
          firstName: d.first_name || "",
          lastName: d.last_name || "",
          birthDate: d.date_of_birth || "",
          age: d.age != null ? String(d.age) : "",
          email: d.email || "",
          phone: d.phone_number || "",
          isResident: d.is_resident_of_cebu ? "yes" : "no",
          lgu: d.lgu || "",
          address: d.address || "",
          profilePic: d.avatar ? `http://localhost:8000${d.avatar}` : "",
          profileFile: null,
          agreed: true,
        };
        setFormData(mapped);
        setBeforeEdit(mapped);
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to load profile.";
        setNotify({ show: true, type: "info", title: "Error", message: msg });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Styles for inputs (different look when readOnly)
  const fieldBase = "rounded-md p-2";
  const fieldView = "bg-gray-100";
  const fieldEdit = "bg-white border border-black/15";
  const fieldCls = `${fieldBase} ${readOnly ? fieldView : fieldEdit}`;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/beneficiary");
  };

  return (
    <>
      <ConfirmationModal
        open={confirmOpen}
        title="Save changes to your profile?"
        desc="This will update your profile in the system."
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
            <h1 className="text-lg font-bold">Beneficiary Profile</h1>
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

        {/* Personal Details */}
        <div className="bg-white rounded-2xl shadow border border-black/10 p-5 md:p-8">
          <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

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
              <label className="text-sm">First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={onChange}
                disabled={readOnly || saving || loading}
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
                disabled={readOnly || saving || loading}
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
                disabled={readOnly || saving || loading}
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
                placeholder="ejacc@gmail.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
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
          </div>
        </div>

        {/* Residency & Address */}
        <div className="bg-white rounded-2xl shadow border border-black/10 p-5 md:p-8">
          <h2 className="text-lg font-semibold mb-4">Residency & Address</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm">Resident of Cebu (province)</label>
              <select
                name="isResident"
                value={formData.isResident}
                onChange={onChange}
                disabled={readOnly || saving || loading}
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
                disabled={readOnly || saving || loading}
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

export default Profile;
