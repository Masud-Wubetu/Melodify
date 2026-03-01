import apiClient from './client';

export const getAlbums = async (params = {}) => {
    const response = await apiClient.get('/albums', { params });
    return response.data;
};

export const getAlbumById = async (id) => {
    const response = await apiClient.get(`/albums/${id}`);
    return response.data;
};

export const createAlbum = async (formData) => {
    const response = await apiClient.post('/albums', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateAlbum = async (id, formData) => {
    const response = await apiClient.put(`/albums/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteAlbum = async (id) => {
    const response = await apiClient.delete(`/albums/${id}`);
    return response.data;
};

export const addSongsToAlbum = async (albumId, songIds) => {
    const response = await apiClient.put(`/albums/${albumId}/add-songs`, { songIds });
    return response.data;
};

export const getNewReleases = async (limit = 8) => {
    const response = await apiClient.get('/albums/new-releases', { params: { limit } });
    return response.data;
};
