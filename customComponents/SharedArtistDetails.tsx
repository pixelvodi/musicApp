import { getDominantColor } from '@/utils/imgBackground';
import { playOrStop, playQueue } from '@/utils/playMusic';
import { useTheme } from '@/utils/ThemeContext';
import { useTrack } from '@/utils/TrackContext';
import { API_URL } from '@/utils/apiConfig';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { truncateText } from '@/utils/truncateText';
interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  count: number;
  imageUrl?: string;
  audioUrl?: string;
}

interface Album {
  id: number;
  title: string;
  imageUrl: string;
  year: number;
}



export default function ArtistDetails() {
  const { name, imageUrl, id: artistId } = useLocalSearchParams();
  const artistIdStr = Array.isArray(artistId) ? artistId[0] : artistId;
  const router = useRouter();
  const { currentTrack, setCurrentTrack, setCurrentArtist, setCurrentImage } = useTrack();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [albumColors, setAlbumColors] = useState<{ [key: number]: string }>({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { accentColor } = useTheme();

  const fetchTracks = async () => {
    if (!artistIdStr) return;
    setLoadingTracks(true);
    try {
      const response = await fetch(`${API_URL}/artist/${artistIdStr}/tracks`);
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleTrackPress = async (track: Track, index: number) => {
    try {
      await fetch(`${API_URL}/tracks/${track.id}/increment-count`, {
        method: 'POST',
      });
      setTracks(prev => prev.map(t => 
        t.id === track.id ? { ...t, count: (t.count || 0) + 1 } : t
      ));
      
      const validTracks = tracks.filter(t => t.audioUrl).map(t => ({
        ...t,
        artwork: t.artwork || undefined
      }));
      
      const trackForPlayer = {
        id: track.id,
        title: track.title,
        album_id: 0,
        name: track.title,
        audioUrl: track.audioUrl,
        artist: name as string,
        artwork: track.artwork || undefined,
      };
      
      setCurrentTrack(trackForPlayer);
      setCurrentArtist(name as string);
      setCurrentImage(track.artwork ? track.artwork : null);
      
      if (validTracks.length > 0) {
        const validIndex = Math.min(index, validTracks.length - 1);
        playQueue(validTracks as any, validIndex);
      }
    } catch (error) {
      console.error('Error incrementing count:', error);
    }
  };

  const fetchAlbums = async () => {
    if (!artistIdStr) return;
    setLoadingAlbums(true);
    try {
      const response = await fetch(`${API_URL}/artist/${artistIdStr}/albums`);
      const data = await response.json();
      setAlbums(data);
      
      const colorsMap: { [key: number]: string } = {};
      for (const album of data) {
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
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoadingAlbums(false);
    }
  };

  useEffect(() => {
    if (artistIdStr) {
      fetchTracks();
      fetchAlbums();
      checkSubscription();
    }
  }, [artistIdStr]);

  const checkSubscription = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      console.log('UserId from storage:', id);
      console.log('ArtistId:', artistIdStr);
      if (!id || !artistIdStr) {
        console.log('No userId or artistId, returning');
        setIsSubscribed(false);
        return;
      }
      setUserId(id);
      
      const response = await fetch(`${API_URL}/favoritesArtist/check?user_id=${id}&artist_id=${artistIdStr}`);
      console.log('Check response status:', response.status);
      const data = await response.json();
      console.log('Check data:', data);
      setIsSubscribed(!!data.isFavorite);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    }
  };

  const handleSubscribe = async () => {
    console.log('handleSubscribe called, isSubscribed:', isSubscribed);
    
    if (!userId || !artistIdStr) return;
    
    try {
      if (isSubscribed) {
        console.log('Removing subscription...');
        await fetch(`${API_URL}/favoritesArtist/remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, artist_id: artistIdStr }),
        });
        setIsSubscribed(false);
      } else {
        console.log('Adding subscription...');
        await fetch(`${API_URL}/favoritesArtist/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, artist_id: artistIdStr }),
        });
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const imageSource = typeof imageUrl === 'string' 
    ? { uri: imageUrl } 
    : imageUrl?.[0] 
      ? { uri: imageUrl[0] } 
      : require('@/customComponents/images/pngPLastinka.png');

  const getAlbumColor = (albumId: number, fallbackIndex: number) => albumColors[albumId];

  const handleAlbumPress = (album: Album) => {
    router.push({
      pathname: '/tabs/home/albumDetails',
      params: {
        id: album.id.toString(),
        name: album.title,
        imageUrl: album.imageUrl,
        artist: name as string,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={imageSource} style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)', '#000']}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <View style={{ height: 200 }} /> 

        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>{name}</Text>
          
          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={[styles.subscribeButton, isSubscribed && { backgroundColor: accentColor, borderColor: accentColor }]}
              onPress={handleSubscribe}
            >
              <Text style={isSubscribed ? styles.subscribedText : styles.subscribeText}>
                {isSubscribed ? 'отписаться' : 'подписаться'}
              </Text>
              {userId ? null : <Text style={{color:'red',fontSize:10}}> (no user)</Text>}
            </TouchableOpacity>
            
            <View style={styles.playIcons}>
              <TouchableOpacity onPress={async () => {
                const isCurrentTrackFromThisArtist = tracks.some(
                  track => track.id === currentTrack?.id
                );

                if (isCurrentTrackFromThisArtist && isPlaying) {
                  const result = await playOrStop();
                  if (result !== null) {
                    setIsPlaying(result.isPlaying);
                  }
} else {
                  const validTracks = tracks.filter(t => t.audioUrl).map(t => ({
                    ...t,
                    artwork: t.artwork || undefined
                  }));
                  const firstTrackWithImage = validTracks.find(t => t.artwork);
                  setCurrentTrack(validTracks[0] as any);
                  setCurrentArtist(name as string);
                  setCurrentImage(firstTrackWithImage?.artwork || imageUrl as string);
                  playQueue(validTracks as any, 0);
                  setIsPlaying(true);
                }
              }}>
                {isPlaying && tracks.some(track => track.id === currentTrack?.id) ? (
                  <FontAwesome name="pause-circle" size={75} color={accentColor} />
                ) : (
                  <FontAwesome name="play-circle" size={75} color={accentColor} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Популярное</Text>
          {loadingTracks ? (
            <Text style={styles.loadingText}>Загрузка треков...</Text>
          ) : tracks.length > 0 ? (
            tracks.slice(0, 5).map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.songItem}
                onPress={() => handleTrackPress(item, index)}
              >
                <Text style={styles.songNumber}>{index + 1}</Text>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{item.title}</Text>
                  <Text style={styles.songCount}>{item.count || 0} прослушиваний</Text>
                </View>
                <Ionicons name="ellipsis-vertical" size={20} color="#ccc" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Треки не найдены</Text>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Альбомы</Text>
          
          {loadingAlbums ? (
            <Text style={styles.loadingText}>Загрузка альбомов...</Text>
          ) : albums.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsContainer}
            >
              {albums.map((album, index) => (
                <TouchableOpacity
                  key={album.id}
                  style={[styles.albumCard, { backgroundColor: getAlbumColor(album.id, index) }]}
                  onPress={() => handleAlbumPress(album)}
                >
                  <View style={styles.darkLayout}/>
                  <View style={styles.vinylContainer}>
                    <Animated.Image
                      source={require('@/customComponents/images/pngPLastinka.png')}
                      style={styles.vinyl}
                    />
                    {album.imageUrl && (
                      <Animated.Image
                        source={{ uri: album.imageUrl }}
                        style={styles.albumCover}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text style={styles.albumTitle} numberOfLines={1}>{truncateText(album.title, 20)}</Text>
                  <Text style={styles.albumArtist} numberOfLines={1}>{truncateText(name, 20)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Альбомы не найдены</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { flexGrow: 1 }, 
  backButton: { 
    marginTop: 50, 
    marginLeft: 20, 
    width: 40 
  },
  artistInfo: { paddingHorizontal: 20, marginBottom: 20 },
  artistName: { color: 'white', fontSize: 42, fontWeight: 'bold', marginBottom: 30 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subscribeButton: { borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5 },
  subscribeText: { color: 'white', fontSize: 14 },
  subscribedText: { color: 'white', fontSize: 14 },
  playIcons: { flexDirection: 'row', alignItems: 'center' },
  playButton: { backgroundColor: 'white', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  content: { paddingLeft: 20, paddingRight: 0, minHeight: 500, paddingBottom: 200 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  songItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  songNumber: { color: '#666', width: 30, fontSize: 16 },
  songInfo: { flex: 1 },
  songTitle: { color: 'white', fontSize: 16 },
  songCount: { color: '#666', fontSize: 12, marginTop: 4 },
  loadingText: { color: '#666', fontSize: 14, marginVertical: 10 },
  emptyText: { color: '#666', fontSize: 14, marginVertical: 10 },
  albumsContainer: { paddingRight: 0 },
  darkLayout: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  albumCard: {
    width: 170,
    height: 170,
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  vinylContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
    top: -30,
    left: -15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
    overflow: 'hidden',
  },
  vinyl: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 50,
  },
  albumCover: {
    width: 80,
    height: 80,
    left: 50,
    borderRadius: 50,
  },
  albumTitle: {
    position: 'absolute',
    top: 125,
    left: 10,
    right: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  albumArtist: {
    position: 'absolute',
    top: 145,
    left: 10,
    right: 10,
    color: '#aaa',
    fontSize: 12,
  },
});