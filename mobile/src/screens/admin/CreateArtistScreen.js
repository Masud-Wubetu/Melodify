import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImagePickerComponent from '../../components/ui/ImagePicker';
import { createArtist, updateArtist } from '../../api/artistApi';

export default function CreateArtistScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const { artist } = route.params || {};
    const isEditing = !!artist;

    const [name, setName] = useState(artist?.name || '');
    const [bio, setBio] = useState(artist?.bio || '');
    const [genres, setGenres] = useState(artist?.genres?.join(', ') || '');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !bio || !genres) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        formData.append('genres', genres);

        if (image) {
            const uri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
            formData.append('image', {
                uri,
                name: 'artist_image.jpg',
                type: 'image/jpeg',
            });
        }

        setLoading(true);
        try {
            if (isEditing) {
                await updateArtist(artist._id, formData);
            } else {
                await createArtist(formData);
            }
            Alert.alert('Success', `Artist ${isEditing ? 'updated' : 'created'} successfully!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} artist`);
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
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{isEditing ? 'Edit Artist' : 'Add New Artist'}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ImagePickerComponent
                    label="Artist Image"
                    value={image || (artist?.image ? { uri: artist.image } : null)}
                    onImageSelected={setImage}
                />

                <Input
                    label="Artist Name"
                    placeholder="Enter artist name"
                    value={name}
                    onChangeText={setName}
                />

                <Input
                    label="Biography"
                    placeholder="Brief bio about the artist"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    style={{ height: 100 }}
                />

                <Input
                    label="Genres (comma separated)"
                    placeholder="e.g. Pop, Jazz, Hip-Hop"
                    value={genres}
                    onChangeText={setGenres}
                />

                <Button
                    title={isEditing ? 'Update Artist' : 'Create Artist'}
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
});
