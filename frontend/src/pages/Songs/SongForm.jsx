import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const SongForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const defaultAlbumId = searchParams.get('album');

    const [formData, setFormData] = useState({
        title: '',
        artistId: '',
        albumId: defaultAlbumId || '',
        duration: '',
    });

    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [songFile, setSongFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMetadata();
        if (isEditing) {
            fetchSong();
        }
    }, [id]);

    useEffect(() => {
        // Filter albums when artist changes
        if (formData.artistId) {
            setFilteredAlbums(albums.filter(a => {
                const aId = typeof a.artist === 'object' ? a.artist.id : a.artist;
                return aId === formData.artistId;
            }));
        } else {
            setFilteredAlbums([]);
        }
    }, [formData.artistId, albums]);

    const fetchMetadata = async () => {
        try {
            const [artistsData, albumsData] = await Promise.all([
                apiClient.get('/artists'),
                apiClient.get('/albums')
            ]);
            setArtists(artistsData);
            setAlbums(albumsData);

            if (!isEditing && artistsData.length > 0 && !formData.artistId) {
                setFormData(prev => ({ ...prev, artistId: artistsData[0].id }));
            }
        } catch (err) {
            console.error("Failed to fetch metadata");
        }
    };

    const fetchSong = async () => {
        try {
            const data = await apiClient.get(`/songs/${id}`);
            setFormData({
                title: data.title || '',
                artistId: data.artist?.id || data.artist?.id || data.artist || '',
                albumId: data.album?.id || data.album?.id || data.album || '',
                duration: data.duration?.toString() || ''
            });
            if (data.coverImage) {
                setCoverPreview(data.coverImage);
            }
        } catch (err) {
            setError('Failed to load song data');
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSongFile(file);

            // Auto estimate duration if audio file
            const audio = new Audio(URL.createObjectURL(file));
            audio.onloadedmetadata = () => {
                if (!formData.duration && audio.duration) {
                    setFormData(prev => ({ ...prev, duration: Math.floor(audio.duration).toString() }));
                }
            };
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.artistId) {
            setError('Title and Artist are required');
            return;
        }

        if (!isEditing && !songFile) {
            setError('Audio file is required for new songs');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('artistId', formData.artistId);

            data.append('albumId', formData.albumId || '');
            if (formData.duration) {
                data.append('duration', formData.duration);
            }

            if (songFile) {
                data.append('audio', songFile);
            }

            if (coverFile) {
                data.append('cover', coverFile);
            }

            const headers = { 'Content-Type': 'multipart/form-data' };

            if (isEditing) {
                await apiClient.put(`/songs/${id}`, data, { headers });
            } else {
                await apiClient.post('/songs', data, { headers });
            }

            navigate('/songs');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save song');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">
                {isEditing ? 'Edit Song' : 'Upload New Song'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 shadow-xl">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-48 h-48 rounded-md border-4 border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden mb-4 relative group cursor-pointer shadow-xl">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Upload className="h-16 w-16 text-zinc-600" />
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                <Upload className="h-8 w-8 mb-2" />
                                <span className="text-sm font-semibold">Song Cover</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleCoverChange}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 text-center">Optional: JPEG, PNG or WEBP</p>
                    </div>

                    <div className="w-full md:w-2/3">
                        <Input
                            label="Song Title *"
                            name="title"
                            placeholder="E.g. Blank Space"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="h-14 text-lg bg-zinc-950"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <option key={artist.id} value={artist.id}>{artist.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-white">Album</label>
                        <select
                            name="albumId"
                            value={formData.albumId}
                            onChange={handleInputChange}
                            className="flex h-12 w-full rounded-md border text-white border-zinc-600 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-zinc-500 cursor-pointer disabled:opacity-50"
                            disabled={!formData.artistId}
                        >
                            <option value="">No Album (Single)</option>
                            {filteredAlbums.map(album => (
                                <option key={album.id} value={album.id}>{album.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <Input
                        label="Duration (seconds)"
                        name="duration"
                        type="number"
                        placeholder="E.g. 231"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="bg-zinc-950"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-white">Audio File {isEditing ? '(Leave blank to keep current)' : '*'}</label>
                        <div className="flex h-12 w-full items-center rounded-md border text-white border-zinc-600 bg-zinc-950 px-3 overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary hover:border-zinc-500 cursor-pointer">
                            <input
                                type="file"
                                accept="audio/mp3,audio/wav,audio/mpeg"
                                onChange={handleFileChange}
                                className="w-full text-sm text-zinc-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-zinc-800 mt-8">
                    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="px-8 shrink-0">
                        {isLoading ? 'Saving...' : 'Save Song'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SongForm;
