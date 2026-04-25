import TrackPlayer, { AppKilledPlaybackBehavior, Capability, Event } from 'react-native-track-player';

export async function setupPlayer() {
  try {
    // Пробуем инициализировать плеер
    await TrackPlayer.setupPlayer({});
  } catch (e) {
    // Если уже инициализирован — отлично, идем дальше
  }

  // ВАЖНО: updateOptions должен быть ВНЕ блока catch, 
  // чтобы он обновлялся при каждом запуске приложения
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
      Capability.SeekTo,
    ],
    // Добавь это для Android
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    }
  });
}

export const PlaybackService = async function() {
    console.log('--- [BACKEND] СЕРВИС ЗАПУЩЕН И СЛУШАЕТ ---');

    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        console.log('--- [СИГНАЛ] ЖМУ PLAY ---');
        TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        console.log('--- [СИГНАЛ] ЖМУ PAUSE ---');
        TrackPlayer.pause();
    });

    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        console.log('--- [СИГНАЛ] ЖМУ NEXT ---');
        TrackPlayer.skipToNext();
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        console.log('--- [СИГНАЛ] ЖМУ PREVIOUS ---');
        TrackPlayer.skipToPrevious();
    });
};