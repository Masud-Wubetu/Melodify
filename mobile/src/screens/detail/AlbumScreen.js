import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAlbumById } from '../../api/albumApi';
import SongCard from '../../components/SongCard';
import { usePlayerStore } from '../../store/playerStore';

export default function AlbumScreen({ route, navigation }) {
    const { id } = route.params;
    const insets = useSafeAreaInsets();
    const playSong = usePlayerStore(state => state.playSong);

    const [loading, setLoading] = useState(true);
    const [album, setAlbum] = useState(null);

    const fetchAlbumData = async () => {
        setLoading(true);
        try {
            const data = await getAlbumById(id);
            setAlbum(data);
        } catch (error) {
            console.error("Failed to load album details", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAlbumData();
        }, [id])
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!album) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <Text style={styles.errorText}>Album not found.</Text>
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
                    source={{ uri: album.coverImage || 'https://via.placeholder.com/500' }}
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
                        <Text style={styles.albumTitle}>{album.title}</Text>
                        <TouchableOpacity onPress={
                            () => album.artist?._id ? navigation.navigate('Artist', { id: album.artist._id }) : null
                        }>
                            <Text style={styles.artistName}>
                                {album.artist?.name || 'Unknown Artist'}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.metadata}>
                            {album.genre} • {new Date(album.releaseDate).getFullYear()} • {album.songs?.length || 0} songs
                        </Text>

                        {album.songs?.length > 0 && (
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.playButton}
                                    onPress={() => playSong(album.songs[0], album.songs)}
                                >
                                    <Ionicons name="play" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {album.description && (
                    <Text style={styles.description}>{album.description}</Text>
                )}

                <View style={styles.section}>
                    {album.songs && album.songs.map((song, index) => (
                        <View key={song._id} style={styles.songRow}>
                            <Text style={styles.songIndex}>{index + 1}</Text>
                            <View style={{ flex: 1 }}>
                                <SongCard song={song} onPress={() => playSong(song, album.songs)} />
                            </View>
                        </View>
                    ))}
                    {(!album.songs || album.songs.length === 0) && (
                        <Text style={styles.emptyText}>No songs available in this album.</Text>
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
        aspectRatio: 1, // Square cover for albums looks best
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
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
    albumTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxxl,
        marginBottom: 4,
    },
    artistName: {
        color: colors.textBody,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.lg,
        marginBottom: spacing.xs,
    },
    metadata: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
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
    songIndex: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
        width: 30,
        textAlign: 'center',
    },
    emptyText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
    errorText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
    }
});
