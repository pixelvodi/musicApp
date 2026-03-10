import { getCurrentSound, playOrStop, setOnPlayStateChange } from '@/utils/playMusic';
import { useTrack } from '@/utils/TrackContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Text } from '@react-navigation/elements';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function MusicPlayer() {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const { currentTrack } = useTrack();
  const {currentArtist} = useTrack();
  const { currentImage } = useTrack();
  const rotation = useRef(new Animated.Value(0)).current;
  const [isPlaying, setIsPlaying] = useState(false);
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      // Запускаем бесконечное вращение
      rotation.setValue(0);
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
      // Останавливаем анимацию
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      // Опционально: сбрасываем поворот
      // rotation.setValue(0);
    }

    // Cleanup при размонтировании
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isPlaying]);

  useEffect(() => {
  const checkPlayback = async () => {
    const sound = getCurrentSound();
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setIsPlaying(status.isPlaying);
      }
    }
  };

  // Проверяем каждые 500 мс (временно!)
  // const interval = setInterval(checkPlayback, 500);
  // return () => clearInterval(interval);
}, []);

useEffect(() => {
  setOnPlayStateChange(setIsPlaying);
}, []);


  const buttonView = isPlaying
    ? <FontAwesome5 name="play" size={30} color="white"/>
    : <FontAwesome5 name="play" size={24} color="black" />

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  
  return (
    <View style={styles.layout}>
      <View style={styles.darkLaouyt}>
        <View style={styles.vinylContainer}>
          {/* Вращающаяся пластинка */}
          <Animated.Image 
            source={require('./images/pngPLastinka.png')}
            style={[
              styles.vinyl, 
              { transform: [{ rotate: rotateInterpolate }] }
            ]}
            resizeMode="contain"
          />
          
          {/* Центральное изображение (кремация) - НЕ анимированное */}
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
          <TouchableOpacity  onPress={async () => {
            const result = await playOrStop(); // ← получаем результат напрямую
            console.log("Результат", result);
            if (result !== null) {
              console.log("Результат", result.isPlaying)
              setIsPlaying(result.isPlaying);
            } 
          }}>
                {isPlaying ? (
            <FontAwesome5 name="pause" size={30} color="white" />
          ) : (
            <FontAwesome5 name="play" size={30} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
    

  );
};

const styles = StyleSheet.create({
  layout: {
    position: 'absolute',
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

