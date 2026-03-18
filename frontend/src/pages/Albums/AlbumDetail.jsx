import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { Button } from '../../components/ui/Button';
import { Play, Pause, Disc3, Clock, MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react';

const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const AlbumDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const [album, setAlbum] = useState(null);
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { setSong, currentSong, isPlaying, togglePlay } = usePlayerStore();

    useEffect(() => {
        fetchAlbumDetails();
    }, [id]);

    const fetchAlbumDetails = async () => {
        try {
            const albumData = await apiClient.get(`/albums/${id}`);
            setAlbum(albumData);

            // Fetch associated songs for this album
            try {
                const songsData = await apiClient.get(`/songs?album=${id}`);
                // Handle potentially different backend return formats
                setSongs(Array.isArray(songsData) ? songsData : (songsData.songs || []));
            } catch (err) {
                console.error("Could not fetch songs for album", err);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSong = () => {
        navigate(`/songs/create?album=${id}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!album) {
        return <div className="p-8 text-center text-zinc-400">Album not found.</div>;
    }

    const artistName = typeof album.artist === 'object' ? album.artist?.name : 'Unknown Artist';
    const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0);

    return (
        <div className="relative">
            {/* Header Banner */}
            <div className="h-80 w-full relative flex items-end p-8 bg-gradient-to-b from-zinc-800 to-zinc-950/90">
                <div className="relative z-20 flex items-end gap-6 w-full">
                    {album.coverImage ? (
                        <img
                            src={album.coverImage.startsWith('http') ? album.coverImage : `http://localhost:5000${album.coverImage}`}
                            alt={album.title}
                            className="w-56 h-56 shadow-2xl object-cover rounded-md"
                        />
                    ) : (
                        <div className="w-56 h-56 bg-zinc-800 shadow-2xl flex items-center justify-center rounded-md">
                            <Disc3 className="h-24 w-24 text-zinc-500" />
                        </div>
                    )}

                    <div className="flex-1 pb-2">
                        <span className="text-sm font-bold tracking-widest mb-2 block text-zinc-300">Album</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter">
                            {album.title}
                        </h1>
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                            <span className="text-white bg-zinc-800/80 px-2 py-0.5 rounded-full text-xs">
                                {artistName}
                            </span>
                            {album.releaseYear && <span>• {album.releaseYear}</span>}
                            <span>• {songs.length} songs</span>
                            {totalDuration > 0 && <span>• {Math.floor(totalDuration / 60)} min</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="p-8 pb-6 flex items-center gap-6 bg-gradient-to-b from-zinc-950/90 to-transparent">
                <button
                    className="h-16 w-16 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-black shadow-[0_8px_8px_rgba(0,0,0,0.3)] hover:scale-105 transition-all"
                    onClick={() => {
                        if (songs.length > 0) {
                            if (currentSong?.albumId === id || currentSong?.album?.id === id) {
                                togglePlay();
                            } else {
                                setSong(songs[0], songs);
                            }
                        }
                    }}
                >
                    {isPlaying && (currentSong?.albumId === id || currentSong?.album?.id === id) ? (
                        <Pause className="h-7 w-7" fill="currentColor" />
                    ) : (
                        <Play className="h-7 w-7 ml-1" fill="currentColor" />
                    )}
                </button>

                {isAdmin && (
                    <div className="flex gap-4 items-center">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/albums/edit/${album.id}`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Album
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCreateSong}>
                            <Plus className="h-4 w-4 mr-2" /> Add Song
                        </Button>
                    </div>
                )}
            </div>

            {/* Tracklist List View */}
            <div className="px-8 pb-12">
                <div className="grid grid-cols-[16px_1fr_120px_minmax(120px,200px)] gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-zinc-800 mb-4 sticky top-[64px] bg-zinc-950/90 backdrop-blur z-10">
                    <div className="text-center">#</div>
                    <div>Title</div>
                    <div className="text-right">Plays</div>
                    <div className="flex justify-end"><Clock className="h-4 w-4" /></div>
                </div>

                {songs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        No songs have been added to this album yet.
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {songs.map((song, index) => (
                            <div
                                key={song.id}
                                onClick={() => setSong(song, songs)}
                                className={`group grid grid-cols-[16px_1fr_120px_minmax(120px,200px)] gap-4 px-4 py-3 rounded-md hover:bg-zinc-800/50 transition-colors items-center cursor-pointer ${currentSong?.id === song.id ? 'bg-zinc-800/40 text-primary' : ''}`}
                            >
                                <div className="text-center text-zinc-400 text-sm group-hover:hidden">{index + 1}</div>
                                <div className="text-center hidden group-hover:flex justify-center text-white">
                                    {currentSong?.id === song.id && isPlaying ? (
                                        <div className="flex gap-0.5 h-3 items-end">
                                            <div className="w-1 bg-primary animate-bounce-short"></div>
                                            <div className="w-1 bg-primary [animation-delay:0.2s] animate-bounce-short"></div>
                                            <div className="w-1 bg-primary [animation-delay:0.4s] animate-bounce-short"></div>
                                        </div>
                                    ) : (
                                        <Play className="h-4 w-4 fill-white" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-white font-medium line-clamp-1">{song.title}</div>
                                    <div className="text-zinc-400 text-sm line-clamp-1 group-hover:text-white transition-colors">{artistName}</div>
                                </div>
                                <div className="text-sm text-zinc-400 text-right">{song.plays || 0}</div>
                                <div className="flex justify-end pr-2 text-sm text-zinc-400">{formatDuration(song.duration)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlbumDetail;
