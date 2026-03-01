import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

// Main tab screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import LibraryScreen from '../screens/main/LibraryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Detail screens
import ArtistScreen from '../screens/detail/ArtistScreen';
import AlbumScreen from '../screens/detail/AlbumScreen';
import PlaylistScreen from '../screens/detail/PlaylistScreen';
import PlayerScreen from '../screens/detail/PlayerScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import CreateArtistScreen from '../screens/admin/CreateArtistScreen';
import CreateAlbumScreen from '../screens/admin/CreateAlbumScreen';
import UploadSongScreen from '../screens/admin/UploadSongScreen';
import ManageContentScreen from '../screens/admin/ManageContentScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import AddToAlbumScreen from '../screens/admin/AddToAlbumScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import CreatePlaylistScreen from '../screens/main/CreatePlaylistScreen';
import AddToPlaylistScreen from '../screens/main/AddToPlaylistScreen';
import QueueScreen from '../screens/detail/QueueScreen';
import MiniPlayer from '../components/MiniPlayer';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigation for tabs to allow pushing detail screens
const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeIndex" component={HomeScreen} />
        <Stack.Screen name="Artist" component={ArtistScreen} />
        <Stack.Screen name="Album" component={AlbumScreen} />
        <Stack.Screen name="Playlist" component={PlaylistScreen} />
    </Stack.Navigator>
);

const SearchStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SearchIndex" component={SearchScreen} />
        <Stack.Screen name="Artist" component={ArtistScreen} />
        <Stack.Screen name="Album" component={AlbumScreen} />
        <Stack.Screen name="Playlist" component={PlaylistScreen} />
    </Stack.Navigator>
);

const LibraryStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LibraryIndex" component={LibraryScreen} />
        <Stack.Screen name="Album" component={AlbumScreen} />
        <Stack.Screen name="Playlist" component={PlaylistScreen} />
    </Stack.Navigator>
);

const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.surfaceLight,
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
            },
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
                else if (route.name === 'Library') iconName = focused ? 'library' : 'library-outline';
                else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
            },
        })}
    >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Search" component={SearchStack} />
        <Tab.Screen name="Library" component={LibraryStack} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

const MainNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs">
                {(props) => (
                    <View style={{ flex: 1, backgroundColor: colors.background }}>
                        <TabNavigator />
                        <MiniPlayer onPress={() => props.navigation.navigate('Player')} />
                    </View>
                )}
            </Stack.Screen>
            <Stack.Screen
                name="Player"
                component={PlayerScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboard}
                options={{
                    headerShown: false,
                    animation: 'slide_from_right'
                }}
            />
            <Stack.Screen
                name="CreateArtist"
                component={CreateArtistScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CreateAlbum"
                component={CreateAlbumScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="UploadSong"
                component={UploadSongScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ManageContent"
                component={ManageContentScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ManageUsers"
                component={ManageUsersScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddToAlbum"
                component={AddToAlbumScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CreatePlaylist"
                component={CreatePlaylistScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddToPlaylist"
                component={AddToPlaylistScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name="Queue"
                component={QueueScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
        </Stack.Navigator>
    );
};

export default MainNavigator;
