import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';
import { PlaybackService } from './utils/trackPlayerService'; // Путь к вашему сервису

AppRegistry.registerComponent(appName, () => App);

// ОБЯЗАТЕЛЬНО:
TrackPlayer.registerPlaybackService(() => PlaybackService);