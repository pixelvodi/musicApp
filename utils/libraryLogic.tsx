import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { API_URL } from './apiConfig';

export type FavoriteTrack = {
    id: number;
    title: string;
    artist: string;
    audioUrl: string;
    artwork: string | null;
};

export const useLibraryLogic = () => {
    const [favorites, setFavorites] = useState<FavoriteTrack[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = useCallback(async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.log("ID пользователя не найден в хранилище");
                setLoading(false);
                return;
            }

            // Замени 192.168.1.2 на свой актуальный localIP, если он меняется
            const response = await axios.get(`${API_URL}/favoritesAlbum/${userId}`);
            setFavorites(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке избранного:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    return { favorites, loading, fetchFavorites };
};