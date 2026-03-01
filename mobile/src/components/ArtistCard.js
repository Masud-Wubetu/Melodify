import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';

const ArtistCard = ({ artist, onPress }) => {
    if (!artist) return null;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <Image
                source={{ uri: artist.image || 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <Text style={styles.name} numberOfLines={1}>{artist.name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 120,
        marginRight: spacing.md,
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50, // Circle
        marginBottom: spacing.sm,
    },
    name: {
        color: colors.text,
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
    },
});

export default ArtistCard;
