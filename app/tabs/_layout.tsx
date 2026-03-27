import MusicPlayer from '@/customComponents/CustomMusicPlayer';
import CustomNavBar from '@/customComponents/customNavBar';
import { setupPlayer } from '@/utils/trackPlayerService';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  const [fontsLoaded] = useFonts({
    'MyFont': require('@/assets/fonts/Marmelad-Regular.ttf'),
  });

  useEffect(() => {
    setupPlayer(); 
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      {/* Плеер */}
      <View style={styles.playerContainer}>
        <MusicPlayer />
      </View>

      {/* Навигация */}
      <Tabs
        tabBar={(props) => <CustomNavBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="library" options={{ title: 'Library' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    position: 'absolute',
    bottom: 65, // Плеер над кнопками
    left: 0,
    right: 0,
    zIndex: 99,
  },
});