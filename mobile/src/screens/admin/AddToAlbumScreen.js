import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAlbums, addSongsToAlbum } from '../../api/albumApi';

export default function AddToAlbumScreen({ route, navigation }) {
    const { songId } = route.params;
    const insets = useSafeAreaInsets();

    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            const data = await getAlbums({ limit: 100 });
            setAlbums(data.albums || data);
        } catch (error) {
            console.error("Failed to load albums", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToAlbum = async (albumId) => {
        setAdding(true);
        try {
            await addSongsToAlbum(albumId, [songId]);
            Alert.alert('Success', 'Song added to album!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add song to album');
        } finally {
            setAdding(false);
        }
    };

    const renderAlbum = ({ item }) => (
        <TouchableOpacity
            style={styles.albumItem}
            onPress={() => handleAddToAlbum(item._id)}
            disabled={adding}
        >
            <Image
                source={{ uri: item.coverImage || 'https://via.placeholder.com/150' }}
                style={styles.albumImage}
            />
            <View style={styles.albumInfo}>
                <Text style={styles.albumTitle}>{item.title}</Text>
                <Text style={styles.albumArtist}>{item.artist?.name || 'Unknown Artist'}</Text>
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
                <Text style={styles.headerTitle}>Add to Album</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : albums.length > 0 ? (
                <FlatList
                    data={albums}
                    renderItem={renderAlbum}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons name="disc-outline" size={64} color={colors.surfaceLight} />
                    <Text style={styles.emptyText}>No albums found.</Text>
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
    albumItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    albumImage: {
        width: 60,
        height: 60,
        borderRadius: radius.sm,
    },
    albumInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    albumTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
    },
    albumArtist: {
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
