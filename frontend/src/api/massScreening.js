import api from './axiosInstance';

// Create a Mass Screening Request (RHU)
// Expects a FormData with fields: title, venue, date, beneficiaries, description, support_need, attachments[]
export const createMassScreening = async (formData) => {
  const res = await api.post('/cancer-screening/mass-screening/rhu/create/', formData, {
    headers: {
      // Let axios set the correct boundary automatically; specifying type is still okay
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// List current RHU's own Mass Screening Requests
export const listMyMassScreenings = async (params = {}) => {
  const res = await api.get('/cancer-screening/mass-screening/rhu/list/', { params });
  return res.data;
};

// Get detail of one of current RHU's Mass Screening Requests
export const getMyMassScreeningDetail = async (id) => {
  const res = await api.get(`/cancer-screening/mass-screening/rhu/detail/${id}/`);
  return res.data;
};

// Delete one of current RHU's Mass Screening Requests
export const deleteMyMassScreening = async (id) => {
  const res = await api.delete(`/cancer-screening/mass-screening/rhu/delete/${id}/`);
  return res.data;
};

// Get attendance entries for a Mass Screening Request (RHU-owned)
export const getMassScreeningAttendance = async (requestId) => {
  const res = await api.get(`/cancer-screening/mass-screening/rhu/${requestId}/attendance/`);
  return res.data; // [{ id, name, result, created_at }]
};

// Save attendance entries (replace existing) for a Mass Screening Request (RHU-owned)
export const saveMassScreeningAttendance = async (requestId, entries) => {
  const payload = { entries };
  const res = await api.put(`/cancer-screening/mass-screening/rhu/${requestId}/attendance/`, payload);
  return res.data; // saved entries
};

// Update fields of a Mass Screening Request (RHU-owned)
export const updateMyMassScreening = async (id, payload) => {
  // payload may include: title, date, beneficiaries, description, support_need
  const res = await api.patch(`/cancer-screening/mass-screening/rhu/update/${id}/`, payload);
  return res.data;
};

// Add attachments to a Mass Screening Request (multipart)
export const addMassScreeningAttachments = async (id, files) => {
  const fd = new FormData();
  files.forEach((file) => fd.append('attachments', file));
  const res = await api.post(`/cancer-screening/mass-screening/rhu/${id}/attachments/add/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { attachments: [{ id, file, uploaded_at } ...] }
};

// Delete a single attachment by its ID
export const deleteMassScreeningAttachment = async (attachmentId) => {
  const res = await api.delete(`/cancer-screening/mass-screening/rhu/attachments/delete/${attachmentId}/`);
  return res.data;
};

// ---------------- Admin APIs ----------------
// List all Mass Screening Requests (admin)
export const listAdminMassScreenings = async (params = {}) => {
  const res = await api.get('/cancer-screening/mass-screening/admin/list/', { params });
  return res.data;
};

// Get detail (admin)
export const getAdminMassScreeningDetail = async (id) => {
  const res = await api.get(`/cancer-screening/mass-screening/admin/detail/${id}/`);
  return res.data;
};

// Set status (verify | reject | done) (admin)
export const setAdminMassScreeningStatus = async (id, action) => {
  const res = await api.post(`/cancer-screening/mass-screening/admin/status/${id}/${action}/`);
  return res.data;
};

// Get attendance (admin)
export const getAdminMassScreeningAttendance = async (requestId) => {
  const res = await api.get(`/cancer-screening/mass-screening/admin/${requestId}/attendance/`);
  return res.data; // [{ id, name, result, created_at }]
};
