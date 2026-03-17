import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ListMusic, Upload } from 'lucide-react';

const PlaylistForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            fetchPlaylist();
        }
    }, [id]);

    const fetchPlaylist = async () => {
        try {
            const data = await apiClient.get(`/playlists/${id}`);
            setFormData({
                name: data.name || '',
                description: data.description || ''
            });
            if (data.imageUrl) {
                setImagePreview(data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:5000${data.imageUrl}`);
            }
        } catch (err) {
            setError('Failed to load playlist data');
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
        if (!formData.name) {
            setError('Playlist name is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);

            if (imageFile) {
                data.append('image', imageFile);
            }

            const headers = { 'Content-Type': 'multipart/form-data' };

            if (isEditing) {
                await apiClient.put(`/playlists/${id}`, data, { headers });
            } else {
                await apiClient.post('/playlists', data, { headers });
            }

            // Navigate back to the specific playlist if editing, else go to list
            navigate(isEditing ? `/playlists/${id}` : '/playlists');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save playlist');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">
                {isEditing ? 'Edit Playlist Details' : 'Create New Playlist'}
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
                                <ListMusic className="h-16 w-16 text-zinc-600" />
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                <Upload className="h-8 w-8 mb-2" />
                                <span className="text-sm font-semibold">Choose Cover</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 text-center">JPEG, PNG or WEBP (Max 5MB)</p>
                    </div>

                    <div className="w-full md:w-2/3 space-y-6">
                        <Input
                            label="Playlist Name *"
                            name="name"
                            placeholder="E.g. Summer Vibes 2026"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="h-14 text-lg bg-zinc-950"
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white">Description</label>
                            <textarea
                                name="description"
                                placeholder="Give your playlist a catchy description..."
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full min-h-32 rounded-md border border-zinc-700 bg-zinc-950 p-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-zinc-500 resize-y"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
                    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="px-8 shrink-0">
                        {isLoading ? 'Saving...' : 'Save Playlist'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PlaylistForm;
