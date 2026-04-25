import TrackPlayer, { Event } from 'react-native-track-player';

export async function setupPlayer() {
  try {
    await TrackPlayer.getState();
  } catch (e) {
    await TrackPlayer.setupPlayer();
    
  }
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