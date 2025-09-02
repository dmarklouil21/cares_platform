import api from './axiosInstance';

// Submit Pre-cancerous Meds request
// Payload shape must match backend serializer fields
export const submitPreCancerousMeds = async (payload) => {
  const res = await api.post('/beneficiary/precancerous-meds/submit/', payload);
  return res.data;
};

// List current user's Pre-cancerous Meds requests
export const listPreCancerousMeds = async () => {
  const res = await api.get('/beneficiary/precancerous-meds/list/');
  return res.data;
};

// Get details of a single Pre-cancerous Meds request
export const getPreCancerousMedsDetail = async (id) => {
  const res = await api.get(`/beneficiary/precancerous-meds/${id}/`);
  return res.data;
};

// Cancel a Pre-cancerous Meds request
export const cancelPreCancerousMeds = async (id) => {
  const res = await api.post(`/beneficiary/precancerous-meds/cancel/${id}/`);
  return res.data;
};

// ------------------------------
// Admin: Pre-Cancerous Meds APIs
// ------------------------------
export const adminListPreCancerousMeds = async (params = {}) => {
  const res = await api.get('/cancer-screening/precancerous/admin/list/', { params });
  return res.data;
};

export const adminGetPreCancerousMedsDetail = async (id) => {
  const res = await api.get(`/cancer-screening/precancerous/admin/detail/${id}/`);
  return res.data;
};

export const adminSetReleaseDate = async (id, release_date_of_meds) => {
  const res = await api.patch(`/cancer-screening/precancerous/admin/set-release-date/${id}/`, { release_date_of_meds });
  return res.data;
};

export const adminVerifyPreCancerousMeds = async (id, payload = {}) => {
  // payload may include { release_date_of_meds }
  const res = await api.patch(`/cancer-screening/precancerous/admin/verify/${id}/`, payload);
  return res.data;
};

export const adminRejectPreCancerousMeds = async (id, remarks = '') => {
  const res = await api.patch(`/cancer-screening/precancerous/admin/reject/${id}/`, { status: 'Rejected', remarks });
  return res.data;
};

// Mark a verified request as Done
export const adminDonePreCancerousMeds = async (id) => {
  const res = await api.patch(`/cancer-screening/precancerous/admin/done/${id}/`);
  return res.data;
};
