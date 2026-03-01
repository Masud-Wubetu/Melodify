import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../../store/playerStore';

export default function QueueScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { queue, currentSong, playSong } = usePlayerStore();

    const renderItem = ({ item }) => {
        const isCurrent = item._id === currentSong?._id;

        return (
            <TouchableOpacity
                style={[styles.songItem, isCurrent && styles.activeSongItem]}
                onPress={() => playSong(item, queue)}
            >
                <Image
                    source={{ uri: item.coverImage || 'https://via.placeholder.com/50' }}
                    style={styles.songImage}
                />
                <View style={styles.songInfo}>
                    <Text
                        style={[styles.songTitle, isCurrent && styles.activeText]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                        {typeof item.artist === 'object' ? item.artist?.name : 'Unknown Artist'}
                    </Text>
                </View>
                {isCurrent && (
                    <Ionicons name="stats-chart" size={18} color={colors.primary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-down" size={32} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Queue</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Now Playing</Text>
            </View>

            {currentSong && (
                <View style={styles.currentSongContainer}>
                    {renderItem({ item: currentSong })}
                </View>
            )}

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Next In Queue</Text>
            </View>

            <FlatList
                data={queue.filter(s => s._id !== currentSong?._id)}
                keyExtractor={(item, index) => `${item._id}-${index}`}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No upcoming songs</Text>
                }
            />
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
        fontSize: typography.fontSize.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surfaceLight + '10',
    },
    sectionTitle: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    currentSongContainer: {
        backgroundColor: colors.surface,
    },
    listContent: {
        paddingBottom: spacing.xxl,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    activeSongItem: {
        backgroundColor: colors.surfaceLight + '20',
    },
    songImage: {
        width: 48,
        height: 48,
        borderRadius: radius.sm,
        marginRight: spacing.md,
    },
    songInfo: {
        flex: 1,
    },
    songTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.md,
    },
    activeText: {
        color: colors.primary,
    },
    songArtist: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        marginTop: 2,
    },
    emptyText: {
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.xl,
        fontFamily: typography.fontFamily.medium,
    }
});
