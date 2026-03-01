import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUserPlaylists, addSongsToPlaylist } from '../../api/playlistApi';

export default function AddToPlaylistScreen({ route, navigation }) {
    const { songId } = route.params;
    const insets = useSafeAreaInsets();

    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const data = await getUserPlaylists();
            setPlaylists(data);
        } catch (error) {
            console.error("Failed to load user playlists", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        setAdding(true);
        try {
            await addSongsToPlaylist(playlistId, [songId]);
            Alert.alert('Success', 'Song added to playlist!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add song to playlist');
        } finally {
            setAdding(false);
        }
    };

    const renderPlaylist = ({ item }) => (
        <TouchableOpacity
            style={styles.playlistItem}
            onPress={() => handleAddToPlaylist(item._id)}
            disabled={adding}
        >
            <Image
                source={{ uri: item.coverImage || 'https://via.placeholder.com/150' }}
                style={styles.playlistImage}
            />
            <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={styles.playlistMeta}>{item.songs?.length || 0} songs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add to Playlist</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : playlists.length > 0 ? (
                <FlatList
                    data={playlists}
                    renderItem={renderPlaylist}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons name="musical-notes-outline" size={64} color={colors.surfaceLight} />
                    <Text style={styles.emptyText}>You haven't created any playlists yet.</Text>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreatePlaylist')}
                    >
                        <Text style={styles.createButtonText}>Create New Playlist</Text>
                    </TouchableOpacity>
                </View>
            )}

            {adding && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
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
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
    },
    listContent: {
        padding: spacing.lg,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    playlistImage: {
        width: 60,
        height: 60,
        borderRadius: radius.sm,
    },
    playlistInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    playlistName: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
    },
    playlistMeta: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        marginTop: 2,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    createButton: {
        marginTop: spacing.xl,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.full,
    },
    createButtonText: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
