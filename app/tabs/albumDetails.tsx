import { playOrStop, playQueue } from '@/utils/playMusic';
import { responsive } from '@/utils/responsive';
import { useTrack } from '@/utils/TrackContext';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ImageColors from 'react-native-image-colors';
import TextTicker from 'react-native-text-ticker';

type Track = {
  id: number;
  title: string;
  album_id: number;
  name: string;
  audioUrl: string;
};
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AlbumDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name, imageUrl, artist } = params;
  const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;

  const vinylTranslateX = useRef(new Animated.Value(0)).current;
  const albumTranslateX = useRef(new Animated.Value(0)).current;

  const [tracks, setTracks] = useState<Track[]>([]);
  const [bgColor, setBgColor] = useState<string>('#121212');

  const [dataLoaded, setDataLoaded] = useState(false);

  const [isInView, setIsInView] = useState(false);
  // const {setCurrentTrack} = useTrack();
  // const {setCurrentArtist} = useTrack();
  // const {setCurrentImage} = useTrack();
  const { currentTrack, setCurrentTrack, setCurrentArtist, setCurrentImage } = useTrack();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

 const checkVisible = (isVisible:boolean) => {
  if (isVisible) {
    setIsInView(isVisible)
  } else {
    setIsInView(isVisible)
  }
 }




  useEffect(() => {
    if (typeof imageUrlString === 'string') {
      ImageColors.getColors(imageUrlString, {
        fallback: '#121212',
        quality: 'high',
      }).then(colors => {
        let dominant = '#121212';
        switch (colors.platform) {
          case 'android':
            dominant = colors.dominant ?? colors.average ?? '#121212';
            break;
          case 'ios':
            dominant = colors.primary ?? colors.background ?? '#121212';
            break;
          case 'web':
            dominant = colors.dominant ?? '#121212';
            break;
        }
        setBgColor(dominant);
      }).catch(err => {
        console.warn("Ошибка при получении цвета изображения", err);
      });
    }
  }, [imageUrlString]);

  useEffect(() => {
  const loadId = async () => {
    const id = await AsyncStorage.getItem('userId');
    setCurrentUserId(id);
  };
  loadId();
}, []);

