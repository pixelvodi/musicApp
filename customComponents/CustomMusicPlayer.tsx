import { useTrack } from '@/utils/TrackContext';
import { playOrStop } from '@/utils/playMusic';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { Text } from '@react-navigation/elements';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import ImageColors from 'react-native-image-colors';
import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player';

const { width, height } = Dimensions.get('window');


export default function MusicPlayer() {
  const { currentTrack, currentArtist, currentImage } = useTrack();
  const [menuVisible, setMenuVisible] = useState(false);
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(); // Хук для управления линией песни
  const [lyricsArray, setLyricsArray] = useState<{id: string, text: string}[]>([]);
  const imageUrlString = Array.isArray(currentImage) ? currentImage[0] : currentImage;
  const [bgColor, setBgColor] = useState('#121212');
  
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentState = playbackState?.state ?? State.None;
  const isActuallyPlaying = currentState === State.Playing;

  // Анимация пластинки
  useEffect(() => {
    if (isActuallyPlaying) {
      const spin = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true,
        })
      );
      spin.start();
      animationRef.current = spin;
    } else {
      animationRef.current?.stop();
    }
    return () => animationRef.current?.stop();
  }, [isActuallyPlaying]);

  useEffect(() => {
    if (typeof imageUrlString === 'string') {
      ImageColors.getColors(imageUrlString, {
        fallback: '#121212',
        quality: 'high',
      }).then(colors => {
        let dominant = '#121212';
        switch (colors.platform) {
          case 'android':
            dominant = colors.dominant ?? colors.average ?? '#121212';
            break;
          case 'ios':
            dominant = colors.primary ?? colors.background ?? '#121212';
            break;
          case 'web':
            dominant = colors.dominant ?? '#121212';
            break;
        }
        setBgColor(dominant);
      }).catch(err => {
        console.warn("Ошибка при получении цвета изображения", err);
      });
    }
  }, [imageUrlString]);

  const fetchLyrics = async (trackId: string) => {
    try {
      const response = await fetch('http://192.168.1.2:3000/getTextTrack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ track_id: trackId })
      });
      const data = await response.json();
      console.log("Полученные данные с сервера:", data);
      return data.text;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  };
  const handleOpenMenu = async () => {
  setMenuVisible(true);
  
  if (currentTrack?.id) {
    // Принудительно приводим ID к строке, чтобы TS не ругался
    const trackIdStr = String(currentTrack.id);
    const rawText = await fetchLyrics(trackIdStr);
    
    if (rawText) {
      const parsed = rawText.split('\n')
        .filter((line: string) => line.trim() !== '')
        .map((line: string, index: number) => ({
          id: String(index),
          text: line.trim()
        }));
      setLyricsArray(parsed); // Сохраняем в стейт, который используется в FlatList
    }
  }
};

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {/* МИНИ-ПЛЕЕР */}
      <TouchableOpacity onPress={handleOpenMenu} activeOpacity={0.9}>
        <View style={[styles.layout, { backgroundColor: bgColor }]}>
          <View style={styles.darkLaouyt} pointerEvents="none">
            <View style={styles.vinylContainer}>
              <Animated.Image 
                source={require('./images/pngPLastinka.png')}
                style={[styles.vinyl, { transform: [{ rotate: rotateInterpolate }] }]}
                resizeMode="contain"
              />
              {typeof currentImage === 'string' && currentImage !== '' && (
                <Animated.Image 
                  source={{ uri: currentImage }}
                  style={[styles.centerImage, { transform: [{ rotate: rotateInterpolate }] }]}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
          
          <View style={styles.layoutTxtSong} pointerEvents="none">
            <Text numberOfLines={1} style={styles.textSong}>{currentTrack?.title || "Выберите трек"}</Text>
            <Text numberOfLines={1} style={styles.textArtist}>{currentArtist || "Неизвестен"}</Text>
          </View>

          <View style={styles.btn}>
            <TouchableOpacity onPress={() => playOrStop()}>
              <FontAwesome5 name={isActuallyPlaying ? "pause" : "play"} size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* ПОЛНОЭКРАННЫЙ ПЛЕЕР (MODAL) */}
      <Modal visible={menuVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setMenuVisible(false)}>
        <View style={[styles.fullScreenContainer, { backgroundColor: bgColor }]}>
          <View style={styles.darkLaouyt} pointerEvents="none">
          {/* Декоративный винил сбоку */}
          <View style={styles.sideVinylContainer} pointerEvents="none">
            <Image source={require('./images/pngPLastinka.png')} style={styles.sideVinyl} />
            {typeof currentImage === 'string' && currentImage !== '' && (
                <Animated.Image 
                  source={{ uri: currentImage }}
                  style={[styles.centerImageModal, { transform: [{ rotate: rotateInterpolate }] }]}
                  resizeMode="cover"
                />
              )}
          </View>
          </View>

          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.fullHeader}>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="arrow-back" size={30} color="white" />
              </TouchableOpacity>
              <View style={{ marginLeft: 20 }}>
                <Text style={styles.fullTitle}>{currentTrack?.title}</Text>
                <Text style={styles.fullArtist}>{currentArtist}</Text>
              </View>
            </View>

            {/* Текст песни (Скроллируемый элемент) */}
            <FlatList
              data={lyricsArray}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.lyricsList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Text style={[styles.lyricLine, styles.lyricInactive]}>
                  {item.text}
                </Text>
              )}
            />

            {/* Управление */}
            <View style={styles.fullControls}>
              <View style={styles.sliderRow}>
                <Text style={styles.timeLabel}>{formatTime(position)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  minimumTrackTintColor="#fff"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#fff"
                  onSlidingComplete={async (val) => await TrackPlayer.seekTo(val)}
                />
                <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.mainButtons}>
                <TouchableOpacity onPress={() => [TrackPlayer.skipToPrevious(), TrackPlayer.play()]}>
                  <Ionicons name="play-skip-back" size={25} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => playOrStop()}>
                  <FontAwesome name={isActuallyPlaying ? "pause-circle" : "play-circle"} size={50} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => [TrackPlayer.skipToNext(), TrackPlayer.play()]}>
                  <Ionicons name="play-skip-forward" size={25} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
          
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ... ваши старые стили для layout, darkLaouyt, vinylContainer и т.д. ...
  layout: {
    flexDirection: 'row', justifyContent: 'center', width: '95%',
    marginHorizontal: 20, height: 70, alignSelf: 'center', borderRadius: 10, padding: 12,
    borderWidth: 0.6, borderColor: '#fff', overflow: 'hidden',
  },
  darkLaouyt: { backgroundColor: "#000", position: "absolute", inset: 0, borderRadius: 10, opacity: 0.8 },
  vinylContainer: { position: "absolute", width: 210, height: 210, right: -100, top: -70, opacity: 0.8 },
  vinyl: { width: '100%', height: '100%' },
  centerImage: { width: 65, height: 65, position: 'absolute', zIndex: 2, borderRadius: 40, alignSelf: 'center', top: '35%' },
  layoutTxtSong: { position: "absolute", top: 12, left: 25, width: '70%' },
  textSong: { fontSize: 17, color: '#fff' },
  textArtist: { fontSize: 13, color: '#ccc' },
  btn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },

  // НОВЫЕ СТИЛИ ДЛЯ МОДАЛКИ
  fullScreenContainer: { flex: 1},
  sideVinylContainer: { position: 'absolute', right: -width * 1.05, top: height * 0.01, zIndex:1 },
  sideVinyl: { width: width * 2.1, height: width * 2.1},
  fullHeader: { flexDirection: 'row', padding: 20, marginTop: 30, alignItems: 'center' },
  fullTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  fullArtist: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  lyricsList: { paddingHorizontal: 30, paddingVertical: 40 },
  lyricLine: { fontSize: 20, marginBottom: 25, fontWeight: '600' },
  lyricActive: { color: 'white' },
  lyricInactive: { color: 'rgb(255, 255, 255)' },
  fullControls: { padding: 25, paddingBottom: 40 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  slider: { flex: 1, height: 40, marginHorizontal: 10 },
  timeLabel: { color: 'white', fontSize: 12, width: 35 },
  mainButtons: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, marginBottom: 30 },
  bigPlayBtn: { backgroundColor: 'white', width: 40, height: 40, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  fullFooter: { flexDirection: 'row', justifyContent: 'space-between', opacity: 0.7 },
  deviceText: { color: 'white', fontSize: 14 },
  centerImageModal: { width: 240, height: 240, position: 'absolute', opacity: 0.5, borderRadius: 130, alignSelf: 'center', top: '34%' },
  
});