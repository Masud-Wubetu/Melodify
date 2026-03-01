import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Stack = createNativeStackNavigator();

const MyTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.surfaceLight,
    },
};

const RootNavigator = () => {
    const { token, initializeAuth } = useAuthStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            await initializeAuth();
            setIsReady(true);
        };
        init();
    }, [initializeAuth]);

    if (!isReady) {
        return <LoadingSpinner />;
    }

    return (
        <NavigationContainer theme={MyTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token ? (
                    <Stack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
