import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

const Button = ({
    title,
    onPress,
    type = 'primary', // primary, secondary, text
    size = 'md', // sm, md, lg
    disabled = false,
    loading = false,
    style,
    textStyle,
}) => {
    const getBackgroundStyle = () => {
        switch (type) {
            case 'primary': return { backgroundColor: colors.primary };
            case 'secondary': return { backgroundColor: colors.surfaceLight };
            case 'text': return { backgroundColor: 'transparent' };
            default: return { backgroundColor: colors.primary };
        }
    };

    const getTextStyle = () => {
        switch (type) {
            case 'text': return { color: colors.primary };
            default: return { color: colors.text };
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'sm': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
            case 'lg': return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
            case 'md':
            default: return { paddingVertical: 12, paddingHorizontal: spacing.lg };
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getBackgroundStyle(),
                getSizeStyle(),
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={type === 'text' ? colors.primary : colors.text} />
            ) : (
                <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    text: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.md,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default Button;
