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
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: auto logout on 401
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API Success] ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.log(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.message);
        if (error.response) {
            console.log(`[API Error Data]`, error.response.data);
        }
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
