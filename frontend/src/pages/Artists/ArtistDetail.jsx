import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Play, Pause, Mic2, Edit, Trash2 } from 'lucide-react';

const ArtistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const [artist, setArtist] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchArtistDetails();
    }, [id]);

    const fetchArtistDetails = async () => {
        try {
            const artistData = await apiClient.get(`/artists/${id}`);
            setArtist(artistData);

            // Optionally fetch albums for this artist if the backend supports it
            // const albumsData = await apiClient.get(`/albums?artist=${id}`);
            // setAlbums(albumsData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!artist) {
        return <div className="p-8 text-center text-zinc-400">Artist not found.</div>;
    }

    return (
        <div className="relative">
            {/* Header Banner */}
            <div className="h-80 w-full relative flex items-end p-8">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/60 to-zinc-950/90 z-10" />
                {artist.imageUrl && (
                    <img
                        src={artist.imageUrl.startsWith('http') ? artist.imageUrl : `http://localhost:5000${artist.imageUrl}`}
                        alt={artist.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-50 filter blur-sm"
                    />
                )}

                <div className="relative z-20 flex items-end gap-6 w-full">
                    {artist.imageUrl ? (
                        <img
                            src={artist.imageUrl.startsWith('http') ? artist.imageUrl : `http://localhost:5000${artist.imageUrl}`}
                            alt={artist.name}
                            className="w-48 h-48 rounded-full shadow-2xl object-cover border-4 border-zinc-900"
                        />
                    ) : (
                        <div className="w-48 h-48 rounded-full bg-zinc-800 shadow-2xl flex items-center justify-center border-4 border-zinc-900">
                            <Mic2 className="h-20 w-20 text-zinc-500" />
                        </div>
                    )}

                    <div className="flex-1 pb-4">
                        <span className="text-sm font-bold uppercase tracking-widest mb-2 block text-zinc-300">Artist</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter">
                            {artist.name}
                        </h1>
                        <p className="text-zinc-300 max-w-2xl line-clamp-2">
                            {artist.bio || "No biography available."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="p-8 pb-4 flex items-center gap-4 bg-gradient-to-b from-zinc-950/90 to-transparent">
                <button className="h-14 w-14 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-black shadow-lg hover:scale-105 transition-all">
                    <Play className="h-6 w-6 ml-1" fill="currentColor" />
                </button>

                {isAdmin && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/artists/edit/${artist._id}`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Artist
                        </Button>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="px-8 pb-12">
                <h2 className="text-2xl font-bold mb-6">Popular Details</h2>
                <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800/50">
                    <p className="text-zinc-300 mb-4 whitespace-pre-line leading-relaxed">
                        {artist.bio || "This artist hasn't added a biography yet. Check back later for more updates."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ArtistDetail;
