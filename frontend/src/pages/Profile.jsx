import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { LogOut, User } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuthStore();

    return (
        <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center space-x-6 mb-8 mt-12">
                <div className="h-32 w-32 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-4xl shadow-xl">
                    <User className="h-16 w-16 text-zinc-400" />
                </div>
                <div>
                    <h1 className="text-5xl font-bold mb-2">Profile</h1>
                    <p className="text-xl text-zinc-400 font-medium">
                        {user?.username || 'User'}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 mt-2 border border-zinc-700">
                        {user?.role === 'admin' ? 'Administrator' : 'Listener'}
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Account Overview</CardTitle>
                        <CardDescription>Manage your profile and settings here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-400 font-medium">Email</span>
                            <span>{user?.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-400 font-medium">Username</span>
                            <span>{user?.username}</span>
                        </div>

                        <div className="pt-6">
                            <Button onClick={logout} variant="outline" className="w-full sm:w-auto mt-4 px-6 border-zinc-600 hover:bg-zinc-800 hover:text-white hover:border-zinc-500">
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
