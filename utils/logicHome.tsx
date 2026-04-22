import { getDominantColor } from '@/utils/imgBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export type Album = {
  id: number;
  name: string;
  imageUrl: string;
  artist: string;
  img_artist: string;
  track_count: number;
};

export type Artist = {
  id: number;
  name: string;
  img_artist: string;
};

export const useHomeLogic = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumHowAboutListen, setAlbumHowAboutlisten] = useState<Album[]>([]);
  const [artist, setArtist] = useState<Artist[]>([]);
  const [albumColors, setAlbumColors] = useState<{ [key: number]: string }>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const id = await AsyncStorage.getItem('userId');
      const email = await AsyncStorage.getItem('userEmail');
      setUserId(id);
      console.log(`На главной. Пользователь: ${email} (ID: ${id})`);
    };

    checkUser();

    axios.get<Album[]>('http://192.168.1.2:3000/albums')
      .then(res => setAlbums(res.data))
      .catch(err => console.error('Error fetching albums:', err));
  }, []);

  useEffect(() => {
    axios.get<Album[]>('http://192.168.1.2:3000/albumsforhowaboutlisten')
      .then(res => setAlbumHowAboutlisten(res.data))
      .catch(err => console.error('Error fetching albums:', err));
  }, []);

  useEffect(() => {
    if (albums.length === 0) return;

    const fetchColors = async () => {
      const colorsMap: { [key: number]: string } = {};
      for (const album of albums) {
        if (album.imageUrl) {
          try {
            const color = await getDominantColor(album.imageUrl);
            colorsMap[album.id] = color;
          } catch {
            colorsMap[album.id] = '#121212';
          }
        }
      }
      setAlbumColors(colorsMap);
    };

    fetchColors();
  }, [albums]);

  const clearReg = async () => {
    await AsyncStorage.removeItem('userEmail');
    router.replace('/auth/registration');
  };

  useEffect(() => {
    axios.get<Artist[]>('http://192.168.1.2:3000/artist')
      .then(res => setArtist(res.data))
      .catch(err => console.error('Ошибка артистов:', err));
  }, []);

  return { albums, albumHowAboutListen, albumColors, clearReg, artist };
};
