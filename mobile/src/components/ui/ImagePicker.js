import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';

export default function ImagePickerComponent({ label, value, initialImage, onImageSelected, style }) {
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            onImageSelected(result.assets[0]);
        }
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity style={styles.picker} onPress={pickImage}>
                {value ? (
                    <Image source={{ uri: value.uri }} style={styles.image} />
                ) : initialImage ? (
                    <Image source={{ uri: initialImage }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="image-outline" size={32} color={colors.textMuted} />
                        <Text style={styles.placeholderText}>Select Image</Text>
                    </View>
                )}
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
        height: 150,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.surfaceLight,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
        marginTop: spacing.xs,
    },
});
