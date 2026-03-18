import { Outlet, NavLink } from 'react-router-dom';
import { Home, Search, Library, Music, Mic2, Disc3, ListMusic } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Player from './Player';

const Sidebar = () => {
    return (
        <div className="w-64 bg-black flex-shrink-0 flex flex-col h-full border-r border-zinc-900">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <Music className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold tracking-tight text-white">Melodify</span>
                </div>

                <nav className="space-y-4">
                    <NavLink
                        to="/"
                        className={({ isActive }) => `flex items-center gap-4 text-sm font-semibold transition-colors hover:text-white ${isActive ? 'text-white' : 'text-zinc-400'}`}
                    >
                        <Home className="h-6 w-6" /> Home
                    </NavLink>
                    <NavLink
                        to="/search"
                        className={({ isActive }) => `flex items-center gap-4 text-sm font-semibold transition-colors hover:text-white ${isActive ? 'text-white' : 'text-zinc-400'}`}
                    >
                        <Search className="h-6 w-6" /> Search
                    </NavLink>
                </nav>
            </div>

            <div className="bg-zinc-900 mx-2 rounded-lg flex-1 overflow-y-auto mb-2">
                <div className="p-4 flex items-center justify-between sticky top-0 bg-zinc-900 z-10 shadow-sm">
                    <div className="flex items-center gap-2 text-zinc-400 font-semibold text-sm hover:text-white transition-colors cursor-pointer">
                        <Library className="h-5 w-5" /> Your Library
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    {/* User Navigation */}
                    <NavLink to="/playlists" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-800 text-sm font-medium ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}>
                        <ListMusic className="h-4 w-4" /> Your Playlists
                    </NavLink>

                    {/* Admin Navigation (Conditional) */}
                    <div className="px-2 py-3 mt-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Management
                    </div>
                    <NavLink to="/artists" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-800 text-sm font-medium ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}>
                        <Mic2 className="h-4 w-4" /> Artists
                    </NavLink>
                    <NavLink to="/albums" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-800 text-sm font-medium ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}>
                        <Disc3 className="h-4 w-4" /> Albums
                    </NavLink>
                    <NavLink to="/songs" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-zinc-800 text-sm font-medium ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}>
                        <Music className="h-4 w-4" /> Songs
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

const MainLayout = () => {
    const { user } = useAuthStore();

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-zinc-950/50 relative overflow-y-auto">
                <header className="h-16 sticky top-0 bg-black/60 backdrop-blur-md z-20 flex items-center justify-end px-8">
                    <NavLink to="/profile" className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:scale-105 transition-transform text-sm font-bold shadow-md cursor-pointer border border-zinc-700">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </NavLink>
                </header>
                <main className="flex-1 relative">
                    <Outlet />
                </main>
            </div>
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <Player />
            </div>
        </div>
    );
};

export default MainLayout;
