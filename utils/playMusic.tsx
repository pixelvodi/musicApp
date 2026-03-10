  import axios from 'axios';
import { Audio } from 'expo-av';

  let currentSound: Audio.Sound | null = null; // можно использовать замыкание
  let currentQueue: string[] = [];
  let currentIndex = 0;
  let isChangingTrack = false;
  let lastPlayTimestamp = 0;
  const COOLDOWN_MS = 1000; // 2 секунды
  let onTrackChangeGlobal: ((index: number) => void) | null = null;
  let onPlayStateChange: ((playing: boolean) => void) | null = null;


  export type queueTracks = {
    id: number;
    name: string;
    audioUrl: string;
  }

  export const fetchQueue = async (queue: number[]): Promise<number[]> => {
    try {
      console.log("получено в fetchQueue", queue);
      const response = await axios.post<queueTracks[]>('http://192.168.1.2:3000/getQueue', {queue});
      return response.data.map(item => item.id);
    } catch (error) {
      console.error('Ошибка загрузки очереди: p', error);
      return [];
    }
  };

  export const playQueue = async(
    queue: string[],
    startIndex = 0,
    onTrackChange?: (index: number) => void
  ) => {
    currentQueue = queue;
    currentIndex = startIndex;
    onTrackChangeGlobal = onTrackChange ?? null;

    await playTrackByIndex(currentIndex, onTrackChange);
    
  }

  const playTrackByIndex = async (
    index: number,
    onTrackChange?: (index: number) => void
  ) => {
    const now = Date.now();
    if (now - lastPlayTimestamp < COOLDOWN_MS) return;
    lastPlayTimestamp = now;

    if (index >= currentQueue.length) return;

    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: currentQueue[index] },
      { shouldPlay: true }
    );

    currentSound = sound;
    currentIndex = index;
    onTrackChangeGlobal?.(index);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;

      onPlayStateChange?.(status.isPlaying);

      if (status.didJustFinish) {
        playTrackByIndex(currentIndex + 1);
      }
    });

  };

  export const setOnPlayStateChange = (cb: (playing: boolean) => void) => {
    onPlayStateChange = cb;
  };

  export const getCurrentSound = () => currentSound;
  export const playOrStop = async () => {
    const sound = currentSound;
    if (!sound) return null;
    
    const status = await sound?.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
        console.log("Результат playOrStop", status.isPlaying)
        return {isPlaying: false};
      }
      else {
        await sound.playAsync();
        
        return {isPlaying: true};
      }
    }
    return null;
  }