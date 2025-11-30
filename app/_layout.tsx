import React from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '@/context/AppContext';
import { useAppTheme } from '@/hooks/useAppTheme';

function ThemedStack() {
    const { colors } = useAppTheme();

    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background }
            }}
        >
            {/* Tabs sem header próprio (usa o header do TabsLayout) */}
            <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
            />

            {/* Tela de anotação com header */}
            <Stack.Screen
                name="notes/[id]"
                options={{ headerShown: true, title: 'Anotação' }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AppProvider>
            <ThemedStack />
        </AppProvider>
    );
}
