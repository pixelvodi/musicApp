import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const CustomNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        // 1. Убираем служебные роуты сразу
        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        // 2. ФИЛЬТР: Проверьте в консоли, как называются ваши роуты!
        // Если кнопки не появились, временно закомментируйте эту строку:
        const allowedRoutes = ['home', 'search', 'library'];
        if (!allowedRoutes.includes(route.name)) return null;

        // 3. ПРАВИЛЬНОЕ определение фокуса (по индексу из state)
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            {getIconByRouteName(route.name, isFocused ? 'white' : 'lightgrey')}
          </TouchableOpacity>
        );
      })}
    </View>
  );
  
  // Функция иконок внутри или снаружи
  function getIconByRouteName(routeName: string, color: string) {
    // Если ваши роуты называются по-другому (например, "index"), 
    // добавьте соответствующие case сюда
    switch(routeName) {
      case "home": return <Feather name='home' size={30} color={color} />;
      case "search": return <Feather name='search' size={30} color={color} />;
      case "library": return <Feather name='book-open' size={30} color={color} />;
      default: return <Feather name='grid' size={30} color={color} />;
    }
  }
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width : '80%',
    alignSelf : 'center',
    bottom: 10,
    borderRadius: 30,
    padding: 12,
  },
  tabItem: {
      flexDirection: 'column',
      justifyContent : 'center',
      alignItems : 'center',
      height : 45,
      paddingHorizontal: 40,
      borderRadius: 30,
    },
    text: {
        color: 'black',
        marginLeft: 8
    }
});


export default CustomNavBar;