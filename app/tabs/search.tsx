import { playQueue } from '@/utils/playMusic';
import { responsive } from '@/utils/responsive';
import { useTrack } from '@/utils/TrackContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 1. Объединенный тип для всех результатов поиска
type SearchResult = {
  id: number;
  title: string;
  artist?: string;      // Есть у треков и альбомов
  img?: string;         // Есть у треков и альбомов
  type: 'track' | 'album' | 'artist';
  priority?: number;
  // Дополнительные поля, которые могут прийти с бэкенда
  album_id?: number;    
  audioUrl?: string;
};

type Track = {
  id: number;
  title: string;
  album_id: number;
  name: string;
  audioUrl: string;
};

export const checkType = (item: SearchResult) => ({
    isTrack: item.type === 'track',
    isAlbum: item.type === 'album',
    isArtist: item.type === 'artist'
});

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    // 2. Меняем тип стейта на универсальный
    const [results, setResults] = useState<SearchResult[]>([]);
    const router = useRouter();
    const [tracks, setTracks] = useState<Track[]>([]);
      const [bgColor, setBgColor] = useState<string>('#121212');
    
      const [dataLoaded, setDataLoaded] = useState(false);
    
      const [isInView, setIsInView] = useState(false);
      const { currentTrack, setCurrentTrack, setCurrentArtist, setCurrentImage } = useTrack();
      const [sound, setSound] = useState<Audio.Sound | null>(null);
      const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (query.trim().length < 1) {
            setResults([]);
            return;
        }

        const response = async () => {
            try {
                // Используем ваш IP для локальной сети
                const res = await fetch(
                    `http://192.168.1.2:3000/search?query=${encodeURIComponent(query)}`
                );
                const data = await res.json();
                setResults(data.results);
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        };

        response();
    }, [query]);

    // 3. Компонент для отрисовки одной карточки
    const renderItem = ({ item }: { item: SearchResult }) => {
        const isTrack = item.type === 'track';
        const isAlbum = item.type === 'album';
        
        // Динамический текст подписи
        const getSubtitle = () => {
            if (isTrack) return `Трек • ${item.artist}`;
            if (isAlbum) return `Альбом • ${item.artist}`;
            return 'Исполнитель';
        };

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginLeft: 15, marginRight: 15 }}>
                <TouchableOpacity 
                    style={{ flex: 1 }}
                    onPress={() => {
                        // Логика перехода: треки играют, альбомы открываются, артисты - профиль
                        console.log(`Pressed ${item.type}: ${item.title}`);
                        {isAlbum && (
                            router.push({
                                pathname: '/tabs/albumDetails',
                                params: {
                                    id: item.id?.toString() ?? '',
                                    name: item.title,
                                    artist: item.artist,
                                    imageUrl: item.img
                                },
                            })
                        )}
                        if (isTrack) {
                            const startIndex = results.findIndex(t => t.id === item.id);
                            
                            if (startIndex !== -1) {
                                // 2. Формируем очередь элементов (чтобы использовать их в callback)
                                const queueItems = results.slice(startIndex);
                                
                                // 3. Создаем массив URL, фильтруя undefined
                                const queueUrls = queueItems
                                    .map(t => t.audioUrl)
                                    .filter((url): url is string => url !== undefined);

                                // 4. ✅ СОЗДАЕМ ОБЪЕКТ TRACK ВРУЧНУЮ
                                // Это гарантирует, что поле title существует и будет отображено
                                const trackObject: Track = {
                                    id: item.id,
                                    title: item.title,      // ← Это отобразится в плеере
                                    name: item.title,       // ← Дублируем, так как в типе Track есть оба поля
                                    album_id: item.album_id ?? 0,
                                    audioUrl: item.audioUrl ?? ''
                                };

                                // Передаем ОБЪЕКТ, а не строку
                                setCurrentTrack(trackObject);
                                setCurrentArtist(item.artist ?? null);
                                setCurrentImage(item.img ?? null);
                                
                                // 5. Запускаем плеер
                                playQueue(queueUrls, 0, (queueIndex) => {
                                    // ❌ БЫЛО: const track = tracks[startIndex + queueIndex]; 
                                    // (tracks пустой в этом компоненте, поэтому было undefined)
                                    
                                    // ✅ СТАЛО: Берем трек из нашей локальной очереди queueItems
                                    const nextTrackData = queueItems[queueIndex];
                                    
                                    if (nextTrackData) {
                                        const nextTrackObject: Track = {
                                            id: nextTrackData.id,
                                            title: nextTrackData.title,
                                            name: nextTrackData.title,
                                            album_id: nextTrackData.album_id ?? 0,
                                            audioUrl: nextTrackData.audioUrl ?? ''
                                        };

                                        setCurrentTrack(nextTrackObject);
                                        setCurrentArtist(nextTrackData.artist ?? null);
                                        setCurrentImage(nextTrackData.img ?? null);
                                    }
                                });
                            }
                        }
                    }}
                >
                    <View style={styles.searchView}>
                        <View style={styles.info}>
                            <Text style={{ fontFamily: "MyFont", color: "white", fontSize: 16 }} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={{ fontFamily: "MyFont", color: "#BABABA", fontSize: 12 }} numberOfLines={1}>
                                {getSubtitle()}
                            </Text>
                        </View>

                        {/* Сложная анимация пластинки ТОЛЬКО для треков */}
                        {isTrack && (
                            <>
                                <View style={styles.darkLayout}/>
                                <View style={styles.vinylContainer}>
                                    <Animated.Image
                                        source={require('@/customComponents/images/pngPLastinka.png')}
                                        style={styles.vinyl}
                                    />
                                    {item.img && (
                                        <Animated.Image
                                            key={item.img}
                                            source={{ uri: item.img }}
                                            style={styles.centerImage}
                                            resizeMode="contain"
                                        />
                                    )}
                                </View>
                            </>
                        )}

                        {isAlbum && item.img && (
                             <>
                                <View style={styles.darkLayout}/>
                                <View style={styles.vinylContainer}>
                                    <Animated.Image
                                        source={require('@/customComponents/images/pngPLastinka.png')}
                                        style={styles.vinyl}
                                    />
                                    {item.img && (
                                        <Animated.Image
                                            key={item.img}
                                            source={{ uri: item.img }}
                                            style={styles.centerImage}
                                            resizeMode="contain"
                                        />
                                    )}
                                </View>
                            </>
                        )}
                        
                        {/* Иконка для Артиста (если нет фото) */}
                        {item.type === 'artist' && (
                            <View style={styles.artistIconContainer}>
                                <Ionicons name="person" size={30} color="#BABABA" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={{ marginLeft: 10 }}>
                    <AntDesign name="more" size={24} color="white" style={styles.tripleVerticalMenu}/>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* SEARCH BAR */}
            <View style={styles.searchBar}>
                <TouchableOpacity 
                    onPress={() => { router.back(); setQuery(''); setResults([]); }} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" style={styles.iconBack} />
                </TouchableOpacity>
                <TextInput
                    placeholder="Поиск"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
                    placeholderTextColor="white"
                />
                {query.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearTextButton}
                        onPress={() => {
                            setQuery('');
                            setResults([]);
                        }}
                    >
                        <Ionicons name="close-outline" size={30} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            {/* SEARCH RESULTS */}
            <FlatList
                style={{ width: '100%' }}
                data={results}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                renderItem={renderItem}
                ListEmptyComponent={
                    query.length > 2 ? (
                        <Text style={{ color: '#888', textAlign: 'center', marginTop: 50, fontFamily: 'MyFont' }}>
                            Ничего не найдено по запросу "{query}"
                        </Text>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212"
    },
    searchBar: {
        width: "100%",
        height: 80,
        backgroundColor: "gray", // Чуть темнее для контраста
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 15
    },
    iconBack: {
        fontSize: 30,
        color: 'white'
    },
    input: {
        flex: 1,
        fontFamily: "MyFont",
        fontSize: 18,
        color: "white",
        marginRight: 10,
        marginTop: 15
    },
    clearTextButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 15
    },
    // Затемнение для винила
    darkLayout: {
        backgroundColor: "#000",
        position: "absolute",
        top: 0, bottom: 0, left: 0, right: 0,
        borderRadius: 10,
        opacity: 0.5,
        zIndex: 2
    },
    // Контейнер винила (справа)
    vinylContainer: {
        position: "absolute",
        width: 190,
        height: 190,
        top: -60,
        right: -20, // Позиционируем вправо
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        overflow: 'hidden'
    },
    vinyl: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    centerImage: {
        width: 60,
        height: 60,
        position: 'absolute',
        zIndex: 2,
        borderRadius: 30,
    },
    // Новая обложка для альбомов (просто квадрат справа)
    albumCover: {
        position: "absolute",
        width: 60,
        height: 60,
        right: 15,
        top: 5,
        borderRadius: 8,
        zIndex: 3,
        borderWidth: 1,
        borderColor: '#333'
    },
    // Иконка артиста
    artistIconContainer: {
        position: "absolute",
        width: 60,
        height: 60,
        right: 15,
        top: 5,
        borderRadius: 30,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3
    },
    searchView: {
        width: responsive.number(320),
        height: 70,
        backgroundColor: '#3a3a3a',
        borderRadius: 10,
        marginRight: 10,
        marginBottom: 5,
        overflow: 'hidden',
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center'
    },
    info: {
        marginLeft: 12,
        flex: 1, // Занимает свободное место, чтобы текст не наезжал на картинки
        zIndex: 3,
        paddingRight: 70 // Отступ справа, чтобы текст не заходил на обложку
    },
    tripleVerticalMenu: {
        padding: 10
    }
});