import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const CustomNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View style={ styles.container }>
      {state.routes
      .filter((route => ['home', 'search', 'library'].includes(route.name)))
      .map((route, index) => {

        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={ [styles.tabItem, { backgroundColor: isFocused ? 'transparent' : 'transparent' }] }
          >
            {getIconByRouteName(route.name, isFocused ? 'white' : 'lightgrey')}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  function getIconByRouteName(routeName: string, color: string) {
    switch(routeName) {
        case "home":
            return <Feather name='home' size={30} color={color} />;
        case "search":
            return <Feather name='search' size={30} color={color} />;
        case "library":
            return <Feather name='book-open' size={30} color={color} />;
        default:
            return <Feather name='home' size={30} color={color} />;
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