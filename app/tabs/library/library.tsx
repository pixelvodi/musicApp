import { getDominantColor } from '@/utils/imgBackground';
import { useLibraryLikesTrackLogic } from '@/utils/libraryLikesTrackLogicc';
import { useTrack } from '@/utils/TrackContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FavoriteTrack, useLibraryLogic } from "../../../utils/libraryLogic";
import { responsive } from "../../../utils/responsive";

export type Album = {
  id: number;
  name: string;
  imageUrl: string;
  artist: string;
  img_artist: string;
  track_count: number;
};

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
    const [albums, setAlbums] = useState<Album[]>([]);
    const [albumColors, setAlbumColors] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        axios.get<Album[]>('http://192.168.1.2:3000/albums')
        .then(res => setAlbums(res.data))
        .catch(err => console.error('Error fetching albums:', err));
    }, []);

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
    if (favoriteAlbums.length === 0) return;

    const fetchColors = async () => {
      const colorsMap: { [key: number]: string } = {};
      for (const album of favoriteAlbums) {
        if (album.imageUrl) {
          try {
            const color = await getDominantColor(album.imageUrl);
            colorsMap[album.id] = color;
            console.log(`Цвет для альбома ${album.name} (ID: ${album.id}): ${color}`);
          } catch {
            colorsMap[album.id] = '#121212';
          }
        }
      }
      setAlbumColors(colorsMap);
    };

    fetchColors();
  }, [favoriteAlbums]);

    useEffect(() => {
  const loadId = async () => {
    const id = await AsyncStorage.getItem('userId');
    setCurrentUserId(id);
  };
  loadId();
}, []);

    // Отрисовка одного трека (вынесена из return для чистоты)
    const renderAlbum = ({ item }: { item: any }) => (
        console.log("Рендер альбома ID:", item.id), // Лог для проверки данных
    <TouchableOpacity 
        style={[styles.albumCard, { backgroundColor: albumColors[item.id] ?? '#121212' }]}
        onPress={() => router.push({
            pathname: '/tabs/albumDetails',
            params: { id: item.id, name: item.name, imageUrl: item.imageUrl, artist: item.artist }
        })}
    >
        <View style={styles.darkLaouyt}/>
                        <View style={styles.vinylContainerHorizontal}>
                          <Image
                            source={require('@/customComponents/images/pngPLastinka.png')}
                            style={styles.vinylHorizontal}
                          />
                            <Image
                              source={{ uri: item.imageUrl }}
                              style={styles.centerImageHorizontal}
                              resizeMode="contain"
                            />
                        </View>
        <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>

);

    // const removeFromFavorites = async (trackId: number) => {
    //     console.log("Попытка удаления трека ID:", trackId);
    //     if (!currentUserId) return;
    //     try {
    //         const response = await fetch(`http://192.168.1.2:3000/favoritesAlbum/remove`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             user_id: parseInt(currentUserId),
    //             track_id: trackId,
    //         }),
    //         });
    //         if (response.ok) {
    //         // setIsFavorite(false);
    //         // setMenuVisible(false);
    //         console.log("крута")
    //         }
    //     } catch (e) {
    //         console.error("Ошибка при удалении", e);
    //     }
    //     };
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
                            <View style={styles.gradientPlaceholder}>
        
                                {/* Большая иконка сердца (центрирована) */}
                                <AntDesign name="heart" size={100} color="white" style={styles.heartIconBackground} />
                                
                                {/* Текстовый блок (позиционирован абсолютно вниз) */}
                                <View style={styles.trackInfoOnBanner}>
                                    <Text style={[styles.trackTitle, { fontSize: 22, textShadowColor: 'black', textShadowRadius: 3 }]}>Любимые треки</Text>
                                    <Text style={[styles.trackArtist, { color: '#ccc', textShadowColor: 'black', textShadowRadius: 2 }]}>{favoritesTrack.length} аудиозаписей</Text>
                                </View>

                            </View>
                        </TouchableOpacity>

                        
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
        // Убираем flexDirection: 'row', так как элементы накладываются
        width: '100%',
        marginBottom: 30,
        borderRadius: 12, // Углы теперь на родителе
        overflow: 'hidden', // Чтобы иконка не вылезала
    },
    gradientPlaceholder: {
        width: '100%',
        height: 180, // Чуть увеличим высоту для баннера
        backgroundColor: '#0077C0',
        // justify/align тут нужны для центрирования большой иконки
        justifyContent: 'center', 
        alignItems: 'center',
        // Обязательно: ставим position relative для родителя абсолютно позиционированных детей
        position: 'relative', 
    },
    heartIconBackground: {
        // Большая иконка, которая будет "фоном"
        // right={90} убираем, он тут не нужен
        opacity: 0.15, // Сделаем её еле заметной, как водяной знак
    },
    trackInfoOnBanner: {
        // ВОТ РЕШЕНИЕ:
        position: 'absolute', // Вырываем из потока
        bottom: 15, // Прижимаем к низу баннера
        left: 15,   // Отступ слева
        zIndex: 3,  // Гарантированно поверх иконки
    },
    trackTitle: {
        color: 'white',
        fontFamily: 'MyFont',
        fontSize: 16,
        marginBottom: 4
    },
    trackArtist: {
        color: '#ffffff',
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
         width: responsive.number(165),
            height: 165,
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            marginRight: 10,
            marginBottom: 5,
            overflow: 'hidden',
            position: 'relative'
    },
    albumImage: {
        width: '100%',
        aspectRatio: 1, // Делает картинку квадратной автоматически
        borderRadius: 12,
        backgroundColor: '#333',
    },
    albumName: {
    position: 'absolute',
    top: 125,
    left: 5,
    color: '#fff',
    zIndex: 4,
    fontFamily: 'MyFont',
    fontSize: 20
    },
    darkLaouyt: {
    backgroundColor: "#000",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 10,
    padding: 12,
    opacity: 0.7,
    zIndex: 2
  },
  vinylContainer: {
    position: "absolute",
    width: 190,
    height: 190,
    top: -60,
    left: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden'
  },
  vinyl: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 50,
    
  },
   centerImage: {
    width: 60, // Размер центрального изображения
    height: 60,
    left: 50,
    borderRadius: 40, // Круглая форма
  },
  vinylContainerHorizontal: {
    position: "absolute",
    width: 220,
    height: 220,
    top: -30,
    left: -15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden'
  },
  vinylHorizontal: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 50,
  },
  centerImageHorizontal: {
    width: 80, // Размер центрального изображения
    height: 80,
    left: 50,
    borderRadius: 50, // Круглая форма
  },
    
});