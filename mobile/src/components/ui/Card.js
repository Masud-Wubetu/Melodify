import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../../theme';

const Card = ({ children, onPress, style }) => {
    const CardComponent = onPress ? TouchableOpacity : View;

    return (
        <CardComponent
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {children}
        </CardComponent>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
});

export default Card;
