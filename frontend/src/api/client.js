import axios from 'axios';

// Create a generic Axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Note: Make sure backend runs on 5000 or adjust port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        // We will retrieve the token from localStorage or Zustand state
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

// Response interceptor for generic error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
