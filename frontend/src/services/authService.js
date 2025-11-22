import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const loginAPI = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/registration/login/`, {
  // const response = await axios.post(`http://localhost:8000/user/login/`, {
    email,
    password,
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};

export const getAccessToken = () => localStorage.getItem('access');
export const getRefreshToken = () => localStorage.getItem('refresh');

export const resetPasswordAPI = async (email, old_password, new_password) => {
  const response = await axios.post(`${API_URL}/user/reset-password/`, {
    email,
    old_password,
    new_password
  }, {
    headers: {
      "Authorization": "Bearer " + getAccessToken(),
    }
  });
  return response.data;
};
