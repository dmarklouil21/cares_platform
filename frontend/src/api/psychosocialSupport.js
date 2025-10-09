import api from './axiosInstance';

// Admin: Create a new psychosocial support activity
export const adminCreatePsychosocialActivity = async (formData) => {
  const res = await api.post('/psychosocial-support/admin/activities/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Admin: List activities
export const adminListPsychosocialActivities = async (params = {}) => {
  const res = await api.get('/psychosocial-support/admin/activities/', { params });
  return res.data;
};

// Admin: Get single activity
export const adminGetPsychosocialActivity = async (id) => {
  const res = await api.get(`/psychosocial-support/admin/activities/${id}/`);
  return res.data;
};

// Admin: Update activity (PATCH)
export const adminUpdatePsychosocialActivity = async (id, formData) => {
  const res = await api.patch(`/psychosocial-support/admin/activities/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Admin: Delete activity
export const adminDeletePsychosocialActivity = async (id) => {
  const res = await api.delete(`/psychosocial-support/admin/activities/${id}/`);
  return res.data;
};

// Admin: Recent patient name suggestions
export const adminPatientSuggestions = async (q = '') => {
  const res = await api.get('/psychosocial-support/admin/patient-suggestions/', { params: { q } });
  return res.data; // array of strings
};

// Public/RHU/Beneficiary: List activities (read-only)
export const publicListPsychosocialActivities = async () => {
  const res = await api.get('/psychosocial-support/public/activities/');
  return res.data;
};
