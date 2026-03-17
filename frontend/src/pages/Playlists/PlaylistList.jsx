import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Plus, ListMusic, ChevronRight, Edit, Trash2 } from 'lucide-react';

const PlaylistList = () => {
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const data = await apiClient.get('/playlists');
            // Backend might return all playlists or only user's based on implementation.
            // Evolving frontend safely:
            setPlaylists(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            try {
                await apiClient.delete(`/playlists/${id}`);
                setPlaylists(prev => prev.filter(p => p._id !== id));
            } catch (error) {
                alert('Failed to delete playlist');
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Your Playlists</h1>
                    <p className="text-zinc-400 mt-1">Curate your perfect sound</p>
                </div>

                <Button onClick={() => navigate('/playlists/create')} className="gap-2">
                    <Plus className="h-5 w-5" /> New Playlist
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : playlists.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                    <ListMusic className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Playlists Created</h3>
                    <p className="text-zinc-400 mb-6">Create your first playlist and start adding songs.</p>
                    <Button onClick={() => navigate('/playlists/create')} variant="outline">
                        Create Playlist
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {playlists.map((playlist) => {
                        // Validate if the currently logged-in user owns this playlist.
                        const isOwner = playlist.user?._id === user?._id || playlist.user === user?._id || user?.role === 'admin';

                        return (
                            <Link key={playlist._id} to={`/playlists/${playlist._id}`} className="group relative block">
                                <Card className="h-full bg-zinc-900/40 hover:bg-zinc-800/80 transition-all duration-300 border-transparent hover:border-zinc-700 cursor-pointer overflow-hidden">
                                    <CardContent className="p-4 flex flex-col items-center">
                                        <div className="w-full aspect-square mb-4 overflow-hidden rounded-md shadow-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center relative group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all">
                                            {playlist.imageUrl ? (
                                                <img src={playlist.imageUrl.startsWith('http') ? playlist.imageUrl : `http://localhost:5000${playlist.imageUrl}`} alt={playlist.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ListMusic className="h-16 w-16 text-zinc-600" />
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-black translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                                                    <ChevronRight className="h-6 w-6 ml-0.5" />
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-left text-white line-clamp-1 w-full">{playlist.name}</h3>
                                        <p className="text-sm text-zinc-400 text-left line-clamp-1 w-full mt-1">
                                            {playlist.description || `By ${user?.username}`}
                                        </p>
                                    </CardContent>
                                </Card>

                                {isOwner && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                        <button
                                            onClick={(e) => { e.preventDefault(); navigate(`/playlists/edit/${playlist._id}`); }}
                                            className="p-2 bg-zinc-900/80 hover:bg-zinc-700 text-white rounded-full backdrop-blur transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, playlist._id)}
                                            className="p-2 bg-zinc-900/80 hover:bg-red-500 text-white rounded-full backdrop-blur transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default PlaylistList;
