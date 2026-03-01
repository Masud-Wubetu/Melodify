import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImagePicker from '../../components/ui/ImagePicker';
import { createPlaylist } from '../../api/playlistApi';

export default function CreatePlaylistScreen({ navigation }) {
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim() || !description.trim()) {
            Alert.alert('Error', 'Name and Description are required.');
            return;
        }

        if (name.length < 3 || name.length > 50) {
            Alert.alert('Error', 'Name must be between 3 and 50 characters.');
            return;
        }

        if (description.length < 10 || description.length > 200) {
            Alert.alert('Error', 'Description must be between 10 and 200 characters.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('isPublic', isPublic.toString());

            if (selectedImage) {
                const uri = Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri;
                const uriParts = selectedImage.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append('coverImage', {
                    uri,
                    name: `cover.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            await createPlaylist(formData);

            Alert.alert('Success', 'Playlist created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create playlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Playlist</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageSection}>
                    <ImagePicker
                        value={selectedImage}
                        onImageSelected={setSelectedImage}
                    />
                    <Text style={styles.imageHint}>Add a cover image (Optional)</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Playlist Name"
                        placeholder="e.g. My Awesome Mix"
                        value={name}
                        onChangeText={setName}
                    />

                    <Input
                        label="Description"
                        placeholder="What's this playlist about?"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        style={{ height: 100 }}
                    />

                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.switchLabel}>Make Public</Text>
                            <Text style={styles.switchSublabel}>Anyone can see and follow this playlist</Text>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                            thumbColor={colors.text}
                        />
                    </View>

                    <Button
                        title="Create Playlist"
                        onPress={handleCreate}
                        loading={loading}
                        style={{ marginTop: spacing.xxl }}
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
        marginBottom: spacing.xl,
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
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
        paddingVertical: spacing.sm,
    },
    switchLabel: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
    },
    switchSublabel: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
        marginTop: 2,
    }
});
