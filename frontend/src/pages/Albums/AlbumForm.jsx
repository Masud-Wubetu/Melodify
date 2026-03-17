import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Disc3, Upload } from 'lucide-react';

const AlbumForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        artistId: '',
        releaseYear: new Date().getFullYear().toString()
    });
    const [artists, setArtists] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchArtists();
        if (isEditing) {
            fetchAlbum();
        }
    }, [id]);

    const fetchArtists = async () => {
        try {
            const data = await apiClient.get('/artists');
            setArtists(data);
            if (!isEditing && data.length > 0) {
                setFormData(prev => ({ ...prev, artistId: data[0]._id }));
            }
        } catch (err) {
            console.error("Failed to fetch artists");
        }
    };

    const fetchAlbum = async () => {
        try {
            const data = await apiClient.get(`/albums/${id}`);
            setFormData({
                title: data.title || '',
                artistId: typeof data.artist === 'object' ? data.artist._id : (data.artist || ''),
                releaseYear: data.releaseYear?.toString() || ''
            });
            if (data.imageUrl) {
                setImagePreview(data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:5000${data.imageUrl}`);
            }
        } catch (err) {
            setError('Failed to load album data');
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.artistId) {
            setError('Title and Artist are required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('artist', formData.artistId);
            if (formData.releaseYear) {
                data.append('releaseYear', formData.releaseYear);
            }

            if (imageFile) {
                data.append('image', imageFile);
            }

            const headers = { 'Content-Type': 'multipart/form-data' };

            if (isEditing) {
                await apiClient.put(`/albums/${id}`, data, { headers });
            } else {
                await apiClient.post('/albums', data, { headers });
            }

            navigate('/albums');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save album');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">
                {isEditing ? 'Edit Album' : 'Create New Album'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 shadow-xl">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-48 h-48 rounded-md border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden mb-4 relative group cursor-pointer shadow-xl">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Disc3 className="h-16 w-16 text-zinc-600" />
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                <Upload className="h-8 w-8 mb-2" />
                                <span className="text-sm font-semibold">Album Cover</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-6">
                        <Input
                            label="Album Title *"
                            name="title"
                            placeholder="E.g. 1989 (Taylor's Version)"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="h-14 text-lg bg-zinc-950"
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white">Artist *</label>
                            <select
                                name="artistId"
                                value={formData.artistId}
                                onChange={handleInputChange}
                                className="flex h-12 w-full rounded-md border text-white border-zinc-600 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-zinc-500 cursor-pointer"
                            >
                                <option value="" disabled>Select an artist</option>
                                {artists.map(artist => (
                                    <option key={artist._id} value={artist._id}>{artist.name}</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Release Year"
                            name="releaseYear"
                            type="number"
                            placeholder="E.g. 2023"
                            value={formData.releaseYear}
                            onChange={handleInputChange}
                            className="bg-zinc-950"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
                    <Button type="button" variant="ghost" onClick={() => navigate('/albums')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="px-8 shrink-0">
                        {isLoading ? 'Saving...' : 'Save Album'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AlbumForm;
