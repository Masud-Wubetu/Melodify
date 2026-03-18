import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Repeat, Shuffle } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

const Player = () => {
    const { currentSong, isPlaying, togglePlay, setIsPlaying, volume, setVolume, nextSong, previousSong } = usePlayerStore();
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(err => console.log("Playback blocked:", err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentSong]);

    const onTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const onLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentSong) return null;

    const artistName = typeof currentSong.artist === 'object' ? currentSong.artist.name : (currentSong.artistName || 'Unknown Artist');
    const coverImage = currentSong.coverImage || currentSong.album?.coverImage || 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg';

    return (
        <div className="h-24 bg-black border-t border-zinc-900 px-4 flex items-center justify-between z-50 relative shadow-2xl">
            <audio
                ref={audioRef}
                src={currentSong.audioUrl}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={nextSong}
                volume={volume}
            />

            {/* Song Info */}
            <div className="flex items-center gap-4 w-1/3">
                <div className="h-14 w-14 rounded-md overflow-hidden bg-zinc-800 shadow-lg">
                    <img
                        src={coverImage.startsWith('http') ? coverImage : `http://localhost:5000${coverImage}`}
                        alt={currentSong.title}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white hover:underline cursor-pointer line-clamp-1">{currentSong.title}</span>
                    <span className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors">{artistName}</span>
                </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center max-w-[40%] w-full gap-2">
                <div className="flex items-center gap-6">
                    <button className="text-zinc-400 hover:text-white transition-colors duration-200"><Shuffle className="h-4 w-4" /></button>
                    <button onClick={previousSong} className="text-zinc-400 hover:text-white transition-colors duration-200 active:scale-90"><SkipBack className="h-5 w-5 fill-current" /></button>
                    <button
                        onClick={togglePlay}
                        className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md group"
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 text-black fill-current" />
                        ) : (
                            <Play className="h-5 w-5 text-black fill-current ml-0.5" />
                        )}
                    </button>
                    <button onClick={nextSong} className="text-zinc-400 hover:text-white transition-colors duration-200 active:scale-90"><SkipForward className="h-5 w-5 fill-current" /></button>
                    <button className="text-zinc-400 hover:text-white transition-colors duration-200"><Repeat className="h-4 w-4" /></button>
                </div>

                <div className="flex items-center gap-2 w-full max-w-xl">
                    <span className="text-[10px] text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
                    <div className="group relative flex-1 h-1 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer outline-none accent-primary hover:bg-zinc-600 transition-colors"
                            style={{
                                background: `linear-gradient(to right, #1DB954 ${(currentTime / duration) * 100 || 0}%, #404040 ${(currentTime / duration) * 100 || 0}%)`
                            }}
                        />
                    </div>
                    <span className="text-[10px] text-zinc-400 w-10">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume Controls */}
            <div className="flex items-center justify-end gap-3 w-1/3 pr-4">
                <button className="text-zinc-400 hover:text-white transition-colors"><Maximize2 className="h-4 w-4" /></button>
                <div className="flex items-center gap-2 w-32 group">
                    <Volume2 className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white hover:h-1.5 transition-all"
                    />
                </div>
            </div>
        </div>
    );
};

export default Player;
