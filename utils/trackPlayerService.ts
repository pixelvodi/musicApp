import TrackPlayer, { Capability, Event } from 'react-native-track-player';

export async function setupPlayer() {
  try {
    // Пытаемся получить текущее состояние, чтобы не инициализировать дважды
    await TrackPlayer.getState();
  } catch (e) {
    // Если ошибка — значит плеер не настроен, настраиваем:
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
  }
}

// Эта функция обязательна, даже если она пустая
export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
}