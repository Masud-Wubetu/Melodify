import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImagePicker from '../../components/ui/ImagePicker';
import { updateProfile, getProfile } from '../../api/userApi';
import { useAuthStore } from '../../store/authStore';

export default function EditProfileScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user, login } = useAuthStore();

    const [name, setName] = useState(user?.name || '');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentProfile = async () => {
            try {
                const data = await getProfile();
                setName(data.name);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchCurrentProfile();
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (selectedImage) {
                const uri = Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri;
                const uriParts = selectedImage.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append('profilePicture', {
                    uri,
                    name: `profile.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            const updatedUser = await updateProfile(formData);
            // Update local store
            await login(updatedUser, user.token); // Keep existing token

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageSection}>
                    <ImagePicker
                        value={selectedImage}
                        onImageSelected={setSelectedImage}
                        initialImage={user?.profilePicture}
                    />
                    <Text style={styles.imageHint}>Tap to change profile picture</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Display Name"
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                    />

                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        loading={loading}
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        backgroundColor: colors.surface,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
        marginTop: spacing.xl,
    },
    imageHint: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        marginTop: spacing.sm,
    },
    form: {
        marginTop: spacing.md,
    },
    loadingText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
    }
});
