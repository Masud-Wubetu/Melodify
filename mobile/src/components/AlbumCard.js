import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

export default function AlbumCard({ album, onPress }) {
    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
            <Image
                source={{ uri: album.coverImage || 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <Text style={styles.title} numberOfLines={1}>{album.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>
                {typeof album.artist === 'object' ? album.artist?.name : 'Unknown Artist'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 140,
        marginRight: spacing.md,
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceLight,
        marginBottom: spacing.sm,
    },
    title: {
        color: colors.text,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        marginBottom: 2,
    },
    artist: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
    }
});
