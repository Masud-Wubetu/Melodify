import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Play, Music, Heart, Edit, MoreHorizontal } from 'lucide-react';

const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const SongDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const [song, setSong] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        fetchSongDetails();
    }, [id]);

    const fetchSongDetails = async () => {
        try {
            const songData = await apiClient.get(`/songs/${id}`);
            setSong(songData);
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

    if (!song) {
        return <div className="p-8 text-center text-zinc-400">Song not found.</div>;
    }

    let artistName = 'Unknown Artist';
    let albumName = 'Single';
    let albumImage = null;

    if (typeof song.artist === 'object' && song.artist?.name) artistName = song.artist.name;
    if (typeof song.album === 'object') {
        if (song.album?.title) albumName = song.album.title;
        if (song.album?.imageUrl) albumImage = song.album.imageUrl;
    }

    return (
        <div className="relative">
            {/* Header Banner */}
            <div className="h-96 w-full relative flex items-end p-8 bg-gradient-to-b from-[#404040] to-zinc-950/90">
                {albumImage && (
                    <img
                        src={albumImage.startsWith('http') ? albumImage : `http://localhost:5000${albumImage}`}
                        alt={albumName}
                        className="absolute inset-0 w-full h-full object-cover opacity-10 filter blur-[100px]"
                    />
                )}
                <div className="relative z-20 flex flex-col md:flex-row items-start md:items-end gap-6 w-full mt-16">
                    {albumImage ? (
                        <img
                            src={albumImage.startsWith('http') ? albumImage : `http://localhost:5000${albumImage}`}
                            alt={song.title}
                            className="w-56 h-56 shadow-[0_16px_40px_rgba(0,0,0,0.5)] object-cover rounded-sm"
                        />
                    ) : (
                        <div className="w-56 h-56 bg-zinc-800 shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex items-center justify-center rounded-sm">
                            <Music className="h-24 w-24 text-zinc-500" />
                        </div>
                    )}

                    <div className="flex-1 pb-2">
                        <span className="text-sm font-bold tracking-widest mb-2 block text-white drop-shadow-md">Song</span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-xl overflow-hidden text-ellipsis whitespace-nowrap">
                            {song.title}
                        </h1>
                        <div className="flex items-center gap-2 text-sm md:text-base font-bold text-zinc-100 drop-shadow-md">
                            <span
                                className="hover:underline cursor-pointer flex items-center gap-2"
                                onClick={() => song.artist?._id && navigate(`/artists/${song.artist._id}`)}
                            >
                                {artistName}
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span
                                className="hover:underline cursor-pointer"
                                onClick={() => song.album?._id && navigate(`/albums/${song.album._id}`)}
                            >
                                {albumName}
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-zinc-300 font-medium">{formatDuration(song.duration)}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-zinc-300 font-medium">{song.playCount || 0} plays</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="p-8 pb-6 flex items-center gap-6 bg-gradient-to-b from-zinc-950/90 to-zinc-950">
                <button
                    className="h-16 w-16 rounded-full bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95 flex items-center justify-center text-black shadow-xl transition-all"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? (
                        <div className="flex gap-1 h-6 items-center">
                            <div className="w-1.5 h-6 bg-black rounded-sm"></div>
                            <div className="w-1.5 h-6 bg-black rounded-sm"></div>
                        </div>
                    ) : (
                        <Play className="h-8 w-8 ml-1" fill="currentColor" />
                    )}
                </button>

                <button className="text-zinc-400 hover:text-white transition-colors">
                    <Heart className="h-8 w-8" />
                </button>

                <button className="text-zinc-400 hover:text-white transition-colors">
                    <MoreHorizontal className="h-8 w-8" />
                </button>

                {isAdmin && (
                    <div className="flex gap-4 items-center ml-auto">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/songs/edit/${song._id}`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Song
                        </Button>
                    </div>
                )}
            </div>

            {/* Lyrics or Audio metadata mockup */}
            <div className="px-8 pb-20 max-w-4xl pt-8">
                <h2 className="text-2xl font-bold mb-6">Lyrics</h2>
                <div className="bg-zinc-800/40 rounded-2xl p-8 backdrop-blur-sm">
                    <p className="text-2xl leading-relaxed font-medium text-white/50">
                        Looks like we don't have the lyrics for this song yet.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SongDetail;
