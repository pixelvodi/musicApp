import { getDominantColor } from '@/utils/imgBackground';
import { useTheme } from '@/utils/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
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
  // Состояния
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumHowAboutListen, setAlbumHowAboutlisten] = useState<Album[]>([]);
  const [artist, setArtist] = useState<Artist[]>([]);
  const [albumColors, setAlbumColors] = useState<{ [key: number]: string }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalScreen, setModalScreen] = useState<'menu' | 'profile' | 'settings'>('menu');
  const [userName, setUserName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const {accentColor, setAccentColor}= useTheme();


  // Загрузка данных пользователя при входе в приложение
  useEffect(() => {
    const loadUserData = async () => {
      const id = await AsyncStorage.getItem('userId');
      const email = await AsyncStorage.getItem('userEmail');
      setUserId(id);

      if (id) {
        try {
          const res = await axios.get(`http://192.168.1.2:3000/getUserNameOrEmail?user_id=${id}`);
          if (res.data.avatar) {
            setUserAvatar(res.data.avatar);
          }
        } catch (err) {
          console.error('Ошибка загрузки аватара:', err);
        }
      }

      axios.get<Album[]>('http://192.168.1.2:3000/albums')
        .then(res => setAlbums(res.data))
        .catch(err => console.error('Ошибка альбомов:', err));
    };

    const loadAccentColor = async () => {
  const saved = await AsyncStorage.getItem('accentColor');
  if (saved) setAccentColor(saved);
};

loadUserData();
loadAccentColor();
  }, []);


  // === ЗАГРУЗКА ДАННЫХ ПРИ ОТКРЫТИИ МЕНЮ ИЛИ ПРОФИЛЯ ===
  useEffect(() => {
    if (modalScreen === 'profile' || modalVisible) {
      fetchUserData();
    }
  }, [modalScreen, modalVisible]);


  // === ФУНКЦИИ ===
  
  // Закрыть модальное окно
  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalScreen('menu'), 300);
  };

  const changeAccentColor = async (color: string) => {
  setAccentColor(color);
  await AsyncStorage.setItem('accentColor', color);
};

  // Получить данные пользователя с сервера
  const fetchUserData = async () => {
    if (!userId) return;

    try {
      const res = await axios.get(`http://192.168.1.2:3000/getUserNameOrEmail?user_id=${userId}`);

      if (res.data.email) setUserEmail(res.data.email);
      if (res.data.username) setUserName(res.data.username);
      if (res.data.avatar) {
        const avatarUrl = `${res.data.avatar}?t=${Date.now()}`;
        setUserAvatar(avatarUrl);
      }
    } catch (err) {
      console.error('Ошибка получения данных:', err);
    }
  };


  // Переключить режим редактирования
  const toggleEdit = async () => {
    if (isEditing) {
      try {
        await axios.post(`http://192.168.1.2:3000/users/updateUser`, {
          user_id: userId,
          new_username: userName,
          new_email: userEmail,
          new_avatar: userAvatar
        });
      } catch (err) {
        console.error('Ошибка сохранения:', err);
      }
    }
    setIsEditing(!isEditing);
  };

  // Открыть галерею для выбора фото
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Нужен доступ к галерее!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
};

  // Загрузить аватар на сервер
  const uploadAvatar = async (imageUri: string) => {
    if (!userId) return;

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('avatar', {
      uri: imageUri,
      name: `${userId}.jpg`,
      type: 'image/jpeg',
    } as any);

    try {
      const res = await axios.post('http://192.168.1.2:3000/users/uploadAvatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newAvatar = `${res.data.avatar_url}?t=${Date.now()}`;
      setUserAvatar(newAvatar);
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
    }
  };

  // === ЗАГРУЗКА АЛЬБОМОВ ===
  
  // Альбом "Как насчет?"
  useEffect(() => {
    axios.get<Album[]>('http://192.168.1.2:3000/albumsforhowaboutlisten')
      .then(res => setAlbumHowAboutlisten(res.data))
      .catch(err => console.error('Ошибка альбомов:', err));
  }, []);


  // Получить цвета альбомов
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


  // === АРТИСТЫ ===
  
  // Загрузка списка артистов
  useEffect(() => {
    axios.get<Artist[]>('http://192.168.1.2:3000/artist')
      .then(res => setArtist(res.data))
      .catch(err => console.error('Ошибка артистов:', err));
  }, []);


  // === ФУНКЦИИ ВЫХОДА ===
  
  // Выйти из аккаунта
  const clearReg = async () => {
    await AsyncStorage.multiRemove(['userEmail', 'userId']);
    router.replace('/auth/registration');
  };

  return {
    albums,
    albumHowAboutListen,
    albumColors,
    clearReg,
    artist,
    modalVisible,
    setModalVisible,
    modalScreen,
    setModalScreen,
    closeModal,
    userName,
    isEditing,
    setUserName,
    setIsEditing,
    toggleEdit,
    userEmail,
    setUserEmail,
    userAvatar,
    setUserAvatar,
    pickImage,
    userId,
    accentColor,
    setAccentColor,
    changeAccentColor
  };
};
