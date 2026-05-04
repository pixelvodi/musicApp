import React, { createContext, useContext, useState } from "react";
import { Event, useTrackPlayerEvents } from "react-native-track-player";

type Track = {
  id: string | number;
  title: string;
  album_id: number;
  name: string;
  audioUrl?: string;
  artist?: string;
  artwork?: string;
};

type TrackContextType = {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  currentArtist: string | null;
  setCurrentArtist: (artist: string | null) => void;
  currentImage: string | null;
  setCurrentImage: (image: string | null) => void;
};

const TrackContext = createContext<TrackContextType>({
  currentTrack: null,
  setCurrentTrack: () => {},
  currentArtist: null,
  setCurrentArtist: () => {},
  currentImage: null,
  setCurrentImage: () => {},
});

export const TrackProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentArtist, setCurrentArtist] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
      const { track } = event;
      
      setCurrentTrack({
        id: track.id ?? '',
        title: track.title ?? 'Unknown Title',
        album_id: (track as any).album_id ?? 0,
        name: track.title ?? '',
        audioUrl: track.url as string,
      });
      setCurrentArtist(track.artist ?? 'Неизвестен');
      
      const artwork = (track as any).artwork;
      if (artwork) {
        setCurrentImage(artwork);
      }
    }
  });

  return (
    <TrackContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        currentArtist,
        setCurrentArtist,
        currentImage,
        setCurrentImage,
      }}
    >
      {children}
    </TrackContext.Provider>
  );
};

export const useTrack = () => useContext(TrackContext);