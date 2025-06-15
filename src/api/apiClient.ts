import axios from 'axios';
import { BACKEND_URL } from '@env';

const API_BASE_URL = BACKEND_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request interceptors (e.g., for adding auth tokens)
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Optional: Add response interceptors (e.g., for error handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., redirect to login
      console.error('Unauthorized access.');
      // window.location.href = '/login'; // Example redirection
    }
    return Promise.reject(error);
  }
);

export default apiClient;