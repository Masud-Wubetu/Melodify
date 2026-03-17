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
                    // Backend returns: { _id, name, email, isAdmin, profilePicture, token }
                    const response = await apiClient.post('/users/login', { email, password });
                    const userData = {
                        _id: response._id,
                        name: response.name,
                        username: response.name, // alias so UI that reads .username works too
                        email: response.email,
                        isAdmin: response.isAdmin,
                        profilePicture: response.profilePicture,
                        role: response.isAdmin ? 'admin' : 'user',
                    };
                    set({
                        user: userData,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    localStorage.setItem('token', response.token);
                    return true;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || 'Invalid email or password',
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
