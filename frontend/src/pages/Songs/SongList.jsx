import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Plus, Music, Play, Clock, Edit, Trash2 } from 'lucide-react';

const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const data = await apiClient.get('/songs');
            // Backend returns { songs, page, pages, totalSong }
            setSongs(data.songs || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this song?')) {
            try {
                await apiClient.delete(`/songs/${id}`);
                setSongs(prev => prev.filter(s => s._id !== id));
            } catch (error) {
                alert('Failed to delete song');
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Songs</h1>
                    <p className="text-zinc-400 mt-1">Browse the complete track library</p>
                </div>

                {isAdmin && (
                    <Button onClick={() => navigate('/songs/create')} className="gap-2">
                        <Plus className="h-5 w-5" /> Add Song
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : songs.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                    <Music className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Songs Found</h3>
                    <p className="text-zinc-400">There are currently no songs in the library.</p>
                </div>
            ) : (
                <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/50 overflow-hidden">
                    <div className="grid grid-cols-[16px_1fr_1fr_120px_minmax(120px,160px)] gap-4 px-6 py-3 text-sm font-semibold text-zinc-400 border-b border-zinc-800 bg-zinc-900/80">
                        <div className="text-center">#</div>
                        <div>Title</div>
                        <div className="hidden md:block">Album</div>
                        <div className="text-right">Plays</div>
                        <div className="flex justify-end pr-8"><Clock className="h-4 w-4" /></div>
                    </div>

                    <div className="flex flex-col">
                        {songs.map((song, index) => (
                            <div
                                key={song._id}
                                onClick={() => navigate(`/songs/${song._id}`)}
                                className="group grid grid-cols-[16px_1fr_1fr_120px_minmax(120px,160px)] gap-4 px-6 py-4 hover:bg-zinc-800/50 transition-colors items-center cursor-pointer border-b border-zinc-900/50 last:border-0 relative"
                            >
                                <div className="text-center text-zinc-400 text-sm w-4 flex justify-center group-hover:hidden">
                                    {index + 1}
                                </div>
                                <div className="text-center hidden group-hover:flex justify-center text-white">
                                    <Play className="h-4 w-4 fill-white" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {song.album?.imageUrl ? (
                                            <img src={song.album.imageUrl.startsWith('http') ? song.album.imageUrl : `http://localhost:5000${song.album.imageUrl}`} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <Music className="h-5 w-5 text-zinc-500" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium line-clamp-1">{song.title}</div>
                                        <div className="text-zinc-400 text-sm line-clamp-1 group-hover:text-white transition-colors">
                                            {typeof song.artist === 'object' ? song.artist?.name : 'Unknown Artist'}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block text-zinc-400 text-sm line-clamp-1 hover:underline cursor-pointer" onClick={(e) => {
                                    if (song.album?._id) {
                                        e.stopPropagation();
                                        navigate(`/albums/${song.album._id}`);
                                    }
                                }}>
                                    {typeof song.album === 'object' ? song.album?.title : 'Unknown Album'}
                                </div>

                                <div className="text-sm text-zinc-400 text-right">{song.playCount || 0}</div>

                                <div className="flex justify-end items-center pr-2 text-sm text-zinc-400">
                                    {formatDuration(song.duration)}

                                    {isAdmin && (
                                        <div className="absolute right-6 opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/songs/edit/${song._id}`); }}
                                                className="text-zinc-400 hover:text-white transition-colors p-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, song._id)}
                                                className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SongList;
