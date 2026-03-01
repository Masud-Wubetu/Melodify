import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { registerUser } from '../../api/userApi';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [loading, setLoading] = useState(false);

    const login = useAuthStore((state) => state.login);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const data = await registerUser(name, email, password, adminCode);
            // Assuming registration also returns a token
            await login(data.user || data, data.token);
        } catch (error) {
            Alert.alert('Registration failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Create Account</Text>

                <Input
                    label="Name"
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

                <Input
                    label="Email Address"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Input
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Input
                    label="Admin Secret Code (Optional)"
                    placeholder="Enter code for admin access"
                    value={adminCode}
                    onChangeText={setAdminCode}
                    autoCapitalize="none"
                />

                <Button
                    title="Sign Up"
                    onPress={handleRegister}
                    loading={loading}
                    style={{ marginTop: spacing.md }}
                />

                <View style={styles.footer}>
                    <Text style={styles.text}>Already have an account?</Text>
                    <Button
                        title="Log In"
                        onPress={() => navigation.navigate('Login')}
                        type="text"
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    title: {
        color: colors.text,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxl,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
    },
    text: {
        color: colors.textMuted,
        fontFamily: typography.fontFamily.regular,
    }
});
