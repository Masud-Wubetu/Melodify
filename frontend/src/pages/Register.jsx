import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Music } from 'lucide-react';
import apiClient from '../api/client';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [formError, setFormError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setFormError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post('/users/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            // Auto-login after registration
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate('/');
            }
        } catch (error) {
            setFormError(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
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
                    <CardTitle className="text-3xl font-bold mb-2">Sign up for free</CardTitle>
                    <CardDescription>Join Melodify to listen your favorite songs</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm mb-4">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isLoading}
                            />

                            <Input
                                label="Email address"
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing up...' : 'Sign up'}
                        </Button>

                        <div className="text-center mt-6 flex justify-center space-x-2">
                            <span className="text-zinc-400 text-sm">Already have an account?</span>
                            <Link to="/login" className="text-white hover:text-primary underline hover:no-underline font-semibold text-sm transition-colors">
                                Log in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
