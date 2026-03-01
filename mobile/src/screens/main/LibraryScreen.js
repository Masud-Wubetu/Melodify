import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUserPlaylists } from '../../api/playlistApi';
import { getProfile } from '../../api/userApi';
import PlaylistCard from '../../components/PlaylistCard';
import SongCard from '../../components/SongCard';
import { usePlayerStore } from '../../store/playerStore';

export default function LibraryScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const playSong = usePlayerStore(state => state.playSong);

    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [activeTab, setActiveTab] = useState('playlists'); // 'playlists' or 'likes'

    const fetchLibraryData = async () => {
        setLoading(true);
        try {
            const [playlistsRes, profileRes] = await Promise.all([
                getUserPlaylists(),
                getProfile()
            ]);
            setPlaylists(playlistsRes || []);
            setLikedSongs(profileRes?.likedSongs || []);
        } catch (error) {
            console.error("Failed to load library", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLibraryData();
        }, [])
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Library</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreatePlaylist')}
                >
                    <Ionicons name="add-circle" size={32} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
                    onPress={() => setActiveTab('playlists')}
                >
                    <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>Playlists</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
                    onPress={() => setActiveTab('likes')}
                >
                    <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>Liked Songs</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {activeTab === 'playlists' && (
                        <View style={styles.gridContainer}>
                            {playlists.length > 0 ? (
                                playlists.map(playlist => (
                                    <View key={playlist._id} style={styles.gridItem}>
                                        <PlaylistCard
                                            playlist={playlist}
                                            onPress={() => navigation.navigate('Playlist', { id: playlist._id })}
                                            width="100%"
                                        />
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>You haven't created any playlists yet.</Text>
                            )}
                        </View>
                    )}

                    {activeTab === 'likes' && (
                        <View>
                            {likedSongs.length > 0 ? (
                                likedSongs.map(song => (
                                    <SongCard
                                        key={song._id}
                                        song={song}
                                        onPress={() => playSong(song)}
                                    />
                                ))
                            ) : (
                                <Text style={styles.emptyText}>You don't have any liked songs.</Text>
                            )}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxl,
    },
    createButton: {
        padding: spacing.xs,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    tab: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceLight,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
    },
    activeTabText: {
        color: colors.text,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: spacing.lg,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        textAlign: 'center',
        marginTop: spacing.xl,
    }
});
