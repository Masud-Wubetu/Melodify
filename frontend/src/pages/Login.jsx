import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Music } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    const login = useAuthStore((state) => state.login);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!email || !password) {
            setFormError('Please fill in all fields');
            return;
        }

        const success = await login(email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex items-center justify-center gap-2">
                <Music className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold tracking-tight">Melodify</span>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-bold mb-2">Log in to Melodify</CardTitle>
                    <CardDescription>Enter your email and password to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {(error || formError) && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm mb-4">
                                {error || formError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Email address"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </Button>

                        <div className="text-center mt-6">
                            <span className="text-zinc-400 text-sm">Don't have an account? </span>
                            <Link to="/register" className="text-white hover:text-primary underline hover:no-underline font-semibold text-sm transition-colors">
                                Sign up for Melodify
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
