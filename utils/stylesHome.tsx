import { responsive } from '@/utils/responsive';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
   
  },
  topLine: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imgLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    borderRadius: 50,
  },
  txtLogo: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Marmelad-Regular', //разобрать потом
  },
  settingsIcon: {
    color: '#FFFFFF',
  },
  content: {
    marginTop: 110,
    width: '100%',
    paddingBottom: 140,
    
  },
  recentlyListened: {
    width: '100%',
    height: responsive.number(170),
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
    justifyContent: 'space-between',
  },

  recentlyListened1: {
    width: '48%',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 5,
    overflow: 'hidden',
    position: 'relative'
  },
  textSong1: {
    position: 'absolute',
    top: 25,
    left: 10,
    color: '#fff',
    zIndex: 4,
    fontFamily: 'MyFont'
  },
  recentlyListened2: {
    width: '48%',
    height: 70,
    backgroundColor: '#be1a1aff',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  recentlyListened3: {
    width: '48%',
    height: 70,
    backgroundColor: '#ffe0e0ff',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  recentlyListened4: {
    width: '48%',
    height: 70,
    backgroundColor: '#ffffffff',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
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
  howAboutListen: {
    width: '100%',
    height: responsive.number(170),
    paddingHorizontal: 10
    
  },
  howAboutListenSecond: {
    backgroundColor: '#fff',
    width: '100%',
    height: responsive.number(160),
    borderRadius: 10,
    overflow: 'hidden'
  },
  vinylContainerHowAboutListen: {
    position: "absolute",
    width: 520,
    height: 520,
    top: -170,
    left: -10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  centerImageHowAboutListen: {
    width: 180, // Размер центрального изображения
    height: 180,
    left: 50,
    borderRadius: 160, // Круглая форма
  },
  txtHowAbout: {
    position: 'absolute',
    marginStart: 10,
    marginTop: 5,
    color: '#fff',
    zIndex: 4,
    fontFamily: 'MyFont',
    fontSize: 20
  },
  imgArtist: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 50,
    zIndex: 4,
    marginStart: 10,
    marginTop: 40,
  },
  txtHowAboutArtist: {
    position: 'absolute',
    marginStart: 45,
    marginTop: 45,
    color: '#fff',
    zIndex: 4,
    fontFamily: 'MyFont',
    fontSize: 14
  },
  countText: {
    position: 'absolute',
    marginStart: 15,
    marginTop: 70,
    zIndex: 4,
    // fontSize: 14,
  },
  howAboutAlbumName: {
    position: 'absolute',
    marginStart: 15,
    marginTop: 80,
    zIndex: 4,
  },
  count: {
    position: 'absolute',
    marginStart: 15,
    marginTop: 130,
    zIndex: 4,
  },

  horizontalVievLike: {
    marginLeft: 10
  },

  horizontalView1: {
    width: responsive.number(170),
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 5,
    overflow: 'hidden',
    position: 'relative'
  },
  horizontalView2: {
    width: responsive.number(170),
    height: 170,
    backgroundColor: '#be1a1aff',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 5,
    overflow: 'hidden',
    position: 'relative'
  },
  horizontalView3: {
    width: responsive.number(170),
    height: 170,
    backgroundColor: '#ffe0e0ff',
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  horizontalView4: {
    width: responsive.number(170),
    height: 170,
    backgroundColor: '#ffffffff',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 5,
    overflow: 'hidden',
    position: 'relative'
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
  
  txtLike: {
    fontFamily: 'MyFont',
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
  },

  textSongHorizontal: {
    position: 'absolute',
    top: 125,
    left: 5,
    color: '#fff',
    zIndex: 4,
    fontFamily: 'MyFont',
    fontSize: 20
  },

  textArtistHorizontal: {
    position: 'absolute',
    top: 150,
    left: 5,
    color: '#6e6e6eff',
    zIndex: 4,
    fontFamily: 'MyFont',
    fontSize: 13
  },

  horizontalviewArtist: {
    marginLeft: 10
  },
  artistCard: {
    width: 170,          
    alignItems: 'center',
    marginRight: 15,
  },

  artistAvatar: {
    width: 170,
    height: 170,
    borderRadius: 85,    
    backgroundColor: '#2a2a2a',
    resizeMode: 'cover'
  },

  artistName: {
    marginTop: 8,
    color: '#fff',
    fontFamily: 'MyFont',
    fontSize: 14,
    textAlign: 'center',
  },


})