import apiClient from './client';

export const loginUser = async (email, password) => {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
};

export const registerUser = async (name, email, password, adminSecretCode) => {
    const response = await apiClient.post('/users/register', { name, email, password, adminSecretCode });
    return response.data;
};

export const getProfile = async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
};

export const updateProfile = async (formData) => {
    const response = await apiClient.put('/users/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const toggleLikeSong = async (id) => {
    const response = await apiClient.put(`/users/like-song/${id}`);
    return response.data;
};

export const toggleFollowArtist = async (id) => {
    const response = await apiClient.put(`/users/follow-artist/${id}`);
    return response.data;
};

export const toggleFollowPlaylist = async (id) => {
    const response = await apiClient.put(`/users/follow-playlist/${id}`);
    return response.data;
};

export const getAllUsers = async () => {
    const response = await apiClient.get('/users');
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
};

export const toggleAdminStatus = async (id, isAdmin) => {
    const response = await apiClient.put(`/users/${id}/admin`, { isAdmin });
    return response.data;
};
