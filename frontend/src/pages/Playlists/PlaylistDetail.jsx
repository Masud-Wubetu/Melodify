import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { Button } from '../../components/ui/Button';
import { Play, ListMusic, Clock, Edit, Trash2, Plus, Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';

const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const PlaylistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [playlist, setPlaylist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingSong, setIsAddingSong] = useState(false);
    const [availableSongs, setAvailableSongs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { setSong, currentSong, isPlaying, togglePlay } = usePlayerStore();

    // Validate owner
    const isOwner = playlist?.user?.id === user?.id || playlist?.user === user?.id || user?.role === 'admin';

    useEffect(() => {
        fetchPlaylistDetails();
    }, [id]);

    const fetchPlaylistDetails = async () => {
        try {
            const data = await apiClient.get(`/playlists/${id}`);
            setPlaylist(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableSongs = async () => {
        try {
            const allSongs = await apiClient.get('/songs');

            // Map current playlist song IDs to exclude them from the list
            const playlistSongIds = playlist.songs.map(s => typeof s === 'object' ? s.id : s);
            const filtered = allSongs.filter(s => !playlistSongIds.includes(s.id));

            setAvailableSongs(filtered);
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleAddSong = () => {
        if (!isAddingSong && availableSongs.length === 0) {
            fetchAvailableSongs();
        }
        setIsAddingSong(!isAddingSong);
    };

    const handleAddSong = async (songId) => {
        try {
            await apiClient.post(`/playlists/${id}/songs`, { songId });
            await fetchPlaylistDetails(); // Refresh
            setAvailableSongs(prev => prev.filter(s => s.id !== songId));
        } catch (error) {
            alert('Failed to add song to playlist');
        }
    };

    const handleRemoveSong = async (e, songId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await apiClient.delete(`/playlists/${id}/songs/${songId}`);
            await fetchPlaylistDetails(); // Refresh
        } catch (error) {
            alert('Failed to remove song');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!playlist) {
        return <div className="p-8 text-center text-zinc-400">Playlist not found.</div>;
    }

    const songs = playlist.songs || [];
    const totalDuration = songs.reduce((acc, song) => acc + ((typeof song === 'object' ? song.duration : 0) || 0), 0);

    const displaySongs = isAddingSong
        ? availableSongs.filter(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()))
        : songs;

    return (
        <div className="relative">
            {/* Header Banner */}
            <div className="h-80 w-full relative flex items-end p-8 bg-gradient-to-b from-teal-900/40 to-zinc-950/90">
                <div className="relative z-20 flex items-end gap-6 w-full">
                    {playlist.coverImage ? (
                        <img
                            src={playlist.coverImage.startsWith('http') ? playlist.coverImage : `http://localhost:5000${playlist.coverImage}`}
                            alt={playlist.name}
                            className="w-56 h-56 shadow-2xl object-cover rounded-md"
                        />
                    ) : (
                        <div className="w-56 h-56 bg-zinc-800 shadow-2xl flex items-center justify-center rounded-md">
                            <ListMusic className="h-24 w-24 text-zinc-500" />
                        </div>
                    )}

                    <div className="flex-1 pb-2">
                        <span className="text-sm font-bold tracking-widest mb-2 block text-zinc-300">Playlist</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter">
                            {playlist.name}
                        </h1>
                        <p className="text-zinc-300 max-w-2xl mb-4 text-sm line-clamp-2">{playlist.description}</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                            <span className="text-white font-bold">{playlist.user?.username || 'You'}</span>
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
                            if (currentSong?.playlistId === id) {
                                togglePlay();
                            } else {
                                // We might need to ensure the songs have playlistId for this check to work perfectly
                                const playlistSongs = songs.map(s => ({ ...s, playlistId: id }));
                                setSong(playlistSongs[0], playlistSongs);
                            }
                        }
                    }}
                >
                    {isPlaying && currentSong?.playlistId === id ? (
                        <Pause className="h-7 w-7" fill="currentColor" />
                    ) : (
                        <Play className="h-7 w-7 ml-1" fill="currentColor" />
                    )}
                </button>

                {isOwner && (
                    <div className="flex gap-4 items-center">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/playlists/edit/${playlist.id}`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleToggleAddSong} className={isAddingSong ? 'bg-zinc-800 text-white border-zinc-600' : ''}>
                            {isAddingSong ? 'Done Adding' : <><Plus className="h-4 w-4 mr-2" /> Add Songs</>}
                        </Button>
                    </div>
                )}
            </div>

            {/* Tracklist List View */}
            <div className="px-8 pb-12">
                {isAddingSong && (
                    <div className="mb-6 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input
                                placeholder="Search for songs to add..."
                                className="pl-10 h-10 bg-zinc-900 border-zinc-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-[16px_1fr_minmax(120px,200px)] md:grid-cols-[16px_1fr_120px_minmax(120px,200px)] gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-zinc-800 mb-4 sticky top-[64px] bg-zinc-950/90 backdrop-blur z-10">
                    <div className="text-center">#</div>
                    <div>Title</div>
                    <div className="hidden md:block">Album</div>
                    <div className="flex justify-end pr-8"><Clock className="h-4 w-4" /></div>
                </div>

                {displaySongs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 bg-zinc-900/20 rounded-xl">
                        {isAddingSong
                            ? "No more songs available to add or matching your search."
                            : "No songs in this playlist yet. Add some!"}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {displaySongs.map((song, index) => {
                            if (typeof song !== 'object') return null;

                            const artistName = typeof song.artist === 'object' ? song.artist?.name : 'Unknown Artist';
                            const albumName = typeof song.album === 'object' ? song.album?.title : 'Unknown Album';

                            return (
                                <div
                                    key={song.id}
                                    className={`group grid grid-cols-[16px_1fr_minmax(120px,200px)] md:grid-cols-[16px_1fr_120px_minmax(120px,200px)] gap-4 px-4 py-3 rounded-md hover:bg-zinc-800/50 transition-colors items-center cursor-pointer relative ${currentSong?.id === song.id ? 'bg-zinc-800/40 text-primary' : ''}`}
                                    onClick={() => {
                                        if (!isAddingSong) {
                                            const playlistSongs = songs.map(s => ({ ...s, playlistId: id }));
                                            const currentSongWithPlaylistId = playlistSongs.find(s => s.id === song.id);
                                            setSong(currentSongWithPlaylistId, playlistSongs);
                                        }
                                    }}
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

                                    <div onClick={(e) => { if (!isAddingSong) { e.stopPropagation(); navigate(`/songs/${song.id}`); } }}>
                                        <div className={`font-medium line-clamp-1 ${currentSong?.id === song.id ? 'text-primary' : 'text-white'}`}>{song.title}</div>
                                        <div className="text-zinc-400 text-sm line-clamp-1 group-hover:text-white transition-colors">{artistName}</div>
                                    </div>
                                    <div className="hidden md:block text-zinc-400 text-sm line-clamp-1 hover:underline cursor-pointer" onClick={(e) => {
                                        if (!isAddingSong && song.album?.id) {
                                            e.stopPropagation();
                                            navigate(`/albums/${song.album.id}`);
                                        }
                                    }}>
                                        {albumName}
                                    </div>
                                    <div className="flex justify-end items-center pr-2 text-sm text-zinc-400">
                                        {formatDuration(song.duration)}

                                        {isOwner && (
                                            <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isAddingSong ? (
                                                    <Button size="sm" variant="outline" className="h-8" onClick={(e) => { e.stopPropagation(); handleAddSong(song.id); }}>
                                                        Add
                                                    </Button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleRemoveSong(e, song.id)}
                                                        className="text-zinc-400 hover:text-red-500 transition-colors p-1 bg-zinc-900 rounded-full"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistDetail;
