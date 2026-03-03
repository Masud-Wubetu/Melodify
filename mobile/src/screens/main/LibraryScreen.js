import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getUserPlaylists } from '../../api/playlistApi';
import { getProfile } from '../../api/userApi';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

export default function LibraryScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { likedSongsIds } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);

    const fetchLibraryData = async () => {
        setLoading(true);
        try {
            const [playlistsRes] = await Promise.all([
                getUserPlaylists(),
            ]);
            setPlaylists(playlistsRes || []);
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

    const renderLibraryTile = (title, subtitle, type, onPress, image = null) => {
        return (
            <TouchableOpacity
                style={styles.tileContainer}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    {type === 'liked' ? (
                        <LinearGradient
                            colors={['#450af5', '#c4efd9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.likedGradient}
                        >
                            <Ionicons name="heart" size={32} color={colors.text} />
                        </LinearGradient>
                    ) : type === 'create' ? (
                        <View style={styles.createBox}>
                            <Ionicons name="add" size={40} color={colors.textMuted} />
                        </View>
                    ) : (
                        <Image
                            source={{ uri: image || 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=300' }}
                            style={styles.tileImage}
                        />
                    )}
                </View>
                <Text style={styles.tileTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.tileSubtitle} numberOfLines={1}>{subtitle}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Library</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="search" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={() => navigation.navigate('CreatePlaylist')}
                    >
                        <Ionicons name="add" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    <View style={styles.gridContainer}>
                        {/* Pinned: Liked Songs */}
                        {renderLibraryTile(
                            'Liked Songs',
                            `Playlist • ${likedSongsIds.length} songs`,
                            'liked',
                            () => navigation.navigate('Playlist', { id: 'liked', isLikedSongs: true })
                        )}

                        {/* Pinned: Create Playlist */}
                        {renderLibraryTile(
                            'Create Playlist',
                            'Add new collection',
                            'create',
                            () => navigation.navigate('CreatePlaylist')
                        )}

                        {/* User Playlists */}
                        {playlists.map(playlist => (
                            <React.Fragment key={playlist._id}>
                                {renderLibraryTile(
                                    playlist.name,
                                    `Playlist • ${playlist.creator?.name || 'You'}`,
                                    'playlist',
                                    () => navigation.navigate('Playlist', { id: playlist._id }),
                                    playlist.coverImage
                                )}
                            </React.Fragment>
                        ))}
                    </View>

                    {playlists.length === 0 && likedSongsIds.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Your library is empty.</Text>
                            <TouchableOpacity
                                style={styles.exploreButton}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={styles.exploreButtonText}>Explore Music</Text>
                            </TouchableOpacity>
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
        backgroundColor: colors.background,
    },
    headerTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxl,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginLeft: spacing.lg,
        padding: spacing.xs,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: spacing.md,
    },
    tileContainer: {
        width: TILE_WIDTH,
        marginBottom: spacing.lg,
    },
    imageContainer: {
        width: TILE_WIDTH,
        aspectRatio: 1,
        borderRadius: radius.md,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        marginBottom: spacing.sm,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    tileImage: {
        width: '100%',
        height: '100%',
    },
    likedGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
        borderStyle: 'dashed',
    },
    tileTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.md,
        marginBottom: 2,
    },
    tileSubtitle: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: spacing.xxl,
    },
    emptyText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        marginBottom: spacing.lg,
    },
    exploreButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.full,
    },
    exploreButtonText: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
    }
});
