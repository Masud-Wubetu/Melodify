import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';

const PlaylistCard = ({ playlist, onPress, width = 160 }) => {
    if (!playlist) return null;

    return (
        <TouchableOpacity
            style={[styles.container, { width }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.imageContainer, { width }]}>
                <Image
                    source={{ uri: playlist.coverImage || 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=300' }}
                    style={styles.image}
                />
            </View>
            <Text style={styles.name} numberOfLines={1}>{playlist.name}</Text>
            {playlist.description && (
                <Text style={styles.desc} numberOfLines={2}>{playlist.description}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: spacing.md,
        alignSelf: 'flex-start',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        color: colors.text,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.md,
        marginBottom: 2,
    },
    desc: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
    },
});

export default PlaylistCard;
