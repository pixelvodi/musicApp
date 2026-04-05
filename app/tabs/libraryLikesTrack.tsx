import { useTrack } from '@/utils/TrackContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FavoriteTrack, useLibraryLikesTrackLogic } from "../../utils/libraryLikesTrackLogicc";
import { playQueue } from "../../utils/playMusic";

export default function Library() {
    const { favoritesTrack, loading, fetchfavoritesTrack } = useLibraryLikesTrackLogic();
    const { currentTrack, setCurrentTrack, setCurrentArtist, setCurrentImage } = useTrack();
    const params = useLocalSearchParams();
    const { id, name, imageUrl, artist } = params;
    const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<FavoriteTrack | null>(null);

    // Функция запуска проигрывания
    const handlePlayFavorites = async (index: number) => {
        console.log('Playing favorite track index:', index);
        await playQueue(favoritesTrack, index);
    };

    useEffect(() => {
  const loadId = async () => {
    const id = await AsyncStorage.getItem('userId');
    setCurrentUserId(id);
  };
  loadId();
}, []);

    // Отрисовка одного трека (вынесена из return для чистоты)
    const renderTrack = ({ item, index }: { item: any; index: number }) => (
        <TouchableOpacity 
            style={styles.trackItem} 
            activeOpacity={0.7}
            onPress={() => {handlePlayFavorites(index);
                setCurrentTrack(item);
                const artistName = Array.isArray(item.artist) ? item.artist[0] : item.artist || null;
                setCurrentArtist(artistName);
                setCurrentImage(item.artwork);} } 
        >
            {item.artwork ? (
                <Image source={{ uri: item.artwork }} style={styles.trackImage} />
            ) : (
                <View style={[styles.trackImage, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                    <AntDesign name="picture" size={20} color="#666" />
                </View>
            )}
            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            
            <TouchableOpacity onPress={() => { removeFromFavorites(item.id) }}>
                <AntDesign name="heart" size={20} color="#be1a1a" />
            </TouchableOpacity>
        </TouchableOpacity>
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
            {/* <Text style={styles.headerTitle}>Медиатека</Text> */}
            
            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={favoritesTrack}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTrack}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 150 }}
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
    }
});