const addToFavorites = async (trackId: number) => {
  if (!currentUserId) return;

  try {
    const response = await fetch(`http://192.168.1.2:3000/favorites/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: parseInt(currentUserId),
        track_id: trackId,
      }),
    });
    if (response.ok) {
      console.log("Трек добавлен в базу");
      setMenuVisible(false);
    }
  } catch (e) {
    console.error("Ошибка сети", e);
  }
};

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        if (!id) {
          console.warn('id не определён');
          return;
        }
        const response = await fetch(`http://192.168.1.2:3000/tracks/${id}`);
        const data = await response.json();
        const ids = (data as { id: number }[]).map(item => item.id);
        setTracks(data);
        console.log("Треки", ids)
      } catch (error) {
        console.error('Ошибка загрузки треков:', error);
      }
    };
    fetchTracks();
  }, [id]);

   


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" style={styles.iconBack} />
        </TouchableOpacity>
        {/* <TextTicker style={styles.textHeader}>{name}</TextTicker> */}
      </View>

      {/* Background Layer */}
      <View style={styles.vinylLayer}>
        <View style={styles.blackBackground} />
        <Animated.View style={[styles.vinylWrapper, { transform: [{ translateX: vinylTranslateX }] }]}>
          <Animated.Image
            source={require('@/customComponents/images/pngPLastinka.png')}
            style={styles.vinyl}
            resizeMode="contain"
          />
          {typeof imageUrlString === 'string' && (
            <Animated.Image
              source={{ uri: imageUrlString }}
              style={styles.albumCenterImg}
              resizeMode="cover"
            />
          )}
        </Animated.View>
      </View>

      {/* Foreground Content */}
      <View style={styles.detailsContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.titleAndSonger}>
            <TextTicker scrollSpeed={10} loop bounce={false} numberOfLines={1} style={styles.albumTitle}>{name}</TextTicker>
            <Text style={styles.albumArtist}>{artist}</Text>
          </View>

          <View style={styles.managment}>
            <View style={styles.leftManagment}>
              <FontAwesome name="heart-o" size={24} color="white" />
              <MaterialCommunityIcons name="download-circle-outline" size={26} color="white" />
              <Ionicons name="person-outline" size={24} color="white" />
            </View>
            <View style={styles.rightManagment}>
              <FontAwesome6 name="shuffle" size={24} color="white" />
              {tracks.length > 0 && (
                <TouchableOpacity
                  onPress={async () => {
                    // Проверяем, играет ли сейчас трек из ЭТОГО альбома
                    const isCurrentTrackFromThisAlbum = tracks.some(
                      track => track.id === currentTrack?.id
                    );

                    if (isCurrentTrackFromThisAlbum && isPlaying) {
                      // Трек из этого альбома уже играет → ставим на паузу
                      const result = await playOrStop();
                      if (result !== null) {
                        setIsPlaying(result.isPlaying);
                      }
                    } else {
                      // Играет другой альбом или ничего не играет → запускаем этот альбом
                      const queueUrls = tracks.map(t => t.audioUrl);
                      setCurrentTrack(tracks[0]);
                      setCurrentArtist(Array.isArray(artist) ? artist[0] : artist || null);
                      setCurrentImage(imageUrlString);

                      playQueue(queueUrls, 0)
                    }
                  }}>
                  {/* Кнопка показывает ПАУЗУ только если играет трек из ЭТОГО альбома */}
                  {isPlaying && tracks.some(track => track.id === currentTrack?.id) ? (
                    <FontAwesome name="pause-circle" size={75} color="#ff766c" />
                  ) : (
                    <FontAwesome name="play-circle" size={75} color="#ff766c" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {tracks.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                // ПРАВИЛЬНО: Передаем весь массив объектов и индекс начала
                setCurrentTrack(item);
                setCurrentArtist(Array.isArray(artist) ? artist[0] : artist || null);
                setCurrentImage(imageUrlString);

                playQueue(tracks, index); // index — это позиция трека в массиве
              }}>
                      <View key={item.id} style={[styles.trackItem, {backgroundColor: item.id === currentTrack?.id ? 'rgba(42, 42, 42, 0.4)' : 'transparent' }]}>
              <View>
                <Text 
                  style={[
                    styles.trackTitle,
                    { 
                      color: item.id === currentTrack?.id ? '#ff766c' : 'white',
                    }
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.trackArtist}>{artist}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>{
                  setSelectedTrack(item);
                  setMenuVisible(true);
                }}
              >
                <Entypo name="dots-three-vertical" size={15} color="white" />
              </TouchableOpacity>
            </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Modal
  transparent={true}
  visible={menuVisible}
  animationType="slide"
  onRequestClose={() => setMenuVisible(false)}
>
  <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
    <View style={styles.bottomSheet}>
      <View style={styles.dragHandle} />
      <Text style={styles.menuTrackTitle}>{selectedTrack?.title}</Text>
      
      <TouchableOpacity 
        style={styles.menuOption} 
        onPress={() => selectedTrack && addToFavorites(selectedTrack.id)}
      >
        <Ionicons name="heart-outline" size={24} color="white" />
        <Text style={styles.menuOptionText}>В любимые</Text>
      </TouchableOpacity>
    </View>
  </Pressable>
</Modal>
      </View>
    </SafeAreaView>

    
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#121212',
  },
  header: {
    height: responsive.number(60),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    position: 'relative',

  },
  backButton: {
    position: 'absolute',
    left: 16,

  },
  iconBack: {
    fontSize: 30,
    color: 'white'
  },
  textHeader: {
    fontSize: responsive.fontSize(20),
    color: 'white',
    fontFamily: 'MyFont',

  },
  vinylLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  blackBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    opacity: 0.7,
    zIndex: 3,
  },
  vinylWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  vinyl: {
    width: '200%',
    height: '200%',
    resizeMode: 'contain',
    marginLeft: responsive.number(350),
    zIndex: 4
  },
  albumCenterImg: {
    width: '60%',
    height: '30%',
    borderRadius: 25,
    marginLeft: responsive.number(330),
    position: 'absolute',
    zIndex: 3,
  },
  detailsContainer: {
    flex: 1,
    width: '100%',
    zIndex: 5,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 40,
    
  },
  titleAndSonger: {
    width: '100%',
    height: responsive.number(300),
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumTitle: {
    fontSize: responsive.fontSize(70),
    color: 'white',
    fontFamily: 'MyFont',
  },
  albumArtist: {
    fontSize: responsive.fontSize(20),
    color: '#8C8C8C',
    fontFamily: 'MyFont'
  },
  managment: {
    width: '100%',
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leftManagment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
    alignItems: 'center',
  },
  rightManagment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 100,
    
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    justifyContent: 'space-between'
  },
  trackTitle: {
    fontSize: 20,
    flex: 1,
    fontFamily: 'MyFont'
  },
  trackArtist: {
    color: '#8C8C8C',
    fontSize: responsive.fontSize(14),
    flex: 1,
    fontFamily: 'MyFont',
    paddingTop: 5
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'flex-end',
},
bottomSheet: {
  backgroundColor: '#1c1c1c',
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  padding: 20,
  paddingBottom: 40,
},
dragHandle: {
  width: 40,
  height: 4,
  backgroundColor: '#444',
  borderRadius: 2,
  alignSelf: 'center',
  marginBottom: 20,
},
menuTrackTitle: {
  color: 'white',
  fontSize: 18,
  fontFamily: 'MyFont',
  marginBottom: 25,
  textAlign: 'center',
},
menuOption: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 15,
},
menuOptionText: {
  color: 'white',
  fontSize: 16,
  marginLeft: 15,
  fontFamily: 'MyFont',
},
});
