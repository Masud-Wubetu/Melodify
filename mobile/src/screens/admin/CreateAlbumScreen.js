import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImagePickerComponent from '../../components/ui/ImagePicker';
import { getArtists } from '../../api/artistApi';
import { createAlbum, updateAlbum } from '../../api/albumApi';

export default function CreateAlbumScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const { album } = route.params || {};
    const isEditing = !!album;

    const [title, setTitle] = useState(album?.title || '');
    const [description, setDescription] = useState(album?.description || '');
    const [genre, setGenre] = useState(album?.genre || '');
    const [releaseDate, setReleaseDate] = useState(
        album?.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0]
    );
    const [artistId, setArtistId] = useState(album?.artist?._id || album?.artist || '');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [artists, setArtists] = useState([]);
    const [isExplicit, setIsExplicit] = useState(album?.isExplicit || false);

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            const data = await getArtists({ limit: 100 });
            setArtists(data.artists || data);
        } catch (error) {
            console.error("Failed to load artists", error);
        }
    };

    const handleSave = async () => {
        if (!title || !artistId || !genre || !description) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('genre', genre);
        formData.append('artistId', artistId);
        formData.append('releaseDate', releaseDate);
        formData.append('isExplicit', isExplicit.toString());

        if (image) {
            const uri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
            formData.append('coverImage', {
                uri,
                name: 'album_cover.jpg',
                type: 'image/jpeg',
            });
        }

        setLoading(true);
        try {
            if (isEditing) {
                await updateAlbum(album._id, formData);
            } else {
                await createAlbum(formData);
            }
            Alert.alert('Success', `Album ${isEditing ? 'updated' : 'created'} successfully!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} album`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={[styles.container, { paddingTop: insets.top }]}
                contentContainerStyle={styles.content}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{isEditing ? 'Edit Album' : 'Create New Album'}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ImagePickerComponent
                    label="Album Cover"
                    value={image || (album?.coverImage ? { uri: album.coverImage } : null)}
                    onImageSelected={setImage}
                />

                <Input
                    label="Album Title"
                    placeholder="Enter album title"
                    value={title}
                    onChangeText={setTitle}
                />

                <Input
                    label="Description"
                    placeholder="About the album"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                />

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Select Artist</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                        {artists.map(artist => (
                            <TouchableOpacity
                                key={artist._id}
                                style={[styles.chip, artistId === artist._id && styles.activeChip]}
                                onPress={() => setArtistId(artist._id)}
                            >
                                <Text style={[styles.chipText, artistId === artist._id && styles.activeChipText]}>
                                    {artist.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <Input
                    label="Genre"
                    placeholder="e.g. Pop"
                    value={genre}
                    onChangeText={setGenre}
                />

                <Input
                    label="Release Date (YYYY-MM-DD)"
                    placeholder="2024-01-01"
                    value={releaseDate}
                    onChangeText={setReleaseDate}
                />

                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setIsExplicit(!isExplicit)}
                >
                    <Ionicons
                        name={isExplicit ? "checkbox" : "square-outline"}
                        size={24}
                        color={isExplicit ? colors.primary : colors.textMuted}
                    />
                    <Text style={styles.checkboxLabel}>Explicit Content</Text>
                </TouchableOpacity>

                <Button
                    title={isEditing ? 'Update Album' : 'Create Album'}
                    onPress={handleSave}
                    loading={loading}
                    style={{ marginTop: spacing.xl }}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        color: colors.text,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.xs,
    },
    chipContainer: {
        flexDirection: 'row',
        marginTop: spacing.xs,
    },
    chip: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    activeChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: 12,
    },
    activeChipText: {
        color: colors.text,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    checkboxLabel: {
        color: colors.text,
        marginLeft: spacing.sm,
        fontFamily: typography.fontFamily.medium,
    },
});
