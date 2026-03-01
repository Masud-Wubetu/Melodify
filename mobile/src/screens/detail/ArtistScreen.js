import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getArtistById, getArtistTopSongs } from '../../api/artistApi';
import { toggleFollowArtist } from '../../api/userApi';
import SongCard from '../../components/SongCard';
import { usePlayerStore } from '../../store/playerStore';

export default function ArtistScreen({ route, navigation }) {
    const { id } = route.params;
    const insets = useSafeAreaInsets();
    const playSong = usePlayerStore(state => state.playSong);

    const [loading, setLoading] = useState(true);
    const [artist, setArtist] = useState(null);
    const [topSongs, setTopSongs] = useState([]);
    const [isFollowed, setIsFollowed] = useState(false);

    const fetchArtistData = async () => {
        setLoading(true);
        try {
            const [artistData, songsData] = await Promise.all([
                getArtistById(id),
                getArtistTopSongs(id, 10).catch(() => [])
            ]);
            setArtist(artistData);
            setTopSongs(songsData || []);
        } catch (error) {
            console.error("Failed to load artist details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            await toggleFollowArtist(id);
            setIsFollowed(!isFollowed);
        } catch (error) {
            console.error("Failed to toggle follow", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchArtistData();
        }, [id])
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!artist) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <Text style={styles.errorText}>Artist not found.</Text>
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
                    source={{ uri: artist.image || 'https://via.placeholder.com/500' }}
                    style={styles.headerImage}
                />
                <View style={styles.headerOverlay}>
                    <TouchableOpacity
                        style={[styles.backButton, { top: insets.top + spacing.sm }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.artistName}>{artist.name}</Text>
                        <Text style={styles.followers}>{artist.followers} Followers</Text>
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.followButton, isFollowed && styles.followedButton]}
                                onPress={handleFollow}
                            >
                                <Text style={styles.followButtonText}>
                                    {isFollowed ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                            {topSongs.length > 0 && (
                                <TouchableOpacity
                                    style={styles.playButton}
                                    onPress={() => playSong(topSongs[0])}
                                >
                                    <Ionicons name="play" size={24} color={colors.text} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {topSongs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Songs</Text>
                        {topSongs.map((song, index) => (
                            <View key={song._id} style={styles.songRow}>
                                <Text style={styles.songIndex}>{index + 1}</Text>
                                <View style={{ flex: 1 }}>
                                    <SongCard song={song} onPress={() => playSong(song)} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {artist.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.bio}>{artist.bio}</Text>
                    </View>
                )}
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
        height: 350,
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
    },
    headerTextContainer: {
        marginTop: 'auto',
    },
    artistName: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxxl,
        marginBottom: 4,
    },
    followers: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    followButton: {
        borderColor: colors.text,
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.full,
        marginRight: spacing.md,
    },
    followButtonText: {
        color: colors.text,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
    },
    followedButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
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
    section: {
        marginBottom: spacing.xxl,
    },
    sectionTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xl,
        marginBottom: spacing.lg,
    },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    songIndex: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
        width: 30,
        textAlign: 'center',
    },
    bio: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        lineHeight: 24,
    },
    errorText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
    }
});
