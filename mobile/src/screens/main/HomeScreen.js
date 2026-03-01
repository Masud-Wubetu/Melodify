import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';
import { getFeaturedPlaylists } from '../../api/playlistApi';
import { getTopArtists } from '../../api/artistApi';
import { getNewReleases } from '../../api/songApi';
import PlaylistCard from '../../components/PlaylistCard';
import ArtistCard from '../../components/ArtistCard';
import SongCard from '../../components/SongCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { usePlayerStore } from '../../store/playerStore';

export default function HomeScreen({ navigation }) {
    const playSong = usePlayerStore(state => state.playSong);
    const [playlists, setPlaylists] = useState([]);
    const [artists, setArtists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const [playlistsData, artistsData, songsData] = await Promise.all([
                getFeaturedPlaylists(6),
                getTopArtists(6),
                getNewReleases(8),
            ]);
            setPlaylists(playlistsData.playlists || playlistsData || []);
            setArtists(artistsData.artists || artistsData || []);
            setSongs(songsData.songs || songsData || []);
        } catch (error) {
            console.error('Failed to fetch home data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !refreshing) {
        return <LoadingSpinner />;
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.headerRow}>
                <Text style={styles.header}>{greeting}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="settings-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Featured Playlists */}
            {playlists.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Featured Playlists</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {playlists.map((playlist) => (
                            <PlaylistCard
                                key={playlist._id}
                                playlist={playlist}
                                onPress={() => navigation.navigate('Playlist', { id: playlist._id })}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Top Artists */}
            {artists.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Artists</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {artists.map((artist) => (
                            <ArtistCard
                                key={artist._id}
                                artist={artist}
                                onPress={() => navigation.navigate('Artist', { id: artist._id })}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* New Releases */}
            {songs.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>New Releases</Text>
                    </View>
                    <View style={styles.songsList}>
                        {songs.map((song) => (
                            <SongCard
                                key={song._id}
                                song={song}
                                onPress={() => playSong(song, songs)}
                            />
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: spacing.md,
        paddingTop: spacing.xl * 2,
        paddingBottom: 100, // Space for mini player later
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    header: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.huge,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xl,
    },
    songsList: {
        flexDirection: 'column',
    }
});
