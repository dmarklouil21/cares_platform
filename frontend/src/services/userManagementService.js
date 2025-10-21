import api from '../api/axiosInstance';

const BASE_URL = '/api/user-management/users/';

export const fetchUsers = async () => {
  const response = await api.get(BASE_URL);
  return response.data;
};

export const fetchUser = async (id) => {
  const response = await api.get(`${BASE_URL}${id}/`);
  return response.data;
};

export const addUser = async (userData) => {
  const response = await api.post(BASE_URL, userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`${BASE_URL}${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`${BASE_URL}${id}/`);
  return response.data;
};

export const checkEmailExists = async ({ email, excludeId } = {}) => {
  const params = {};
  if (email) params.email = email;
  if (excludeId != null) params.exclude_id = excludeId;
  const res = await api.get('/api/user-management/email-check/', { params });
  return res.data; // { exists: boolean }
};