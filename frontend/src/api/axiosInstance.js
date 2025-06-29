import axios from 'axios';
import { getAccessToken, getRefreshToken, logout } from '../services/authService';

const instance = axios.create({
  baseURL: 'http://localhost:8000',
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
        const response = await axios.post('http://localhost:8000/user/auth/token/refresh/', { refresh });

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


// Sample usage of the API instance

/* import api from '../api/axiosInstance';

const fetchProfile = async () => {
  const res = await api.get('/api/user/profile/');
  console.log("User profile:", res.data);
};
 */