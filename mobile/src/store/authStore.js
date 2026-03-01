import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,

    initializeAuth: async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                set({ token: storedToken, user: JSON.parse(storedUser) });
            }
        } catch (e) {
            console.error('Failed to load auth state', e);
        }
    },

    login: async (userData, tokenData) => {
        try {
            await AsyncStorage.setItem('token', tokenData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, token: tokenData });
        } catch (e) {
            console.error('Failed to save auth state', e);
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            set({ user: null, token: null });
        } catch (e) {
            console.error('Failed to clear auth state', e);
        }
    },
}));
