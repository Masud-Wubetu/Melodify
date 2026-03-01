import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSongs } from '../../api/songApi';
import { getArtists } from '../../api/artistApi';
import { getAlbums } from '../../api/albumApi';
import SongCard from '../../components/SongCard';
import ArtistCard from '../../components/ArtistCard';
import AlbumCard from '../../components/AlbumCard';
import { usePlayerStore } from '../../store/playerStore';

const GENRES = [
    { id: '1', name: 'Pop', color: '#7C3AED' },
    { id: '2', name: 'Hip-Hop', color: '#EF4444' },
    { id: '3', name: 'Jazz', color: '#F59E0B' },
    { id: '4', name: 'Rock', color: '#10B981' },
    { id: '5', name: 'Electronic', color: '#3B82F6' },
    { id: '6', name: 'R&B', color: '#EC4899' },
    { id: '7', name: 'Lofi', color: '#8B5CF6' },
    { id: '8', name: 'Classical', color: '#6B7280' },
];

export default function SearchScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ songs: [], artists: [], albums: [] });

    const playSong = usePlayerStore(state => state.playSong);

    // Debounce the query input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch Search Results
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!debouncedQuery.trim()) {
                setResults({ songs: [], artists: [], albums: [] });
                return;
            }

            setLoading(true);
            try {
                const [songsRes, artistsRes, albumsRes] = await Promise.all([
                    getSongs({ search: debouncedQuery, limit: 10 }),
                    getArtists({ search: debouncedQuery, limit: 10 }),
                    getAlbums({ search: debouncedQuery, limit: 10 })
                ]);

                setResults({
                    songs: songsRes.songs || [],
                    artists: artistsRes.artists || [],
                    albums: albumsRes.albums || []
                });
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [debouncedQuery]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search</Text>
            </View>

            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Songs, Artists, Albums"
                    placeholderTextColor={colors.textMuted}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : !debouncedQuery.trim() ? (
                <ScrollView
                    style={styles.resultsContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <Text style={styles.sectionTitle}>Browse All</Text>
                    <View style={styles.genreGrid}>
                        {GENRES.map(genre => (
                            <TouchableOpacity
                                key={genre.id}
                                style={[styles.genreCard, { backgroundColor: genre.color }]}
                                onPress={() => setQuery(genre.name)}
                            >
                                <Text style={styles.genreName}>{genre.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <ScrollView
                    style={styles.resultsContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Songs Section */}
                    {results.songs.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Songs</Text>
                            {results.songs.map(song => (
                                <SongCard
                                    key={song._id}
                                    song={song}
                                    onPress={() => playSong(song)}
                                />
                            ))}
                        </View>
                    )}

                    {/* Artists Section */}
                    {results.artists.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Artists</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {results.artists.map(artist => (
                                    <View key={artist._id} style={{ marginRight: spacing.md }}>
                                        <ArtistCard
                                            artist={artist}
                                            onPress={() => navigation.navigate('Artist', { id: artist._id })}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Albums Section */}
                    {results.albums.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Albums</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {results.albums.map(album => (
                                    <AlbumCard
                                        key={album._id}
                                        album={album}
                                        onPress={() => navigation.navigate('Album', { id: album._id })}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>No results found for "{debouncedQuery}"</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxl,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        height: 50,
        marginBottom: spacing.md,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        height: '100%',
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
        marginBottom: spacing.md,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        marginTop: spacing.sm,
    },
    genreGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    genreCard: {
        width: '48%',
        height: 100,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        justifyContent: 'flex-end',
    },
    genreName: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
    },
});
