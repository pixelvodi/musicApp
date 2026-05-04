import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useHomeLogic } from '../../../utils/logicHome';
import { styles } from '../../../utils/stylesHome';
import { truncateText } from '@/utils/truncateText';
import { API_URL } from '@/utils/apiConfig';

export default function Home() {
  const { albums, albumHowAboutListen, albumColors, clearReg, artist, modalVisible, setModalVisible, modalScreen, setModalScreen, closeModal,
    userName, isEditing, setUserName, setIsEditing, toggleEdit, userEmail, setUserEmail, userAvatar, setUserAvatar, pickImage, userId, accentColor, setAccentColor, changeAccentColor } = useHomeLogic();
  const [avatarKey, setAvatarKey] = useState(0);
  
  // Обновляем ключ аватара при изменении
  useEffect(() => {
    setAvatarKey(k => k + 1);
  }, [userAvatar, modalVisible]);

  const getAvatarUrl = () => {
    if (!userAvatar) return require('@/assets/images/ava.jpg');
    return { uri: `${API_URL}/static${userAvatar}?t=${Date.now()}` };
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topLine}>
        <Text style={styles.txtLogo}>Luma</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image key={avatarKey} style={styles.imgLogo} source={getAvatarUrl()} />
        </TouchableOpacity>

        <Modal
          isVisible={modalVisible}
          // Используем функцию закрытия, которую опишем ниже
          onBackdropPress={closeModal} 
          animationIn="slideInRight"
          animationOut="slideOutRight"
          backdropTransitionOutTiming={0}
          style={styles.modalCustom}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPressOut={closeModal}
          >
            <View style={styles.modalView}>
              {modalScreen === 'menu' && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image key={avatarKey} style={styles.imgLogoModal} source={getAvatarUrl()} />
                    <View style={styles.modalContentText}>
                      <Text style={{ color: '#FFFFFF', fontSize: 22 }}>{userName}</Text>
                      {/* ДОБАВЛЕНО: переключение экрана */}
                      <TouchableOpacity onPress={() => setModalScreen('profile')}>
                        <Text style={{ color: '#FFFFFF', opacity: 0.7 }}>Посмотреть профиль</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.modalContent}>
                    <TouchableOpacity onPress={() => setModalScreen('settings')}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="settings" size={24} color="white" />
                        <Text style={{ color: 'white', marginLeft: 15 }}>Настройки</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={clearReg}>
                      <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center' }}>
                        <Feather name="log-out" size={24} color="white" />
                        <Text style={{ color: 'white', marginLeft: 15 }}>Выйти</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              {modalScreen === 'profile' && (
                <View style={{ flex: 1 }}>
                  {/* Кнопка назад */}
                  <TouchableOpacity 
                    onPress={() => setModalScreen('menu')} 
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginLeft: -10 }}
                  >
                    <Feather name="chevron-left" size={24} color="white" />
                    <Text style={{ color: 'white', marginLeft: 10 }}>Назад</Text>
                  </TouchableOpacity>

                  <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Профиль</Text>

                  {/* БЛОК РЕДАКТИРОВАНИЯ */}
                  <View style={{ gap: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => isEditing && pickImage()}>
                        <Image key={avatarKey} style={styles.imgLogoModalEdit} source={getAvatarUrl()} />

                        {/* Маленькая иконка-подсказка поверх аватара (опционально) */}
                        <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#62d273', borderRadius: 20, padding: 5, opacity: isEditing ? 1 : 0.5 }}>
                          <Feather name="camera" size={16} color="white" />
                        </View>
                      </TouchableOpacity>
                    </View>
                    
                    {/* ПОЛЕ: ИМЯ */}
                    <View>
                      <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>Имя пользователя</Text>
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        borderBottomWidth: 1, 
                        borderBottomColor: isEditing ? '#62d273' : '#333',
                        paddingBottom: 5 
                      }}>
                        <TextInput
                          style={{ flex: 1, color: 'white', fontSize: 16 }}
                          value={userName}
                          onChangeText={setUserName}
                          editable={isEditing}
                        />
                      </View>
                    </View>

                    {/* ПОЛЕ: ПОЧТА */}
                    <View>
                      <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 5 }}>Электронная почта</Text>
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        borderBottomWidth: 1, 
                        borderBottomColor: isEditing ? '#62d273' : '#333',
                        paddingBottom: 5 
                      }}>
                        <TextInput
                          style={{ flex: 1, color: 'white', fontSize: 16 }}
                          value={userEmail}
                          onChangeText={setUserEmail}
                          editable={isEditing}
                          keyboardType="email-address"
                        />
                      </View>
                    </View>

                    {/* КНОПКА РЕДАКТИРОВАТЬ / СОХРАНИТЬ */}
                    <TouchableOpacity 
                      onPress={toggleEdit}
                      style={{ 
                        backgroundColor: isEditing ? '#62d273' : '#333', 
                        padding: 12, 
                        borderRadius: 8, 
                        alignItems: 'center',
                        marginTop: 10 
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {isEditing ? 'Сохранить изменения' : 'Редактировать профиль'}
                      </Text>
                    </TouchableOpacity>

                  </View>
                </View>
              )}
              {modalScreen === 'settings' && (
                <View style={{ flex: 1 }}>
                  
                  {/* Назад */}
                  <TouchableOpacity 
                    onPress={() => setModalScreen('menu')}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
                  >
                    <Feather name="chevron-left" size={24} color="white" />
                    <Text style={{ color: 'white', marginLeft: 10 }}>Назад</Text>
                  </TouchableOpacity>

                  <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>
                    Цвет интерфейса
                  </Text>

                  {/* Цвета */}
                  <View style={{ flexDirection: 'row', gap: 15, flexWrap: 'wrap' }}>
                    {['#003366', '#29abe2', '#0071bc', '#1b212c', '#ffffff', '#8cc63f'].map(color => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setAccentColor(color)}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: color,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: accentColor === color ? 3 : 0,
                          borderColor: 'white'
                        }}
                      >
                        {accentColor === color && (
                          <Feather name="check" size={20} color="white" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                </View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 200 }}  nestedScrollEnabled showsVerticalScrollIndicator={false}>
        <View style={styles.recentlyListened}>
          <View style={styles.row}>
            {albums.slice(0, 4).map((album, index) => {
              let itemStyle;
              if (index === 0) itemStyle = styles.recentlyListened1;
              else if (index === 1) itemStyle = styles.recentlyListened2;
              else if (index === 2) itemStyle = styles.recentlyListened3;
              else if (index === 3) itemStyle = styles.recentlyListened4;
              else return null;

              return (
                <TouchableOpacity
                  key={album.id ?? index}
                  style={[itemStyle, {backgroundColor: albumColors[album.id] ?? '#121212'}]}
                  onPress={() => router.push({
                    pathname: '/tabs/home/albumDetails',
                    params: {
                      id: album.id?.toString() ?? '',
                      name: album.name,
                      imageUrl: album.imageUrl,
                      artist: album.artist
                    },
                  })}
 
                >
                  <View style={styles.darkLaouyt}/>
                    <View style={styles.vinylContainer}>
                      <Animated.Image
                        source={require('@/customComponents/images/pngPLastinka.png')}
                        style={styles.vinyl}
                      />
                      {album.imageUrl && (
                        <Animated.Image
                          key={album.imageUrl}
                          source={{ uri: album.imageUrl }}
                          style={styles.centerImage}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  <Text style={styles.textSong1}>{truncateText(album.name, 18)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style = {styles.howAboutListen}>
          {albumHowAboutListen.slice(0, 1).map((album, index) => {
            return (
              <TouchableOpacity key={album.id ?? index} style = {styles.howAboutListenSecond}
                onPress={() => router.push({
                    pathname: '/tabs/home/albumDetails',
                    params: {
                      id: album.id?.toString() ?? '',
                      name: album.name,
                      imageUrl: album.imageUrl,
                      artist: album.artist
                    },
                  })}
              >
             <View style={styles.darkLaouyt}/>
              <View style={styles.vinylContainerHowAboutListen}>
                <Animated.Image
                  source={require('@/customComponents/images/pngPLastinka.png')}
                  style={styles.vinyl}
                />
                     {album && (
                        <Animated.Image
                          source={{ uri: album.imageUrl }}
                          style={styles.centerImageHowAboutListen}
                          resizeMode="contain"
                        />
                      )} 
              </View>
              <View>
                <View style={{}}>
                  <Text style={styles.txtHowAbout}>Как насчет?</Text>
                  {/* <Entypo name="dots-three-vertical" size={15} color="white" style={{zIndex: 4}} /> */}
                </View>
                <View>
                  <Image style={styles.imgArtist} source={{uri: album.img_artist}} />
                  <Text style={styles.txtHowAboutArtist}>{album.artist}</Text>
                </View>
                <View style={styles.countText}>
                  {album.track_count == 1 && (
                    <Text style={{color: '#aaaaaaff', zIndex: 4, fontFamily: 'MyFont'}}>Сингл</Text>
                  )}
                  {album.track_count > 3 && (
                    <Text style={{color: '#aaaaaaff', zIndex: 4, fontFamily: 'MyFont'}}>Альбом</Text>
                  )}
                  {album.track_count <= 3 && album.track_count > 1 && (
                    <Text style={{color: '#aaaaaaff', zIndex: 4, fontFamily: 'MyFont'}}>Мини-альбом</Text>
                  )}
                </View>
                <View style={styles.howAboutAlbumName}>
                  <Text style={{color: '#ffffffff', zIndex: 4, fontFamily: 'MyFont', fontSize: 40}}>{truncateText(album.name, 15)}</Text>
                </View>
                <View style={styles.count}>
                  {album.track_count == 1 && (
                    <Text style={{color: '#ffffffff', zIndex: 4, fontFamily: 'MyFont'}}>{album.track_count} трек</Text>
                  )}
                  {album.track_count > 3 && (
                    <Text style={{color: '#ffffffff', zIndex: 4, fontFamily: 'MyFont'}}>{album.track_count} треков</Text>
                  )}
                  {album.track_count <= 4 && album.track_count > 1 && (
                    <Text style={{color: '#ffffffff', zIndex: 4, fontFamily: 'MyFont'}}>{album.track_count} трека</Text>
                  )}
                </View>
              </View>
          </TouchableOpacity>
            )
          })}
          
        </View>
        <View style={styles.horizontalVievLike}>
          <Text style={styles.txtLike}>Вам также может понравиться?</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {albums.slice(0, 4).map((album, index) => {
              let itemStyle;
              if (index === 0) itemStyle = styles.horizontalView1;
              else if (index === 1) itemStyle = styles.horizontalView2;
              else if (index === 2) itemStyle = styles.horizontalView3;
              else if (index === 3) itemStyle = styles.horizontalView4;
              else return null;

              return (
                <TouchableOpacity
                  key={album.id ?? index}
                  style={[itemStyle, {backgroundColor: albumColors[album.id] ?? '#121212'}]}
                  onPress={() => router.push({
                    pathname: '/tabs/home/albumDetails',
                    params: {
                      id: album.id?.toString() ?? '',
                      name: album.name,
                      imageUrl: album.imageUrl,
                      artist: album.artist
                    },
                  })}
 
                >
                  <View style={styles.darkLaouyt}/>
                    <View style={styles.vinylContainerHorizontal}>
                      <Animated.Image
                        source={require('@/customComponents/images/pngPLastinka.png')}
                        style={styles.vinylHorizontal}
                      />
                      {album.imageUrl && (
                        <Animated.Image
                          key={album.imageUrl}
                          source={{ uri: album.imageUrl }}
                          style={styles.centerImageHorizontal}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  <Text style={styles.textSongHorizontal}>{truncateText(album.name, 15)}</Text>
                  <Text style={styles.textArtistHorizontal}>{truncateText(album.artist, 15)}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.horizontalviewArtist}>
          <Text style={styles.txtLike}>Артисты, которых можно послушать</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {artist.slice(0, 4).map((a, index) => (
              <TouchableOpacity
                key={a.id ?? index}
                style={styles.artistCard}
                onPress={() => router.push({
                    pathname: '/tabs/home/artistDetails',
                    params: {
                      name: a.name,           // Имя артиста
                      imageUrl: a.img_artist, // Аватарка артиста (используется как фон на следующем экране)
                      id: a.id?.toString()    // ID если понадобится для запросов
                    },
                  })}
              >
                <Image
                  source={{ uri: a.img_artist }}
                  style={styles.artistAvatar}
                />
                <Text style={styles.artistName} numberOfLines={1}>
                  {truncateText(a.name, 18)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          </View>
      </ScrollView>
    </View>
  );
}
