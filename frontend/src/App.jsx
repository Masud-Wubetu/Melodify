import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import ArtistList from './pages/Artists/ArtistList';
import ArtistDetail from './pages/Artists/ArtistDetail';
import ArtistForm from './pages/Artists/ArtistForm';

import AlbumList from './pages/Albums/AlbumList';
import AlbumDetail from './pages/Albums/AlbumDetail';
import AlbumForm from './pages/Albums/AlbumForm';

import SongList from './pages/Songs/SongList';
import SongDetail from './pages/Songs/SongDetail';
import SongForm from './pages/Songs/SongForm';

import PlaylistList from './pages/Playlists/PlaylistList';
import PlaylistDetail from './pages/Playlists/PlaylistDetail';
import PlaylistForm from './pages/Playlists/PlaylistForm';

const Dashboard = () => <div className="p-8"><h1 className="text-3xl font-bold mb-6">Good morning</h1></div>;

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-white select-none">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<div className="p-8">Search Area</div>} />

          <Route path="/artists" element={<ArtistList />} />
          <Route path="/artists/create" element={<ArtistForm />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/artists/edit/:id" element={<ArtistForm />} />

          <Route path="/albums" element={<AlbumList />} />
          <Route path="/albums/create" element={<AlbumForm />} />
          <Route path="/albums/:id" element={<AlbumDetail />} />
          <Route path="/albums/edit/:id" element={<AlbumForm />} />

          <Route path="/songs" element={<SongList />} />
          <Route path="/songs/create" element={<SongForm />} />
          <Route path="/songs/:id" element={<SongDetail />} />
          <Route path="/songs/edit/:id" element={<SongForm />} />

          <Route path="/playlists" element={<PlaylistList />} />
          <Route path="/playlists/create" element={<PlaylistForm />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/playlists/edit/:id" element={<PlaylistForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
