import { TrackProvider } from '@/utils/TrackContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'MyFont': require('@/assets/fonts/Onest/Onest-Light.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <TrackProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Это заставит Expo Router искать папку tabs и её layout */}
        <Stack.Screen name="tabs" />
      </Stack>
      <Toast />
    </TrackProvider>
  );
}