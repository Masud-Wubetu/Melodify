import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

// Change this to your local IP address during development mapping to the backend
const BASE_URL = 'https://melodify-1-l90t.onrender.com/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: inject token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Adjust if backend uses a different header like x-auth-token
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: auto logout on 401
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
