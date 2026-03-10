// forData.tsx

type Track = {
  name: string;
  artist: string;
};

// utils/forData.ts

export let currentTrack: { name: string; artist: string } | null = null;

export const setCurrentTrack = (track: { name: string; artist: string }) => {
  currentTrack = track;
};


console.log(currentTrack)