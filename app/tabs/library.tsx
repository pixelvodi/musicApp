import { useLibraryLikesTrackLogic } from '@/utils/libraryLikesTrackLogicc';
import { useTrack } from '@/utils/TrackContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FavoriteTrack, useLibraryLogic } from "../../utils/libraryLogic";

export default function Library() {
    const { favorites, loading, fetchFavorites } = useLibraryLogic();
    const { favoritesTrack } = useLibraryLikesTrackLogic(); // Получаем избранные треки из нового хука
    const { currentTrack, setCurrentTrack, setCurrentArtist, setCurrentImage } = useTrack();
    const params = useLocalSearchParams();
    const { id, name, imageUrl, artist } = params;
    const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<FavoriteTrack | null>(null);
    const [favoriteAlbums, setFavoriteAlbums] = useState<any[]>([]);

    const fetchFavoriteAlbums = async () => {
    if (!currentUserId) return;
    try {
        const response = await fetch(`http://192.168.1.2:3000/favoritesAlbum/${currentUserId}`);
        const data = await response.json();
        setFavoriteAlbums(data);
    } catch (e) {
        console.error("Ошибка загрузки альбомов", e);
    }
};

useEffect(() => {
    if (currentUserId) {
        fetchFavoriteAlbums();
    }
}, [currentUserId]);

    useEffect(() => {
  const loadId = async () => {
    const id = await AsyncStorage.getItem('userId');
    setCurrentUserId(id);
  };
  loadId();
}, []);

    // Отрисовка одного трека (вынесена из return для чистоты)
    const renderAlbum = ({ item }: { item: any }) => (
    <TouchableOpacity 
        style={styles.albumCard}
        onPress={() => router.push({
            pathname: '/tabs/albumDetails',
            params: { id: item.id, name: item.name, imageUrl: item.imageUrl, artist: item.artist }
        })}
    >
        <Image source={{ uri: item.imageUrl }} style={styles.albumImage} />
        <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
);

    const removeFromFavorites = async (trackId: number) => {
        console.log("Попытка удаления трека ID:", trackId);
        if (!currentUserId) return;
        try {
            const response = await fetch(`http://192.168.1.2:3000/favoritesAlbum/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: parseInt(currentUserId),
                track_id: trackId,
            }),
            });
            if (response.ok) {
            // setIsFavorite(false);
            // setMenuVisible(false);
            console.log("крута")
            }
        } catch (e) {
            console.error("Ошибка при удалении", e);
        }
        };
    return (
        <View style={styles.container}>
            <FlatList
                // Теперь ГЛАВНЫЙ список — это АЛЬБОМЫ
                data={favoriteAlbums}
                keyExtractor={(item) => `album-${item.id}`}
                renderItem={renderAlbum}
                numColumns={2} // ВОТ ОНО: два в ряд
                columnWrapperStyle={styles.albumRow} // Отступы между колонками
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}

                // ВЕРХНЯЯ ЧАСТЬ (Заголовок и кнопка треков)
                ListHeaderComponent={
                    <View>
                        <Text style={styles.headerTitle}>Медиатека</Text>
                        
                        <TouchableOpacity 
                            style={styles.likedHeroCard} 
                            onPress={() => router.push({pathname: '/tabs/libraryLikesTrack'})}
                        >
                            <View style={[styles.gradientPlaceholder, { backgroundColor: '#41B6E6' }]}>
                                <AntDesign name="heart" size={30} color="white" />
                            </View>
                            <View style={{ marginLeft: 15 }}>
                                <Text style={[styles.trackTitle, { fontSize: 18 }]}>Любимые треки</Text>
                                <Text style={styles.trackArtist}>{favoritesTrack.length} аудиозаписей</Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Любимые альбомы</Text>
                    </View>
                }
                
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchFavorites} tintColor="#fff" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <AntDesign name="plus-circle" size={50} color="#333" />
                        <Text style={styles.emptyTxt}>Альбомов пока нет</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        paddingTop: 60,
        paddingHorizontal: 15
    },
    headerTitle: {
        fontFamily: 'MyFont',
        fontSize: 28,
        color: 'white',
        marginBottom: 20
    },
    likedHeroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    gradientPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#6b1fb3',
        justifyContent: 'center',
        alignItems: 'center'
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    trackImage: {
        width: 55,
        height: 55,
        borderRadius: 4
    },
    trackInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center'
    },
    trackTitle: {
        color: 'white',
        fontFamily: 'MyFont',
        fontSize: 16,
        marginBottom: 4
    },
    trackArtist: {
        color: '#aaaaaa',
        fontSize: 13,
        fontFamily: 'MyFont'
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100
    },
    emptyTxt: {
        color: '#444',
        marginTop: 15,
        fontSize: 18,
        fontFamily: 'MyFont'
    },
    // Добавь это в StyleSheet.create
    sectionTitle: {
        fontFamily: 'MyFont',
        fontSize: 20,
        color: '#41B6E6', // Pantone Tech Light Blue
        marginBottom: 15,
    },
    albumRow: {
        justifyContent: 'space-between', // Расталкивает карточки по краям
        paddingHorizontal: 5,
    },
    albumCard: {
        width: '47%', // Чуть меньше половины, чтобы влез отступ
        marginBottom: 20,
        alignItems: 'center',
    },
    albumImage: {
        width: '100%',
        aspectRatio: 1, // Делает картинку квадратной автоматически
        borderRadius: 12,
        backgroundColor: '#333',
    },
    albumName: {
        color: 'white',
        fontFamily: 'MyFont',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    // sectionTitle: {
    //     fontFamily: 'MyFont',
    //     fontSize: 22,
    //     color: '#41B6E6', 
    //     marginBottom: 20,
    //     marginTop: 10
    // },
    
});