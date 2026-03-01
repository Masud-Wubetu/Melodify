import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { getProfile } from '../../api/userApi';
import Button from '../../components/ui/Button';
import ArtistCard from '../../components/ArtistCard';

export default function ProfileScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { logout, user } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfileData();
        }, [])
    );

    return (
        <ScrollView
            style={[styles.container, { paddingTop: insets.top }]}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : profile ? (
                <View style={styles.content}>
                    <View style={styles.profileHeader}>
                        <Image
                            source={{ uri: profile.profilePicture || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <View style={styles.userInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name}>{profile.name}</Text>
                                {profile.isAdmin && (
                                    <View style={styles.adminBadge}>
                                        <Text style={styles.adminBadgeText}>ADMIN</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.email}>{profile.email}</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{profile.likedSongs?.length || 0}</Text>
                            <Text style={styles.statLabel}>Liked Songs</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{profile.followedArtists?.length || 0}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
                    </View>

                    {profile.followedArtists?.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Following</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {profile.followedArtists.map(artist => (
                                    <View key={artist._id} style={{ marginRight: spacing.md }}>
                                        <ArtistCard
                                            artist={artist}
                                            onPress={() => navigation.navigate('Artist', { id: artist._id })}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.actionContainer}>
                        {profile.isAdmin && (
                            <Button
                                title="Admin Dashboard"
                                onPress={() => navigation.navigate('AdminDashboard')}
                                style={{ marginBottom: spacing.md }}
                            />
                        )}
                        <Button
                            title="Edit Profile"
                            onPress={() => navigation.navigate('EditProfile')}
                            type="secondary"
                            style={{ marginBottom: spacing.md }}
                        />
                        <Button
                            title="Log Out"
                            onPress={logout}
                            type="secondary"
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Could not load profile</Text>
                    <Button
                        title="Retry"
                        onPress={fetchProfileData}
                        style={{ marginTop: spacing.md }}
                    />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxl,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surfaceLight,
    },
    userInfo: {
        marginLeft: spacing.lg,
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    adminBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: spacing.sm,
    },
    adminBadgeText: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: 10,
    },
    name: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xl,
        marginBottom: 4,
    },
    email: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.xl,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.surfaceLight,
    },
    statNumber: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
        marginBottom: 4,
    },
    statLabel: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.xs,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
        marginBottom: spacing.md,
    },
    actionContainer: {
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
    },
    errorText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
    }
});
