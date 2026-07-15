import axios from 'axios';

// Configure Axios client pointing to our backend port
const api = axios.create({
  baseURL: 'https://careervault-g8lb.onrender.com/api',
  withCredentials: true // Automatically include cookies in requests
});

export default api;
