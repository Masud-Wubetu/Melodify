import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../api/client';

export default function AdminDashboard({ navigation }) {
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const AdminCard = ({ title, value, icon, color }) => (
        <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.statsGrid}>
                        <AdminCard title="Total Users" value={stats.users} icon="people" color="#3B82F6" />
                        <AdminCard title="Artists" value={stats.artists} icon="mic" color="#F59E0B" />
                        <AdminCard title="Albums" value={stats.albums} icon="albums" color="#EC4899" />
                        <AdminCard title="Songs" value={stats.songs} icon="musical-notes" color="#10B981" />
                        <AdminCard title="Playlists" value={stats.playlists} icon="list" color="#8B5CF6" />
                    </View>

                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => navigation.navigate('UploadSong')}
                    >
                        <Ionicons name="add-circle-outline" size={24} color={colors.text} />
                        <Text style={styles.actionText}>Add New Song</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => navigation.navigate('CreateArtist')}
                    >
                        <Ionicons name="person-add-outline" size={24} color={colors.text} />
                        <Text style={styles.actionText}>Add New Artist</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => navigation.navigate('CreateAlbum')}
                    >
                        <Ionicons name="albums-outline" size={24} color={colors.text} />
                        <Text style={styles.actionText}>Create New Album</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Administration</Text>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => navigation.navigate('ManageContent')}
                    >
                        <Ionicons name="library-outline" size={24} color={colors.text} />
                        <Text style={styles.actionText}>Manage All Content</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => navigation.navigate('ManageUsers')}
                    >
                        <Ionicons name="people-outline" size={24} color={colors.text} />
                        <Text style={styles.actionText}>Manage Users</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    statCard: {
        width: '48%',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    statValue: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
    },
    statTitle: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.lg,
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
    },
    actionText: {
        flex: 1,
        color: colors.text,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        marginLeft: spacing.md,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
