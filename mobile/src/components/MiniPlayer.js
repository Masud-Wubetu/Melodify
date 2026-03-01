import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';

export default function MiniPlayer({ onPress }) {
    const { currentSong, isPlaying, playSong, pauseSong, resumeSong } = usePlayerStore();

    if (!currentSong) return null;

    const togglePlay = () => {
        if (isPlaying) {
            pauseSong();
        } else {
            resumeSong();
        }
    };

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
            <Image
                source={{ uri: currentSong.coverImage || 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {typeof currentSong.artist === 'object' ? currentSong.artist?.name : 'Unknown Artist'}
                </Text>
            </View>
            <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={colors.text} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 55, // just above the bottom tab bar (tab bar is usually ~50-60)
        left: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.surfaceLight,
        height: 60,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    image: {
        width: 44,
        height: 44,
        borderRadius: radius.sm,
    },
    infoContainer: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
    title: {
        color: colors.text,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
    },
    artist: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
    },
    playButton: {
        padding: spacing.sm,
    },
});
