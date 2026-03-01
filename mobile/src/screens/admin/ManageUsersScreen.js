import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllUsers, deleteUser, toggleAdminStatus } from '../../api/userApi';

export default function ManageUsersScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data.users || data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            // Fallback for mock if endpoint 404s
            if (error.response?.status === 404) {
                setUsers([
                    { _id: '1', name: 'John Admin', email: 'john@melodify.com', isAdmin: true },
                    { _id: '2', name: 'Jane User', email: 'jane@gmail.com', isAdmin: false },
                    { _id: '3', name: 'Bob Smith', email: 'bob@test.com', isAdmin: false },
                ]);
            } else {
                Alert.alert('Error', 'Failed to load users');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, name) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUser(id);
                            Alert.alert('Success', 'User deleted');
                            fetchUsers();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    const handleToggleAdmin = (id, name, currentStatus) => {
        Alert.alert(
            'Toggle Permissions',
            `Change ${name} to ${currentStatus ? 'Regular User' : 'Admin'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await toggleAdminStatus(id, !currentStatus);
                            Alert.alert('Success', 'Permissions updated');
                            fetchUsers();
                        } catch (error) {
                            Alert.alert('Error', 'Update failed');
                        }
                    }
                }
            ]
        );
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={styles.userInfo}>
                <View style={styles.userNameContainer}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {item.isAdmin && (
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>ADMIN</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleAdmin(item._id, item.name, item.isAdmin)}
                >
                    <Ionicons name="shield-outline" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item._id, item.name)}
                >
                    <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Management</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or email..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color={colors.surfaceLight} />
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    }
                />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.md,
    },
    userInfo: {
        flex: 1,
    },
    userNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        color: colors.text,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
    },
    adminBadge: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: radius.xs,
        marginLeft: spacing.xs,
    },
    adminBadgeText: {
        color: colors.primary,
        fontSize: 8,
        fontFamily: typography.fontFamily.bold,
    },
    userEmail: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.xs,
        marginTop: 2,
    },
    userActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        width: 36,
        height: 36,
        backgroundColor: colors.background,
        borderRadius: radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.xs,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        marginTop: spacing.md,
    },
});
