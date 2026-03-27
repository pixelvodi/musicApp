import { playOrStop } from '@/utils/playMusic';
import { useTrack } from '@/utils/TrackContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Text } from '@react-navigation/elements';
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';



export default function MusicPlayer() {
  const { colors } = useTheme();
  const { currentTrack, currentArtist, currentImage } = useTrack();
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // 1. Получаем состояние через официальный хук
  const playbackState = usePlaybackState();
  const [manualState, setManualState] = useState<State>(State.None);

  // 2. Интервал для "принудительного" обновления (если хук тормозит)
  useEffect(() => {
    const interval = setInterval(async () => {
      const s = await TrackPlayer.getState();
      if (s !== manualState) setManualState(s);
    }, 500);
    return () => clearInterval(interval);
  }, [manualState]);

  // 3. Определяем итоговый статус (играет или нет)
  const currentState = (playbackState && typeof playbackState === 'object') 
    ? playbackState.state 
    : playbackState;

  // Кнопка активна, если либо хук, либо ручной опрос говорят "Playing"
  const isActuallyPlaying = currentState === State.Playing || manualState === State.Playing;

  // 4. ОДИН useEffect для анимации
  useEffect(() => {
    if (isActuallyPlaying) {
      const spin = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();
      animationRef.current = spin;
    } else {
      animationRef.current?.stop();
      animationRef.current = null;
    }
    return () => animationRef.current?.stop();
  }, [isActuallyPlaying]);

  const [manualIsPlaying, setManualIsPlaying] = useState(false);

useEffect(() => {
  const interval = setInterval(async () => {
    const s = await TrackPlayer.getState();
    setManualIsPlaying(s === State.Playing);
  }, 500); // Опрашиваем плеер 2 раза в секунду

  return () => clearInterval(interval);
}, []);



  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.layout}>
      <View style={styles.darkLaouyt}>
        <View style={styles.vinylContainer}>
          <Animated.Image 
            source={require('./images/pngPLastinka.png')}
            style={[
              styles.vinyl, 
              { transform: [{ rotate: rotateInterpolate }] }
            ]}
            resizeMode="contain"
          />
          
          {typeof currentImage === 'string' && (
              <Animated.Image 
                source={{ uri: currentImage }}
                style={[styles.centerImage, { transform: [{ rotate: rotateInterpolate }] }]}
                resizeMode="cover"
              />
          )}
        </View>
      </View>
      
      <View style={styles.layoutTxtSong}>
        <Text style={styles.textSong}>{currentTrack?.title}</Text>
        <Text style={styles.textArtist}>{currentArtist}</Text>
      </View>

      <View style={styles.btn}>
        <TouchableOpacity onPress={async () => {
          await playOrStop();
        }}>
          <FontAwesome5 
            name={isActuallyPlaying ? "pause" : "play"} 
            size={30} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: '95%',
    marginHorizontal: 20,
    height: 70,
    alignSelf: 'center',
    borderRadius: 10,
    padding: 12,
    overflow: 'hidden',
    borderWidth: 0.6,
    borderColor: '#fff',
    
  },
  darkLaouyt: {
    backgroundColor: "#000",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 10,
    padding: 12,
    overflow: "hidden",
    opacity: 0.8
  },
  vinylContainer: {
    position: "absolute",
    width: 210,
    height: 210,
    marginLeft: 230,
    bottom: 0,
    top: -70,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8
  },
  vinyl: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  centerImage: {
    width: 65, // Размер центрального изображения
    height: 65,
    position: 'absolute',
    zIndex: 2, // Поверх пластинки
    borderRadius: 40, // Круглая форма
  },
  layoutTxtSong: {
    position: "absolute",
    top: 12,
    left: 25,
    width: '70%'
  },
  textSong: {
    fontSize: 17,
    color: '#fff',
    fontFamily: 'MyFont'
  },
  textArtist: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'MyFont'
  },
  btn: {
  position: 'absolute',
  right: 12, // отступ от правого края (можете изменить)
  top: 0,
  bottom: 0,
  justifyContent: 'center', // центрирует по вертикали
  alignItems: 'center',
  width: 40, // фиксированная ширина для удобства
},
});

