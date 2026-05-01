import { useTheme } from '@/utils/ThemeContext';
import { useTrack } from '@/utils/TrackContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, ImageBackground, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FavoriteTrack, useLibraryLikesTrackLogic } from "../../../utils/libraryLikesTrackLogicc";
import { playQueue } from "../../../utils/playMusic";

export default function Library() {
    const { favoritesTrack, loading, fetchfavoritesTrack } = useLibraryLikesTrackLogic();
    const [refreshing, setRefreshing] = useState(false);
    const { currentTrack, setCurrentTrack, setCurrentArtist, setCurrentImage } = useTrack();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, name, imageUrl, artist } = params;
    const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<FavoriteTrack | null>(null);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const { accentColor } = useTheme();
    
    const refreshAvatar = async () => {
        const id = await AsyncStorage.getItem('userId');
        setCurrentUserId(id);
        if (id) {
            try {
                const res = await fetch(`http://192.168.1.2:3000/user/${id}`);
                const data = await res.json();
                if (data.avatar) {
                    const avatarPath = data.avatar.startsWith('/avatar/') 
                        ? data.avatar.replace('/avatar/', '') 
                        : data.avatar;
                    setUserAvatar(`http://192.168.1.2:3000/static/avatar/${avatarPath}`);
                }
            } catch (e) {
                console.error('Error loading avatar:', e);
            }
        }
    };
    
    useEffect(() => {
        refreshAvatar();
    }, [favoritesTrack]);

    // Функция запуска проигрывания
    const handlePlayFavorites = async (index: number) => {
        console.log('Playing favorite track index:', index);
        await playQueue(favoritesTrack, index);
    };

    

    // Отрисовка одного трека (вынесена из return для чистоты)
    const renderTrack = ({ item, index }: { item: any; index: number }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginLeft: 0, marginRight: 0 }}>
            <TouchableOpacity 
                style={styles.searchView}
                activeOpacity={0.7}
                onPress={() => {handlePlayFavorites(index);
                    setCurrentTrack(item);
                    const artistName = Array.isArray(item.artist) ? item.artist[0] : item.artist || null;
                    setCurrentArtist(artistName);
                    setCurrentImage(item.artwork);} }
            >
                <View style={styles.info}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.trackArtistText} numberOfLines={1}>Трек • {item.artist}</Text>
                </View>
                
                <View style={styles.darkLayout}/>
                <View style={styles.vinylContainer}>
                    <Animated.Image
                        source={require('@/customComponents/images/pngPLastinka.png')}
                        style={styles.vinyl}
                    />
                    {item.artwork && (
                        <Animated.Image
                            source={{ uri: item.artwork }}
                            style={styles.centerImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => { removeFromFavorites(item.id) }} style={{ position: 'absolute', right: 10, zIndex: 10, padding: 10 }}>
                <AntDesign name="heart" size={24} color={accentColor} />
            </TouchableOpacity>
        </View>
    );

    const removeFromFavorites = async (trackId: number) => {
        console.log("Попытка удаления трека ID:", trackId);
        if (!currentUserId) return;
        try {
            const response = await fetch(`http://192.168.1.2:3000/favorites/remove`, {
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
            <ImageBackground 
                key={userAvatar}
                source={userAvatar ? { uri: `${userAvatar}?t=${Date.now()}` } : undefined} 
                style={styles.fullBackground}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.overlay}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={28} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerText}>Любимые треки</Text>
                            <Text style={styles.trackCount}>{favoritesTrack.length} треков</Text>
                        </View>
                    </View>
                    
                    {loading ? (
                        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                    data={favoritesTrack}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTrack}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 5 }}
                    onRefresh={async () => {
                        setRefreshing(true);
                        await refreshAvatar();
                        await fetchfavoritesTrack();
                        setRefreshing(false);
                    }}
                    refreshing={refreshing}
                    refreshControl={
                        <RefreshControl 
                            refreshing={false} 
                            onRefresh={fetchfavoritesTrack} 
                            tintColor="#fff" 
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AntDesign name="plus-circle" size={50} color="#333" />
                            <Text style={styles.emptyTxt}>bsdbdsbs</Text>
                        </View>
                    }
                />
            )}
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    fullBackground: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 5,
    },
    backgroundImage: {
        opacity: 0.5,
    },
    overlay: {
        flex: 1,
    },
    headerContainer: {
        height: 150,
        width: '100%',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        padding: 10,
    },
    avatarBackground: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    headerContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
    },
    headerText: {
        color: 'white',
        fontFamily: 'MyFont',
        fontSize: 28,
        fontWeight: 'bold',
    },
    trackCount: {
        color: '#ccc',
        fontFamily: 'MyFont',
        fontSize: 14,
        marginTop: 5,
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
    trackArtistText: {
        color: '#BABABA',
        fontFamily: 'MyFont',
        fontSize: 12
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
    searchView: {
        width: '100%',
        height: 70,
        backgroundColor: '#3a3a3a',
        borderRadius: 10,
        marginBottom: 5,
        overflow: 'hidden',
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center'
    },
    info: {
        marginLeft: 12,
        marginRight: 70,
        flex: 1,
        zIndex: 3,
        paddingRight: 70
    },
    darkLayout: {
        backgroundColor: "#000",
        position: "absolute",
        top: 0, bottom: 0, left: 0, right: 0,
        borderRadius: 10,
        opacity: 0.5,
        zIndex: 2
    },
    vinylContainer: {
        position: "absolute",
        width: 190,
        height: 190,
        top: -60,
        right: -20,
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
});