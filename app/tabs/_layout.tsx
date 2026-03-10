import MusicPlayer from '@/customComponents/CustomMusicPlayer';
import CustomNavBar from '@/customComponents/customNavBar';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  const [fontsLoaded] = useFonts({
    'MyFont': require('@/assets/fonts/Marmelad-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.playerContainer}>
        <MusicPlayer name={''} artist={''} />
      </SafeAreaView>

      <Tabs
        tabBar={(props) => <CustomNavBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  playerContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
    padding: 10,
  },
});
