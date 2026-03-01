import apiClient from './client';

export const getSongs = async (params = {}) => {
    const response = await apiClient.get('/songs', { params });
    return response.data;
};

export const getNewReleases = async (limit = 8) => {
    const response = await apiClient.get('/songs/new-releases', { params: { limit } });
    return response.data;
};

export const getSongById = async (id) => {
    const response = await apiClient.get(`/songs/${id}`);
    return response.data;
};

export const createSong = async (formData) => {
    const response = await apiClient.post('/songs', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateSong = async (id, formData) => {
    const response = await apiClient.put(`/songs/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteSong = async (id) => {
    const response = await apiClient.delete(`/songs/${id}`);
    return response.data;
};
