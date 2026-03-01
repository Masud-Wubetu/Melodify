import apiClient from './client';

export const getPlaylists = async (params = {}) => {
    const response = await apiClient.get('/playlists', { params });
    return response.data;
};

export const getFeaturedPlaylists = async () => {
    const response = await apiClient.get('/playlists/featured');
    return response.data;
};

export const getUserPlaylists = async () => {
    const response = await apiClient.get('/playlists/user/me');
    return response.data;
};

export const getPlaylistById = async (id) => {
    const response = await apiClient.get(`/playlists/${id}`);
    return response.data;
};

export const createPlaylist = async (formData) => {
    const response = await apiClient.post('/playlists', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updatePlaylist = async (id, formData) => {
    const response = await apiClient.put(`/playlists/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deletePlaylist = async (id) => {
    const response = await apiClient.delete(`/playlists/${id}`);
    return response.data;
};

export const addSongsToPlaylist = async (id, songIds) => {
    const response = await apiClient.put(`/playlists/${id}/add-songs`, { songIds });
    return response.data;
};

export const removeSongFromPlaylist = async (id, songId) => {
    const response = await apiClient.put(`/playlists/${id}/rmove-song/${songId}`);
    return response.data;
};
