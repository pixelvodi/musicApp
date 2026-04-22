import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useHomeLogic } from '../../../utils/logicHome';
import { styles } from '../../../utils/stylesHome';

export default function Home() {
  const { albums, albumHowAboutListen, albumColors, clearReg, artist } = useHomeLogic();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topLine}>
        <Image style={styles.imgLogo} source={require('@/assets/images/ava.jpg')} />
        <Text style={styles.txtLogo}>Luma</Text>
        <TouchableOpacity onPress={clearReg}>
          <AntDesign name="setting" size={35} style={styles.settingsIcon} />
        </TouchableOpacity>
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
                  <Text style={styles.textSong1}>{album.name}</Text>
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
                  <Text style={{color: '#ffffffff', zIndex: 4, fontFamily: 'MyFont', fontSize: 40}}>{album.name}</Text>
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
                  <Text style={styles.textSongHorizontal}>{album.name}</Text>
                  <Text style={styles.textArtistHorizontal}>{album.artist}</Text>
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
                // onPress={() =>
                //   // router.push({
                //   //   pathname: '/tabs/albumsDetail',
                //   //   params: { id: artist.id?.toString() ?? '' },
                //   // })
                // }
              >
                <Image
                  source={{ uri: a.img_artist }}
                  style={styles.artistAvatar}
                />
                <Text style={styles.artistName} numberOfLines={1}>
                  {a.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          </View>
      </ScrollView>
    </View>
  );
}
