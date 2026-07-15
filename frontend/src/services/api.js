import axios from 'axios';

// Configure Axios client pointing to our backend port
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // Automatically include cookies in requests
});

export default api;
