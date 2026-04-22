// android/src/logic/logicLibrary.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export type FavoriteTrack = {
    id: number;
    title: string;
    artist: string;
    audioUrl: string;
    artwork: string | null;
};

export const useLibraryLikesTrackLogic = () => {
    const [favoritesTrack, setFavoritesTrack] = useState<FavoriteTrack[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchfavoritesTrack = useCallback(async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.log("ID пользователя не найден в хранилище");
                setLoading(false);
                return;
            }

            // Замени 192.168.1.2 на свой актуальный localIP, если он меняется
            const response = await axios.get(`http://192.168.1.2:3000/favorites/${userId}`);
            setFavoritesTrack(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке избранного:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchfavoritesTrack();
    }, [fetchfavoritesTrack]);

    return { fetchfavoritesTrack, loading,  favoritesTrack };
};