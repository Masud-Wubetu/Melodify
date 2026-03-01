import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { loginUser } from '../../api/userApi';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const login = useAuthStore((state) => state.login);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(email, password);
            // Backend returns { token, user: { _id, name, email, ... } }
            await login(data.user || data, data.token);
        } catch (error) {
            Alert.alert('Login failed', error.response?.data?.message || 'Something went wrong');
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
                <Text style={styles.title}>Welcome back to Melodify</Text>

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
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button
                    title="Log In"
                    onPress={handleLogin}
                    loading={loading}
                    style={{ marginTop: spacing.md }}
                />

                <View style={styles.footer}>
                    <Text style={styles.text}>Don't have an account?</Text>
                    <Button
                        title="Register"
                        onPress={() => navigation.navigate('Register')}
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
