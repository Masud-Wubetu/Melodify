import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mic2, Upload } from 'lucide-react';

const ArtistForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        bio: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            fetchArtist();
        }
    }, [id]);

    const fetchArtist = async () => {
        try {
            const data = await apiClient.get(`/artists/${id}`);
            setFormData({ name: data.name || '', bio: data.bio || '' });
            if (data.imageUrl) {
                setImagePreview(data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:5000${data.imageUrl}`);
            }
        } catch (err) {
            setError('Failed to load artist data');
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
            setError('Artist name is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('bio', formData.bio);
            if (imageFile) {
                data.append('image', imageFile);
            }

            const headers = { 'Content-Type': 'multipart/form-data' };

            if (isEditing) {
                await apiClient.put(`/artists/${id}`, data, { headers });
            } else {
                await apiClient.post('/artists', data, { headers });
            }

            navigate('/artists');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save artist');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">
                {isEditing ? 'Edit Artist' : 'Add New Artist'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 shadow-xl">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-48 h-48 rounded-full border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden mb-4 relative group cursor-pointer shadow-xl">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Mic2 className="h-16 w-16 text-zinc-600" />
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                <Upload className="h-8 w-8 mb-2" />
                                <span className="text-sm font-semibold">Choose Image</span>
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
                            label="Artist Name *"
                            name="name"
                            placeholder="E.g. Taylor Swift"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="h-14 text-lg bg-zinc-950"
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white">Biography</label>
                            <textarea
                                name="bio"
                                placeholder="Tell us about the artist..."
                                value={formData.bio}
                                onChange={handleInputChange}
                                className="w-full min-h-32 rounded-md border border-zinc-700 bg-zinc-950 p-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-zinc-500 resize-y"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
                    <Button type="button" variant="ghost" onClick={() => navigate('/artists')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="px-8 shrink-0">
                        {isLoading ? 'Saving...' : 'Save Artist'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ArtistForm;
