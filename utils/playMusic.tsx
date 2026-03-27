import axios from 'axios';
import TrackPlayer, {
  Capability,
  Event,
  State
} from 'react-native-track-player';

// Типизация для данных с сервера
export type QueueTrack = {
  id: number;
  name: string;
  audioUrl: string;
  artist?: string; // Track Player любит метаданные
  artwork?: string;
};

/**
 * Загрузка ID треков (если нужно оставить логику получения массива ID)
 */
/**
 * Загрузка ПОЛНЫХ данных треков (с именами, артистами и обложками)
 */
export const fetchQueue = async (ids: number[]): Promise<QueueTrack[]> => {
  try {
    const response = await axios.post('http://192.168.1.2:3000/getQueue', { queue: ids });
    return response.data; // Возвращаем массив объектов [{id, title, artist, audioUrl...}]
  } catch (error) {
    console.error('Ошибка загрузки очереди:', error);
    return [];
  }
};

export const playQueue = async (tracks: any[], startIndex = 0) => {
  try {
    // 1. Убираем пустые элементы
    const validTracks = (tracks || []).filter(t => t && (t.audioUrl || typeof t === 'string'));

    if (validTracks.length === 0) {
      console.error("Нет треков для воспроизведения");
      return;
    }

    // 2. Форматируем для плеера
    const formattedTracks = validTracks.map((track, index) => {
      if (typeof track === 'string') {
        return { id: `id-${index}`, url: track, title: 'Track', artist: 'Unknown' };
      }
      return {
        id: String(track.id || `id-${index}`),
        url: track.audioUrl, // Берем готовую ссылку с сервера
        title: track.title || track.name,
        artist: track.artist,
        artwork: track.artwork
      };
    });

    await TrackPlayer.reset();

    // 3. ВКЛЮЧАЕМ УВЕДОМЛЕНИЯ (Без этого может не играть на Android)
    await TrackPlayer.updateOptions({
  // Обязательно добавьте эти пункты:
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo, // чтобы работал ползунок времени
      ],
      // То, что будет видно в компактном режиме (на заблокированном экране)
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      // Иконка для уведомления (Android) - должна лежать в папке res/drawable
      // Если её нет, можно пока не указывать или использовать 'ic_launcher'
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });

    await TrackPlayer.add(formattedTracks);
    await TrackPlayer.skip(startIndex);
    await TrackPlayer.play();

    console.log("✅ Играет:", formattedTracks[startIndex].title);
  } catch (e) {
    console.error("Ошибка плеера:", e);
  }
};
/**
 * Основная функция запуска плеера
 * @param tracks - массив URL строк или объектов Track
 */



export const playOrStop = async () => {
  const state = await TrackPlayer.getState();
  
  if (state === State.Playing) {
    await TrackPlayer.pause();
    return { isPlaying: false };
  } else {
    await TrackPlayer.play();
    return { isPlaying: true };
  }
};

/**
 * Подписка на изменение состояния (играет/нет)
 */
export const setOnPlayStateChange = (cb: (playing: boolean) => void) => {
  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    const isPlaying = event.state === State.Playing;
    cb(isPlaying);
  });
};

/**
 * Подписка на смену трека
 */
export const setOnTrackChange = (cb: (index: number) => void) => {
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
    if (event.index !== undefined) {
      cb(event.index);
    }
  });
};

export const getCurrentSound = () => TrackPlayer; // Возвращаем сам объект плеера