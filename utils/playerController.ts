import TrackPlayer, { State } from "react-native-track-player";

export const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
  } catch (e) {
    console.log("Player setup error:", e);
  }
};

export const playOrStop = async () => {
  try {
    const state = await TrackPlayer.getPlaybackState();
    // Если state — объект, берем его поле state, иначе оставляем как есть
    const currentState = typeof state === 'object' && 'state' in state ? state.state : state;

    if (currentState === State.Playing || currentState === State.Buffering) {
      await TrackPlayer.pause();
      return { isPlaying: false };
    } else {
      await TrackPlayer.play();
      return { isPlaying: true };
    }
  } catch (e) {
    console.error("playOrStop error:", e);
    return { isPlaying: false };
  }
};

export const playQueue = async (queue: any[], startIndex = 0) => {
  await setupPlayer();
  await TrackPlayer.reset();

  const tracks = queue.map(item => ({
    id: String(item.id),
    url: item.audioUrl,
    title: item.title,
    artist: item.artist,
    artwork: item.artwork,
    contentType: 'audio/mpeg'
  }));

  await TrackPlayer.add(tracks);
  await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
};