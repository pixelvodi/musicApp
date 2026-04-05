import { useTrack } from '@/utils/TrackContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useLocalSearchParams } from 'expo-router';
import React from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLibraryLogic } from "../../utils/libraryLogic";
import { playQueue } from "../../utils/playMusic";


export default function Library() {
    const { favorites, loading, fetchFavorites } = useLibraryLogic();
    const { currentTrack, setCurrentTrack, setCurrentArtist, setCurrentImage } = useTrack();
    const params = useLocalSearchParams();
    const { id, name, imageUrl, artist } = params;
    const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;

    // Функция запуска проигрывания
    const handlePlayFavorites = async (index: number) => {
        console.log('Playing favorite track index:', index);
        await playQueue(favorites, index);
    };

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
            
            <TouchableOpacity onPress={() => { /* Логика удаления */ }}>
                <AntDesign name="heart" size={20} color="#be1a1a" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Медиатека</Text>
            
            {/* Карточка "Любимые треки"
            <TouchableOpacity 
                style={styles.likedHeroCard} 
                onPress={() => handlePlayFavorites(0)} // Нажатие на карточку запускает всё с первого трека
            >
                <View style={styles.gradientPlaceholder}>
                    <AntDesign name="heart" size={30} color="white" />
                </View>
                <View style={{ marginLeft: 15 }}>
                    <Text style={[styles.trackTitle, { fontSize: 18 }]}>Любимые треки</Text>
                    <Text style={styles.trackArtist}>{favorites.length} аудиозаписей</Text>
                </View>
            </TouchableOpacity> */}

            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTrack}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 150 }}
                    refreshControl={
                        <RefreshControl 
                            refreshing={false} 
                            onRefresh={fetchFavorites} 
                            tintColor="#fff" 
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AntDesign name="plus-circle" size={50} color="#333" />
                            <Text style={styles.emptyTxt}>Тут пока пусто</Text>
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