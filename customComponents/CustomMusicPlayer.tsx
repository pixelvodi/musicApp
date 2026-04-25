import { playOrStop } from '@/utils/playMusic';
import { useTrack } from '@/utils/TrackContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Text } from '@react-navigation/elements';
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as TrackPlayerModule from 'react-native-track-player';
import { State, usePlaybackState } from 'react-native-track-player';

// Создаем типизированную обертку, чтобы TS замолчал
const TrackPlayer = TrackPlayerModule as any;

export default function MusicPlayer() {
  const { colors } = useTheme();
  const { currentTrack, currentArtist, currentImage } = useTrack();
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // 1. Пользуемся встроенным хуком (он реактивный)
  const playbackState = usePlaybackState();
  
  // 2. Оставляем один ручной стейт для подстраховки
  const [manualIsPlaying, setManualIsPlaying] = useState(false);

  // 3. ЕДИНЫЙ интервал для синхронизации состояния
  useEffect(() => {
    const updateState = async () => {
      try {
        // Теперь TypeScript увидит это через звёздочку (*)
        const s = await TrackPlayer.getState(); 
        setManualIsPlaying(s === State.Playing);
      } catch (e) {
        // Игнорируем ошибки инициализации
      }
    };

    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, []);

  // 4. Итоговое решение: играет или нет?
  // В v4.0 playbackState — это объект { state: State }
  const currentState = playbackState?.state ?? State.None;
  const isActuallyPlaying = currentState === State.Playing || manualIsPlaying;

  // 5. Управление анимацией пластинки
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
      // Плавная остановка (опционально) или резкая:
      animationRef.current?.stop();
      animationRef.current = null;
    }
    return () => animationRef.current?.stop();
  }, [isActuallyPlaying]);

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
          
          {typeof currentImage === 'string' && currentImage !== '' && (
              <Animated.Image 
                source={{ uri: currentImage }}
                style={[
                  styles.centerImage, 
                  { transform: [{ rotate: rotateInterpolate }] }
                ]}
                resizeMode="cover"
              />
          )}
        </View>
      </View>
      
      <View style={styles.layoutTxtSong}>
        <Text numberOfLines={1} style={styles.textSong}>
          {currentTrack?.title || "Выберите трек"}
        </Text>
        <Text numberOfLines={1} style={styles.textArtist}>
          {currentArtist || "Неизвестен"}
        </Text>
      </View>

      <View style={styles.btn}>
        <TouchableOpacity onPress={async () => {
          await playOrStop();
        }}>
          <FontAwesome5 
            name={isActuallyPlaying ? "pause" : "play"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
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

