import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImagePickerComponent from '../../components/ui/ImagePicker';
import FilePicker from '../../components/ui/FilePicker';
import { getArtists } from '../../api/artistApi';
import { getAlbums } from '../../api/albumApi';
import { createSong, updateSong } from '../../api/songApi';

export default function UploadSongScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const { song } = route.params || {};
    const isEditing = !!song;

    const [title, setTitle] = useState(song?.title || '');
    const [genre, setGenre] = useState(song?.genre || '');
    const [duration, setDuration] = useState(song?.duration || '');
    const [artistId, setArtistId] = useState(song?.artist?._id || song?.artist || '');
    const [albumId, setAlbumId] = useState(song?.album?._id || song?.album || '');
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [isExplicit, setIsExplicit] = useState(song?.isExplicit || false);

    useEffect(() => {
        fetchArtists();
    }, []);

    useEffect(() => {
        if (artistId) {
            fetchAlbums(artistId);
        } else {
            setAlbums([]);
        }
    }, [artistId]);

    const fetchArtists = async () => {
        try {
            const data = await getArtists({ limit: 100 });
            setArtists(data.artists || data);
        } catch (error) {
            console.error("Failed to load artists", error);
        }
    };

    const fetchAlbums = async (id) => {
        try {
            const data = await getAlbums({ artist: id, limit: 100 });
            setAlbums(data.albums || data);
        } catch (error) {
            console.error("Failed to load albums", error);
        }
    };

    const handleSave = async () => {
        if (!title || !artistId || !genre) {
            Alert.alert('Error', 'Please fill in required fields.');
            return;
        }

        if (!isEditing && !audioFile) {
            Alert.alert('Error', 'Please select an audio file.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('genre', genre);
        formData.append('duration', duration || '0:00');
        formData.append('artistId', artistId);
        if (albumId) formData.append('albumId', albumId);
        formData.append('isExplicit', isExplicit.toString());

        // Audio file (Optional for editing)
        if (audioFile) {
            const audioUri = Platform.OS === 'ios' ? audioFile.uri.replace('file://', '') : audioFile.uri;
            formData.append('audio', {
                uri: audioUri,
                name: audioFile.name,
                type: audioFile.mimeType || 'audio/mpeg',
            });
        }

        // Cover image (Optional)
        if (coverImage) {
            const coverUri = Platform.OS === 'ios' ? coverImage.uri.replace('file://', '') : coverImage.uri;
            formData.append('cover', {
                uri: coverUri,
                name: 'song_cover.jpg',
                type: 'image/jpeg',
            });
        }

        setLoading(true);
        try {
            if (isEditing) {
                await updateSong(song._id, formData);
            } else {
                await createSong(formData);
            }
            Alert.alert('Success', `Song ${isEditing ? 'updated' : 'uploaded'} successfully!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'upload'} song`);
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
                    <Text style={styles.title}>{isEditing ? 'Edit Song' : 'Upload Song'}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <FilePicker
                    label={`Audio File ${isEditing ? '(optional)' : '(required)'}`}
                    value={audioFile}
                    onFileSelected={setAudioFile}
                />

                <ImagePickerComponent
                    label="Song Cover (optional)"
                    value={coverImage || (song?.coverImage ? { uri: song.coverImage } : null)}
                    onImageSelected={setCoverImage}
                />

                <Input
                    label="Song Title"
                    placeholder="Enter song title"
                    value={title}
                    onChangeText={setTitle}
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

                {artistId && albums.length > 0 && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Select Album (optional)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                            {albums.map(album => (
                                <TouchableOpacity
                                    key={album._id}
                                    style={[styles.chip, albumId === album._id && styles.activeChip]}
                                    onPress={() => setAlbumId(album._id)}
                                >
                                    <Text style={[styles.chipText, albumId === album._id && styles.activeChipText]}>
                                        {album.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.row}>
                    <Input
                        label="Genre"
                        placeholder="Pop"
                        value={genre}
                        onChangeText={setGenre}
                        containerStyle={{ flex: 1, marginRight: spacing.md }}
                    />
                    <Input
                        label="Duration"
                        placeholder="3:45"
                        value={duration}
                        onChangeText={setDuration}
                        containerStyle={{ flex: 1 }}
                    />
                </View>

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
                    title={isEditing ? 'Update Song' : 'Upload Song'}
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
