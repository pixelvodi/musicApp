import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. Создаем интерфейс для данных контекста
interface ThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => Promise<void>; // Типизируем как Promise, так как функция async
}

// 2. Используем интерфейс при создании контекста
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [accentColor, setAccentColor] = useState('#62d273');

  useEffect(() => {
    AsyncStorage.getItem('accentColor').then(saved => {
      if (saved) setAccentColor(saved);
    });
  }, []);

  // utils/ThemeContext.tsx
const updateAccentColor = async (color: string) => {
  console.log(`[ThemeContext] Попытка смены цвета на: ${color}`); // ЛОГ ЗДЕСЬ
  try {
    setAccentColor(color);
    await AsyncStorage.setItem('accentColor', color);
    console.log('[ThemeContext] Цвет успешно сохранен в AsyncStorage');
  } catch (e) {
    console.error('[ThemeContext] Ошибка при сохранении цвета:', e);
  }
};

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor: updateAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Улучшаем хук для безопасности типов
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};