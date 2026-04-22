import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Варианты анимации:
        // 'slide_from_right' (дефолт для Android)
        // 'slide_from_bottom' (часто используется для модальных окон)
        // 'fade' (плавное появление)
        // 'none' (мгновенный переход)
        animation: 'fade', 
        
        // Дополнительные настройки для iOS
        gestureEnabled: true, // Позволяет закрывать страницу свайпом
        gestureDirection: 'vertical', // Направление свайпа для закрытия
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="albumDetails" 
        options={{
          // Можно задать индивидуальную анимацию только для этого экрана
          animation: 'fade', 
          presentation: 'modal', // Делает экран похожим на карточку (на iOS)
        }} 
      />
    </Stack>
  );
}