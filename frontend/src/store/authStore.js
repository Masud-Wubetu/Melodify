import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    // Send request down to the actual API
                    const response = await apiClient.post('/users/login', { email, password });
                    set({
                        user: response.user || { id: response._id, ...response }, // adapt to actual response
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    localStorage.setItem('token', response.token);
                    return true;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false
                    });
                    return false;
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
