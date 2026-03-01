import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, radius, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { toggleLikeSong } from '../api/userApi';

const SongCard = ({ song, onPress }) => {
    const navigation = useNavigation();
    const [isLiked, setIsLiked] = useState(false);

    if (!song) return null;

    const handleLike = async () => {
        try {
            await toggleLikeSong(song._id);
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Failed to toggle like", error);
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <Image
                source={{ uri: song.coverImage || 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {typeof song.artist === 'object' ? song.artist?.name : 'Unknown Artist'}
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.iconButton} onPress={handleLike}>
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={22}
                        color={isLiked ? colors.primary : colors.textMuted}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('AddToPlaylist', { songId: song._id });
                    }}
                >
                    <Ionicons name="add-circle-outline" size={22} color={colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButton} onPress={onPress}>
                    <Ionicons name="play" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.sm,
        marginBottom: spacing.sm,
    },
    image: {
        width: 50,
        height: 50,
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
        fontSize: typography.fontSize.md,
        marginBottom: 2,
    },
    artist: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: spacing.sm,
        marginRight: spacing.xs,
    },
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default SongCard;
