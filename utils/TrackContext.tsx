import React, { createContext, useContext, useState } from "react";

type Track = {
  id: number;
  title: string;
  album_id: number;
  name: string;
  audioUrl?: string;
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
