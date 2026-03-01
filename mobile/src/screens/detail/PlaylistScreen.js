import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPlaylistById } from '../../api/playlistApi';
import { toggleFollowPlaylist } from '../../api/userApi';
import SongCard from '../../components/SongCard';
import { usePlayerStore } from '../../store/playerStore';

export default function PlaylistScreen({ route, navigation }) {
    const { id } = route.params;
    const insets = useSafeAreaInsets();
    const playSong = usePlayerStore(state => state.playSong);

    const [loading, setLoading] = useState(true);
    const [playlist, setPlaylist] = useState(null);
    const [isFollowed, setIsFollowed] = useState(false);

    const fetchPlaylistData = async () => {
        setLoading(true);
        try {
            const data = await getPlaylistById(id);
            setPlaylist(data);
        } catch (error) {
            console.error("Failed to load playlist details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            await toggleFollowPlaylist(id);
            setIsFollowed(!isFollowed);
        } catch (error) {
            console.error("Failed to toggle follow", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPlaylistData();
        }, [id])
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!playlist) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <Text style={styles.errorText}>Playlist not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.headerImageContainer}>
                <Image
                    source={{ uri: playlist.coverImage || 'https://via.placeholder.com/500' }}
                    style={styles.headerImage}
                    resizeMode="cover"
                />
                <View style={styles.headerOverlay}>
                    <TouchableOpacity
                        style={[styles.backButton, { top: insets.top + spacing.sm }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.playlistTitle}>{playlist.name}</Text>

                        <View style={styles.creatorRow}>
                            <Image
                                source={{ uri: playlist.creator?.profilePicture || 'https://via.placeholder.com/50' }}
                                style={styles.creatorImage}
                            />
                            <Text style={styles.creatorName}>{playlist.creator?.name || 'Unknown User'}</Text>
                        </View>

                        <Text style={styles.metadata}>
                            {playlist.followers} followers • {playlist.songs?.length || 0} songs
                        </Text>

                        {playlist.songs?.length > 0 && (
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.playButton}
                                    onPress={() => playSong(playlist.songs[0], playlist.songs)}
                                >
                                    <Ionicons name="play" size={24} color={colors.text} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.iconButton} onPress={handleFollow}>
                                    <Ionicons
                                        name={isFollowed ? "heart" : "heart-outline"}
                                        size={28}
                                        color={isFollowed ? colors.primary : colors.text}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {playlist.description && (
                    <Text style={styles.description}>{playlist.description}</Text>
                )}

                <View style={styles.section}>
                    {playlist.songs && playlist.songs.map((song, index) => (
                        <View key={song._id} style={styles.songRow}>
                            <View style={{ flex: 1 }}>
                                <SongCard song={song} onPress={() => playSong(song, playlist.songs)} />
                            </View>
                        </View>
                    ))}
                    {(!playlist.songs || playlist.songs.length === 0) && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="musical-notes-outline" size={48} color={colors.surfaceLight} />
                            <Text style={styles.emptyText}>This playlist is empty.</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerImageContainer: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        padding: spacing.lg,
    },
    backButton: {
        position: 'absolute',
        left: spacing.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    headerTextContainer: {
        marginTop: 'auto',
    },
    playlistTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxxl,
        marginBottom: spacing.xs,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    creatorImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: spacing.xs,
    },
    creatorName: {
        color: colors.textBody,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
    },
    metadata: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    playButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    iconButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: spacing.lg,
    },
    description: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    section: {
        marginBottom: spacing.xxl,
    },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    emptyText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        marginTop: spacing.md,
    },
    errorText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
    }
});
