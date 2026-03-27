import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { PlaybackService } from './utils/trackPlayerService';

registerRootComponent(App);

// Регистрация фонового сервиса
TrackPlayer.registerPlaybackService(() => PlaybackService);