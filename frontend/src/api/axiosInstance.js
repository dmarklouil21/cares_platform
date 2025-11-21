import axios from 'axios';
import { getAccessToken, getRefreshToken, logout } from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const instance = axios.create({
  baseURL: API_URL,
});

// Request interceptor: add access token
instance.interceptors.request.use(
  config => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: refresh token on 401
instance.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = getRefreshToken();
        const response = await axios.post(`${API_URL}/user/auth/token/refresh/`, { refresh });

        localStorage.setItem('access', response.data.access);
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return instance(originalRequest);
      } catch (err) {
        logout();
        window.location.href = '/login'; // or navigate('/login') if using react-router
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;