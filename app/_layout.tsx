import { TrackProvider } from '@/utils/TrackContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { PlaybackService, setupPlayer } from '../utils/trackPlayerService';
// index.js
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import TrackPlayer from 'react-native-track-player';


// РЕГИСТРАЦИЯ СЕРВИСА ДОЛЖНА БЫТЬ ЗДЕСЬ
TrackPlayer.registerPlaybackService(() => PlaybackService);

// Эта функция заменяет стандартный запуск Expo
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);

const requestPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    console.log("Notification permission:", granted);
  }
};

const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
    }
};

// Вызовите это в useEffect при запуске
// app/_layout.tsx
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'MyFont': require('@/assets/fonts/Onest/Onest-Light.ttf'),
  });

  useEffect(() => {
    async function init() {
      // Запрашиваем разрешения
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS' as any);
      }
      
      // Инициализируем плеер
      try {
        await setupPlayer();
        console.log("--- ПЛЕЕР ГОТОВ ---");
      } catch (e) {
        console.log("--- ОШИБКА ИНИЦИАЛИЗАЦИИ ---", e);
      }
    }

    init();
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