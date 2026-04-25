import { TrackProvider } from '@/utils/TrackContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { setupPlayer } from '../utils/trackPlayerService';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'MyFont': require('@/assets/fonts/Onest/Onest-Light.ttf'),
  });

  useEffect(() => {
    // Инициализируем плеер один раз при запуске приложения
    setupPlayer();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <TrackProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
      </Stack>
      <Toast />
    </TrackProvider>
  );
}