import apiClient from './client';

export const getArtists = async (params = {}) => {
    const response = await apiClient.get('/artists', { params });
    return response.data;
};

export const getTopArtists = async (limit = 6) => {
    const response = await apiClient.get(`/artists?limit=${limit}`);
    return response.data;
};

export const getArtistById = async (id) => {
    const response = await apiClient.get(`/artists/${id}`);
    return response.data;
};

export const getArtistTopSongs = async (id, limit = 5) => {
    const response = await apiClient.get(`/artists/${id}/top-songs`, { params: { limit } });
    return response.data;
};

export const createArtist = async (formData) => {
    const response = await apiClient.post('/artists', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateArtist = async (id, formData) => {
    const response = await apiClient.put(`/artists/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteArtist = async (id) => {
    const response = await apiClient.delete(`/artists/${id}`);
    return response.data;
};
