import axios from 'axios';

const API_URL = "http://localhost:8000";

export const loginAPI = async (email, password) => {
  const response = await axios.post(`${API_URL}/user/login/`, {
    username: email,
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
