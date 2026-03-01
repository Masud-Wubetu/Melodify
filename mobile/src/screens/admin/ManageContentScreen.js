import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSongs, deleteSong } from '../../api/songApi';
import { getArtists, deleteArtist } from '../../api/artistApi';
import { getAlbums, deleteAlbum } from '../../api/albumApi';

const TABS = ['Songs', 'Artists', 'Albums'];

export default function ManageContentScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('Songs');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let result;
            if (activeTab === 'Songs') {
                result = await getSongs();
                setData(result.songs || result);
            } else if (activeTab === 'Artists') {
                result = await getArtists();
                setData(result.artists || result);
            } else {
                result = await getAlbums();
                setData(result.albums || result);
            }
        } catch (error) {
            console.error(`Failed to fetch ${activeTab}`, error);
            Alert.alert('Error', `Failed to load ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, name) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (activeTab === 'Songs') await deleteSong(id);
                            else if (activeTab === 'Artists') await deleteArtist(id);
                            else await deleteAlbum(id);

                            Alert.alert('Success', `${activeTab.slice(0, -1)} deleted successfully`);
                            fetchData();
                        } catch (error) {
                            Alert.alert('Error', 'Delete failed');
                        }
                    }
                }
            ]
        );
    };

    const filteredData = data.filter(item => {
        const name = item.title || item.name || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.title || item.name}</Text>
                <Text style={styles.itemSubtext}>ID: {item._id.slice(-6)}</Text>
            </View>
            <View style={styles.itemActions}>
                {activeTab === 'Songs' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('AddToAlbum', { songId: item._id })}
                    >
                        <Ionicons name="disc-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        if (activeTab === 'Songs') navigation.navigate('UploadSong', { song: item });
                        else if (activeTab === 'Artists') navigation.navigate('CreateArtist', { artist: item });
                        else navigation.navigate('CreateAlbum', { album: item });
                    }}
                >
                    <Ionicons name="create-outline" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item._id, item.title || item.name)}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
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
                <Text style={styles.headerTitle}>Manage Content</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.tabBar}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search ${activeTab}...`}
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
                    data={filteredData}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={48} color={colors.surfaceLight} />
                            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found</Text>
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
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
    },
    activeTabText: {
        color: colors.primary,
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
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: colors.text,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
    },
    itemSubtext: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
        fontSize: 10,
        marginTop: 2,
    },
    itemActions: {
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
