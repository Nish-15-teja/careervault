import axios from 'axios';

// Configure Axios client pointing to our backend port
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://careervault-g8lb.onrender.com/api',
  withCredentials: true // Automatically include cookies in requests
});

// Axios Request Interceptor: Automatically append Authorization Bearer Token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
