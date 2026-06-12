import axios from 'axios';
import { logout } from '../store/authSlice';

// Create Axios instance
const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptor for JWT
let store;
export const injectStore = _store => {
  store = _store;
};

axiosClient.interceptors.request.use(
  (config) => {
    // If token exists, add to header
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle Token Expiration globally
    if (error.response && error.response.status === 401) {
      if (store) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
