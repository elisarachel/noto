import { Stack } from 'expo-router';
import { AppProvider } from '@/context/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notes/[id]" options={{ headerShown: true, title: 'Anotação' }} />
      </Stack>
    </AppProvider>
  );
}