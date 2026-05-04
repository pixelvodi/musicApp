// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  useEffect(() => {
    const checkUser = async () => {
      const keys = await AsyncStorage.getAllKeys();
      console.log("📦 All AsyncStorage keys:", keys);
      
      const email = await AsyncStorage.getItem('userEmail');
      const userId = await AsyncStorage.getItem('userId');
      const appVersion = await AsyncStorage.getItem('appVersion');
      console.log("Checked user email:", email);
      console.log("Checked user ID:", userId);
      console.log("App version:", appVersion);

      // Если нет appVersion - значит старый аккаунт или первая установка
      if (!appVersion) {
        await AsyncStorage.clear();
        router.replace('/auth/registration');
      } else if (email && userId) {
        router.replace('/tabs/home');
      } else {
        router.replace('/auth/registration');
      }
    };

    checkUser();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
