import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';

export default function FilePicker({ label, value, onFileSelected, style }) {
    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: true,
        });

        if (!result.canceled) {
            onFileSelected(result.assets[0]);
        }
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity style={styles.picker} onPress={pickFile}>
                <Ionicons name="musical-note-outline" size={24} color={value ? colors.primary : colors.textMuted} />
                <Text style={[styles.fileName, value && { color: colors.text }]}>
                    {value ? value.name : 'Select Audio File'}
                </Text>
                {value && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>
        </View>
    );
}

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
    picker: {
        width: '100%',
        height: 56,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    fileName: {
        flex: 1,
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        marginLeft: spacing.sm,
    },
});
