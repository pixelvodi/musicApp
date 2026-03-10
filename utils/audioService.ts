// utils/audioService.ts
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Настройка аудио-сессии
export const setupAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    
    console.log('✅ Audio setup complete');
  } catch (error) {
    console.error('❌ Audio setup error:', error);
  }
};

// Настройка уведомлений (Android)
export const setupNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('playback', {
      name: 'Music Playback',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [],
      sound: null,
      showBadge: false,
    });
  }
  
  await Notifications.requestPermissionsAsync();
};

// Создание уведомления "Сейчас играет"
export const updateNowPlayingNotification = async (
  title: string,
  artist: string,
  isPlaying: boolean,
  artworkUri?: string
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: artist,
      data: { isPlaying },
      // ❌ УДАЛЕНО: silent: true (не существует в вашей версии)
      // ✅ Вместо этого используем priority: LOW
      priority: Notifications.AndroidNotificationPriority.LOW,
    },
    trigger: null,
    identifier: 'now-playing',
  });
};

// Очистка уведомления
export const clearNowPlayingNotification = async () => {
  await Notifications.dismissNotificationAsync('now-playing');
};

// Глобальные переменные
let currentSound: Audio.Sound | null = null;
let currentTrackIndex = 0;
let currentQueue: any[] = [];

export type TrackData = {
  id: number;
  name: string;
  audioUrl: string;
  artist?: string;
  album?: string;
  cover?: string;
  duration?: number;
};

// Воспроизведение очереди
export const playQueue = async (
  queue: TrackData[],
  startIndex = 0,
  onTrackChange?: (index: number) => void,
  onPlayStateChange?: (playing: boolean) => void
) => {
  currentQueue = queue;
  currentTrackIndex = startIndex;
  
  await setupAudio();
  await setupNotifications();
  
  await playTrack(startIndex, onTrackChange, onPlayStateChange);
};

// Воспроизведение трека
const playTrack = async (
  index: number,
  onTrackChange?: (index: number) => void,
  onPlayStateChange?: (playing: boolean) => void
) => {
  if (index >= currentQueue.length) return;
  
  const track = currentQueue[index];
  
  if (currentSound) {
    await currentSound.unloadAsync();
    currentSound = null;
  }
  
  await updateNowPlayingNotification(
    track.name,
    track.artist || 'Неизвестный исполнитель',
    true,
    track.cover
  );
  
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: track.audioUrl },
      { 
        shouldPlay: true,
        positionMillis: 0,
      }
    );
    
    currentSound = sound;
    currentTrackIndex = index;
    onTrackChange?.(index);
    onPlayStateChange?.(true);
    
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (!status.isLoaded) return;
      
      if (status.isPlaying !== undefined) {
        onPlayStateChange?.(status.isPlaying);
      }
      
      if (status.didJustFinish) {
        if (index + 1 < currentQueue.length) {
          await playTrack(index + 1, onTrackChange, onPlayStateChange);
        } else {
          onPlayStateChange?.(false);
          await clearNowPlayingNotification();
        }
      }
    });
  } catch (error) {
    console.error('Ошибка воспроизведения трека:', error);
  }
};

// Play/Pause
export const togglePlayPause = async () => {
  if (!currentSound) return null;
  
  const status = await currentSound.getStatusAsync();
  if (!status.isLoaded) return null;
  
  if (status.isPlaying) {
    await currentSound.pauseAsync();
    return { isPlaying: false };
  } else {
    await currentSound.playAsync();
    return { isPlaying: true };
  }
};

// Следующий трек
export const skipToNext = async (onTrackChange?: (index: number) => void) => {
  if (currentTrackIndex + 1 < currentQueue.length) {
    await playTrack(currentTrackIndex + 1, onTrackChange);
  }
};

// Предыдущий трек
export const skipToPrevious = async (onTrackChange?: (index: number) => void) => {
  if (currentTrackIndex > 0) {
    await playTrack(currentTrackIndex - 1, onTrackChange);
  }
};

// Остановка
export const stopPlayback = async () => {
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
  }
  await clearNowPlayingNotification();
};

// Получение текущего звука
export const getCurrentSound = () => currentSound;

// Очистка
export const cleanupAudio = async () => {
  await stopPlayback();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    playsInSilentModeIOS: false,
  });
};