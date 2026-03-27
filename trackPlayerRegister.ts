import TrackPlayer from "react-native-track-player";
import { playbackService } from "./utils/playbackService";

TrackPlayer.registerPlaybackService(() => playbackService);