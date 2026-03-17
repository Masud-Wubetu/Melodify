import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import ArtistList from './pages/Artists/ArtistList';
import ArtistDetail from './pages/Artists/ArtistDetail';
import ArtistForm from './pages/Artists/ArtistForm';

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

          <Route path="/albums" element={<div className="p-8 text-2xl font-bold">Albums</div>} />
          <Route path="/songs" element={<div className="p-8 text-2xl font-bold">Songs</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
