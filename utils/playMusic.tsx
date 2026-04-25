import axios from 'axios';
// Импортируем сам TrackPlayer и нужные перечисления/типы отдельно
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State
} from 'react-native-track-player';

// УДАЛИ строчку: const TrackPlayer = ... (она больше не нужна)

// Типизация для данных с сервера
export type QueueTrack = {
  id: number;
  name: string;
  audioUrl: string;
  artist?: string; // Track Player любит метаданные
  artwork?: string;
};

export const fetchQueue = async (ids: number[]): Promise<QueueTrack[]> => {
  const url = 'http://192.168.1.2:3000/getQueue';
  console.log("--- ОТПРАВКА ЗАПРОСА НА:", url, "с ID:", ids);

  try {
    const response = await axios.post(url, { queue: ids });
    console.log("--- ОТВЕТ ПОЛУЧЕН, количество треков:", response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('--- ОШИБКА FETCH:', error.message);
    if (error.response) {
       console.error('Статус сервера:', error.response.status);
    }
    return [];
  }
};

export const playQueue = async (tracks: any[], startIndex = 0) => {
  try {
    // 1. Фильтруем только те треки, у которых есть ссылка на музыку
    const validTracks = (tracks || []).filter(t => t && t.audioUrl);
    
    if (validTracks.length === 0) {
      console.log("❌ Нет треков с рабочими ссылками (filename в базе NULL)");
      return;
    }

    // 2. Формируем объекты для TrackPlayer
    const formattedTracks = validTracks.map((track, index) => ({
      id: String(track.id || `id-${index}`),
      url: track.audioUrl,
      title: track.title || "Без названия",
      artist: track.artist || "Неизвестный артист",
      // ВАЖНО: Добавляем поле artwork, которое мы берем из ответа сервера
      artwork: track.artwork ? track.artwork : undefined
    }));

    // 3. Проверяем в консоли, что artwork теперь есть!
    console.log("✅ Данные для плеера (с обложкой):", JSON.stringify(formattedTracks[0], null, 2));

    // ВЫЗЫВАЕМ НАПРЯМУЮ
    await TrackPlayer.reset(); 

    await TrackPlayer.updateOptions({
    // Оставляем только основной список
    capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
    ],
    // Настройки для Android в v5.0 теперь минималистичны
    android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
});

    await TrackPlayer.add(formattedTracks);
    await TrackPlayer.skip(startIndex);
    await TrackPlayer.play();

    console.log("✅ Играет:", formattedTracks[startIndex].title);
  } catch (e) {
    console.error("Ошибка плеера:", e);
  }
};


export const playOrStop = async () => {
  // 1. Используем getPlaybackState() вместо getState()
  const playbackState = await TrackPlayer.getPlaybackState();
  
  // 2. В новой версии состояние лежит в поле .state
  // Проверяем, играет ли трек в данный момент
  if (playbackState.state === State.Playing) {
    await TrackPlayer.pause();
    return { isPlaying: false };
  } else {
    await TrackPlayer.play();
    return { isPlaying: true };
  }
};

export const setOnPlayStateChange = (cb: (playing: boolean) => void) => {
  // ДОБАВЬТЕ TrackPlayer.
  TrackPlayer.addEventListener(Event.PlaybackState, (event: any) => { 
    const state = event.state !== undefined ? event.state : event;
    cb(state === State.Playing);
  });
};
/**
 * Подписка на смену трека
 */
export const setOnTrackChange = (cb: (index: number) => void) => {
  // Указываем : any
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event: any) => {
    if (event && event.index !== undefined) {
      cb(event.index);
    }
  });
};

export const getCurrentSound = () => TrackPlayer; // Возвращаем сам объект плеера