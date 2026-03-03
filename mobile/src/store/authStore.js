import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    likedSongsIds: [],

    initializeAuth: async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                const user = JSON.parse(storedUser);
                set({
                    token: storedToken,
                    user,
                    likedSongsIds: user.likedSongs?.map(s => typeof s === 'object' ? s._id : s) || []
                });
            }
        } catch (e) {
            console.error('Failed to load auth state', e);
        }
    },

    login: async (userData, tokenData) => {
        try {
            await AsyncStorage.setItem('token', tokenData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            set({
                user: userData,
                token: tokenData,
                likedSongsIds: userData.likedSongs?.map(s => typeof s === 'object' ? s._id : s) || []
            });
        } catch (e) {
            console.error('Failed to save auth state', e);
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            set({ user: null, token: null, likedSongsIds: [] });
        } catch (e) {
            console.error('Failed to clear auth state', e);
        }
    },

    toggleLikeId: (songId) => {
        const { likedSongsIds } = get();
        const isLiked = likedSongsIds.includes(songId);
        if (isLiked) {
            set({ likedSongsIds: likedSongsIds.filter(id => id !== songId) });
        } else {
            set({ likedSongsIds: [...likedSongsIds, songId] });
        }
    },

    setLikedSongsIds: (ids) => {
        set({ likedSongsIds: ids });
    }
}));
