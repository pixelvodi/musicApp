import { responsive } from '@/utils/responsive';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ImageColors from 'react-native-image-colors';
import Animated from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setAlbums] = useState();
  const imageUrlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  const [bgColor, setBgColor] = useState<string>('#121212');
  const [value, setValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  useEffect(() => {
    axios.get('http://192.168.1.2:3000/albumsImg')
      .then(response => {
        setAlbums(response.data[0].imageUrl)
        console.log(response.data)
      })
      .catch(error => {
        console.error('Error fetching albums:', error);
      });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Ошика',
        text2: 'Заполните все поля',
        position: 'bottom',
    });
    return;
    }
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Ошика',
        text2: 'Заполните почту правильно',
        position: 'bottom',
    });
    return;
    }
    try {
      const response = await axios.post(`http://192.168.1.2:3000/users/login`, {
        email,
        password
      });

      await AsyncStorage.setItem('userEmail', email);
      router.push('/tabs/home');

      console.log("Norm", response.data)
    }
    // Здесь будет логика отправки данных на сервер
    catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) {
      Toast.show({
        type: 'error',
        text1: 'Неверный логин или пароль',
        text2: 'Проверьте введённые данные',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
        
}}
};

const visibleOrNoVisiblePassword = async () =>{
  setIsVisible(!isVisible);

  {isVisible && (
    <TouchableOpacity style={styles.eyePassword} onPress={visibleOrNoVisiblePassword}>
          <AntDesign style={styles.eyePassword} name="eye-invisible" size={24} color="black" />
        </TouchableOpacity>
  )}
}

const routerOnReg = async () => {
    router.push('./registration')
}

useEffect(() => {
    if (typeof imageUrl === 'string') {
      ImageColors.getColors(imageUrl, {
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
  }, [imageUrl]);

const handleChange = (text: string) => {
  setEmail(text);
  setValue(text);
  if (!text) {
    setError('Email is empty');
    console.log("Email is empty");
  } else if (!/\S+@\S+\.\S+/.test(text)) {
    setError('Invalid email');
    console.log("Invalid email");
  } else {
    setError(null);
    console.log("Valid email");
  }
};





  return (
    <View style={[styles.container, {backgroundColor: bgColor}]}>
      <LinearGradient
        colors={['transparent', '#000']}
        style={styles.containerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}/>
      <View style={styles.vinylLayer}>
        <View style={styles.blackBackground} />
          <Animated.View style={[styles.vinylWrapper]}>
            <Animated.Image
              source={require('@/customComponents/images/pngPLastinka.png')}
              style={styles.vinyl}
              resizeMode="contain"
            />
            {typeof imageUrl === 'string' && (
              <Animated.Image
                source={{ uri: imageUrl }}
                style={styles.albumCenterImg}
                resizeMode="cover"
              />
            )}
          </Animated.View>
      </View>
      

      <View style={styles.uiWrapper}>
        
      <Text style={styles.title}>Авторизация</Text>
      <View style={styles.emailView}>
      
        <TextInput
          style={[
            styles.input,
            value.length === 0
              ? null
              : error
              ? styles.inputError
              : styles.inputValid
          ]}
          placeholder="Email"
          value={value}               // 👈 вот тут передаётся value
          onChangeText={handleChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {email !== '' && (
        <Text
          style={[
            styles.validOrNoText,
            error ? styles.inputErrorTxt : styles.inputValidTxt
          ]}
        >
          {error ? 'Адрес почты не верный' : 'Адрес почты верный'}
        </Text>
      )}

      </View>

      <View>
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          onChangeText={setPassword}
          secureTextEntry={!isVisible}
        />
        <TouchableOpacity style={styles.eyePassword} onPress={() => setIsVisible(prev => !prev)}>
          <AntDesign
            name={isVisible ? "eye" : "eye-invisible"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>


      <TouchableOpacity style={[styles.loginScreenButton, 
        error ? styles.inputErrorBtn : styles.inputValidBtn]} 
        onPress={handleLogin} disabled={error ? true : false}>
        <Text style={styles.loginText}>Войти</Text>
      </TouchableOpacity>
      <View style={styles.viewForTxt}>
        <Text style={styles.txtForLogin}>Нет аккаунта?</Text>
      <TouchableOpacity
        onPress={routerOnReg}>
        <Text style={styles.txtForLoginBtn}>Зарегестрироваться</Text>
      </TouchableOpacity>
      </View>
      </View>
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#121212',
  },
  containerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5, // выше винила
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'MyFont'
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    color: 'white',
    fontFamily: 'MyFont',
  },
  emailView: {
    alignItems: 'stretch',
    justifyContent: 'space-between'
  },
  inputError: {
    borderColor: 'red',
  },
  inputErrorTxt: {
    color: 'red'
  },
  inputErrorBtn: {
    backgroundColor: '#979797',
  },
  inputValid: {
    borderColor: 'green'
  },
  inputValidBtn: {
    backgroundColor: 'white',
    
  },
  inputValidTxt: {
    color: 'green'
  },
  validOrNoText:{
    position: 'absolute',
    right: 10,
    top: 19,
    color: 'white',
    fontSize: 10,
  },
    loginScreenButton:{
    marginRight:40,
    marginLeft:40,
   marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    borderRadius:10,
  },
  loginText:{
      color:'#000000ff',
      textAlign:'center',
      paddingLeft : 10,
      paddingRight : 10,
      fontFamily: 'MyFont'
  },
  eyePassword: {
    position: 'absolute',
    right: 10,
    top: 12,
    color: 'white',
    
  },
  vinylLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  blackBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    opacity: 0.7,
    zIndex: 1,
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
  uiWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    zIndex: 10, // выше градиента и винила
    marginBottom: 70
  },
  viewImgOrTitle: {
    width: '100%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  logoImg: {
    width: responsive.number(160),
    height: responsive.number(160),
    borderRadius: 10,
    position: 'relative'
  },
  viewForTxt: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 10
  },
  txtForLogin: {
    fontFamily: 'MyFont',
    color: 'white',
    marginRight: 10
  },
  txtForLoginBtn: {
    fontFamily: 'MyFont',
    color: 'white',
    textDecorationLine: 'underline'
  }
});
