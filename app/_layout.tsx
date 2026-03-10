import CustomNavBar from '@/customComponents/customNavBar';
import { TrackProvider } from '@/utils/TrackContext';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function AppLayout() {
  const [fontsLoaded] = useFonts({
    'MyFont': require('@/assets/fonts/Onest/Onest-Light.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <TrackProvider>    {/* 👍 Контекст на всём приложении */}
      <View style={styles.container}>
        
        <Tabs
          tabBar={(props) => <CustomNavBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        />

        <Toast />
      </View>
    </TrackProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
