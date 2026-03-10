// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  useEffect(() => {
    const checkUser = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      console.log("Checked user email:", email);

      if (email) {
        router.replace('/tabs/home'); // Пользователь зарегистрирован
      } else {
        router.replace('/auth/registration'); // Пользователь не зарегистрирован
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
