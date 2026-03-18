import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Pause } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import apiClient from '../../api/client';
import { Link } from 'react-router-dom';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        songs: [],
        artists: [],
        albums: [],
        playlists: []
    });
    const [loading, setLoading] = useState(false);
    const { setSong, currentSong, isPlaying, togglePlay } = usePlayerStore();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                handleSearch();
            } else {
                setResults({ songs: [], artists: [], albums: [], playlists: [] });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const [songsData, artistsData, albumsData, playlistsData] = await Promise.all([
                apiClient.get(`/songs?search=${query}&limit=5`),
                apiClient.get(`/artists?search=${query}&limit=5`),
                apiClient.get(`/albums?search=${query}&limit=5`),
                apiClient.get(`/playlists?search=${query}&limit=5`)
            ]);

            setResults({
                songs: songsData.songs || [],
                artists: artistsData.artists || [],
                albums: albumsData.albums || [],
                playlists: Array.isArray(playlistsData) ? playlistsData : []
            });
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 pb-32">
            <div className="max-w-2xl mb-12 relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-white transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What do you want to listen to?"
                    className="w-full bg-zinc-800/50 border border-transparent focus:border-zinc-700 hover:bg-zinc-800 focus:bg-zinc-800 py-3 pl-12 pr-4 rounded-full text-sm font-medium outline-none transition-all placeholder:text-zinc-500"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : query.trim() === '' ? (
                <div className="flex flex-col items-center justify-center py-40 text-zinc-500">
                    <SearchIcon className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-xl font-bold text-white mb-2">Search for your favorite music</p>
                    <p>Find songs, artists, albums, and playlists all in one place.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Artists Section */}
                    {results.artists.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Artists</h2>
                                <Link to="/artists" className="text-sm font-bold text-zinc-400 hover:underline">Show all</Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                                {results.artists.map((artist) => (
                                    <Link
                                        key={artist.id}
                                        to={`/artists/${artist.id}`}
                                        className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800/60 transition-all group border border-zinc-900/50 hover:border-zinc-700/50"
                                    >
                                        <div className="aspect-square mb-4 overflow-hidden rounded-full shadow-lg relative">
                                            <img
                                                src={artist.image || 'https://via.placeholder.com/300?text=Artist'}
                                                alt={artist.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="font-bold truncate text-white">{artist.name}</h3>
                                        <p className="text-zinc-400 text-xs mt-1">Artist</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Albums Section */}
                    {results.albums.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Albums</h2>
                                <Link to="/albums" className="text-sm font-bold text-zinc-400 hover:underline">Show all</Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                                {results.albums.map((album) => (
                                    <Link
                                        key={album.id}
                                        to={`/albums/${album.id}`}
                                        className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800/60 transition-all group border border-zinc-900/50 hover:border-zinc-700/50"
                                    >
                                        <div className="aspect-square mb-4 overflow-hidden rounded-lg shadow-lg relative">
                                            <img
                                                src={album.coverImage || 'https://via.placeholder.com/300?text=Album'}
                                                alt={album.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div
                                                className="absolute bottom-3 right-3 h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // In a real app we'd fetch the album songs first, but for now let's just navigate
                                                    // or we can implement a setAlbum logic in store. 
                                                    // For consistency with AlbumDetail, let's just let the link handle it for now 
                                                    // OR if we want it to play immediately:
                                                    apiClient.get(`/songs?album=${album.id}`).then(data => {
                                                        const songs = Array.isArray(data) ? data : (data.songs || []);
                                                        if (songs.length > 0) setSong(songs[0], songs);
                                                    });
                                                }}
                                            >
                                                {isPlaying && (currentSong?.albumId === album.id || currentSong?.album?.id === album.id) ? (
                                                    <Pause className="h-6 w-6 text-black fill-current" />
                                                ) : (
                                                    <Play className="h-6 w-6 text-black fill-current ml-1" />
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-bold truncate text-white">{album.title}</h3>
                                        <p className="text-zinc-400 text-xs mt-1">{album.artist?.name || 'Unknown Artist'}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Playlists Section */}
                    {results.playlists.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Playlists</h2>
                                <Link to="/playlists" className="text-sm font-bold text-zinc-400 hover:underline">Show all</Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                                {results.playlists.map((playlist) => (
                                    <Link
                                        key={playlist.id}
                                        to={`/playlists/${playlist.id}`}
                                        className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800/60 transition-all group border border-zinc-900/50 hover:border-zinc-700/50"
                                    >
                                        <div className="aspect-square mb-4 overflow-hidden rounded-lg shadow-lg relative">
                                            <img
                                                src={playlist.coverImage || 'https://via.placeholder.com/300?text=Playlist'}
                                                alt={playlist.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div
                                                className="absolute bottom-3 right-3 h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    apiClient.get(`/playlists/${playlist.id}`).then(data => {
                                                        const songs = data.songs || [];
                                                        if (songs.length > 0) {
                                                            const playlistSongs = songs.map(s => ({ ...s, playlistId: playlist.id }));
                                                            setSong(playlistSongs[0], playlistSongs);
                                                        }
                                                    });
                                                }}
                                            >
                                                {isPlaying && currentSong?.playlistId === playlist.id ? (
                                                    <Pause className="h-6 w-6 text-black fill-current" />
                                                ) : (
                                                    <Play className="h-6 w-6 text-black fill-current ml-1" />
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-bold truncate text-white">{playlist.name}</h3>
                                        <p className="text-zinc-400 text-xs mt-1">By {playlist.creator?.name || 'User'}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Songs Section */}
                    {results.songs.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Songs</h2>
                                <Link to="/songs" className="text-sm font-bold text-zinc-400 hover:underline">Show all</Link>
                            </div>
                            <div className="space-y-1">
                                {results.songs.map((song) => (
                                    <div
                                        key={song.id}
                                        onClick={() => setSong(song, results.songs)}
                                        className={`flex items-center gap-4 p-2 rounded-md hover:bg-white/10 group transition-colors cursor-pointer ${currentSong?.id === song.id ? 'bg-white/5 text-primary' : ''}`}
                                    >
                                        <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                                            <img
                                                src={song.album?.coverImage || 'https://via.placeholder.com/300?text=Song'}
                                                alt={song.title}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {currentSong?.id === song.id && isPlaying ? (
                                                    <div className="flex gap-0.5 h-3 items-end">
                                                        <div className="w-1 bg-primary animate-bounce-short"></div>
                                                        <div className="w-1 bg-primary [animation-delay:0.2s] animate-bounce-short"></div>
                                                        <div className="w-1 bg-primary [animation-delay:0.4s] animate-bounce-short"></div>
                                                    </div>
                                                ) : (
                                                    <Play className="h-5 w-5 text-white fill-current" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium truncate ${currentSong?.id === song.id ? 'text-primary' : 'text-white'}`}>{song.title}</h4>
                                            <p className="text-sm text-zinc-400 truncate group-hover:text-white transition-colors">{song.artist?.name}</p>
                                        </div>
                                        <div className="text-zinc-400 text-sm hidden sm:block">
                                            {song.duration}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && results.playlists.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            <p className="text-lg">No results found for "{query}"</p>
                            <p className="text-sm">Check the spelling or try searching for something else.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
