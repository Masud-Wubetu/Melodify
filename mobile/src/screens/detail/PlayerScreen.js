import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../../store/playerStore';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [showLyrics, setShowLyrics] = React.useState(false);

    const {
        currentSong,
        isPlaying,
        position,
        duration,
        pauseSong,
        resumeSong,
        nextSong,
        prevSong,
        seekTo,
        isShuffle,
        repeatMode,
        toggleShuffle,
        cycleRepeatMode
    } = usePlayerStore();

    if (!currentSong) return null;

    const formatTime = (millis) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-down" size={32} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Now Playing</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddToPlaylist', { songId: currentSong._id })}>
                    <Ionicons name="add-circle-outline" size={28} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {showLyrics ? (
                    <View style={styles.lyricsContainer}>
                        <View style={styles.lyricsHeader}>
                            <Text style={styles.lyricsTitle}>Lyrics</Text>
                            <TouchableOpacity onPress={() => setShowLyrics(false)}>
                                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.lyricsScroll} showsVerticalScrollIndicator={false}>
                            <Text style={styles.lyricsText}>
                                {currentSong.lyrics || "No lyrics available for this song."}
                            </Text>
                        </ScrollView>
                    </View>
                ) : (
                    <Image
                        source={{ uri: currentSong.coverImage || 'https://via.placeholder.com/400' }}
                        style={styles.artwork}
                    />
                )}

                <View style={styles.songInfo}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                        <Text style={styles.artist} numberOfLines={1}>
                            {typeof currentSong.artist === 'object' ? currentSong.artist?.name : 'Unknown Artist'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowLyrics(!showLyrics)}>
                        <Ionicons
                            name="musical-notes-outline"
                            size={24}
                            color={showLyrics ? colors.primary : colors.textMuted}
                            style={{ marginRight: spacing.md }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="heart-outline" size={28} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration || 1}
                        value={position}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.surfaceLight}
                        thumbTintColor={colors.primary}
                        onSlidingComplete={seekTo}
                    />
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={toggleShuffle}>
                        <Ionicons
                            name="shuffle"
                            size={24}
                            color={isShuffle ? colors.primary : colors.textMuted}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={prevSong}>
                        <Ionicons name="play-skip-back" size={36} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.playPauseButton}
                        onPress={isPlaying ? pauseSong : resumeSong}
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={40}
                            color={colors.text}
                            style={!isPlaying ? { marginLeft: 4 } : {}}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={nextSong}>
                        <Ionicons name="play-skip-forward" size={36} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={cycleRepeatMode} style={styles.repeatButton}>
                        <Ionicons
                            name={repeatMode === 'one' ? "repeat" : "repeat"}
                            size={24}
                            color={repeatMode !== 'none' ? colors.primary : colors.textMuted}
                        />
                        {repeatMode === 'one' && (
                            <View style={styles.repeatOneBadge}>
                                <Text style={styles.repeatOneText}>1</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footerActions}>
                    <TouchableOpacity>
                        <Ionicons name="share-outline" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Queue')}>
                        <Ionicons name="list" size={24} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        color: colors.textBody,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
    },
    artwork: {
        width: width - spacing.xl * 2,
        height: width - spacing.xl * 2,
        borderRadius: radius.md,
        marginBottom: spacing.xxl,
    },
    songInfo: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxl,
        marginBottom: 4,
    },
    artist: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.lg,
    },
    progressContainer: {
        width: '100%',
        marginBottom: spacing.xl,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    timeText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
    },
    controls: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xxl,
    },
    playPauseButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerActions: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    repeatButton: {
        position: 'relative',
    },
    repeatOneBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.primary,
        width: 14,
        height: 14,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    repeatOneText: {
        color: colors.text,
        fontSize: 8,
        fontFamily: typography.fontFamily.bold,
    },
    lyricsContainer: {
        width: width - spacing.xl * 2,
        height: width - spacing.xl * 2,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginBottom: spacing.xxl,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    lyricsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    lyricsTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
    },
    lyricsScroll: {
        flex: 1,
    },
    lyricsText: {
        color: colors.textBody,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        lineHeight: 28,
        textAlign: 'center',
    },
});
