import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

const Input = ({ label, error, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={colors.textMuted}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        color: colors.text,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        color: colors.text,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
    },
    inputError: {
        borderColor: colors.danger,
    },
    errorText: {
        color: colors.danger,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
        marginTop: spacing.xs,
    },
});

export default Input;
