import ImageColors from 'react-native-image-colors';

/**
 * Возвращает доминирующий цвет изображения.
 * @param imageUrl — ссылка на изображение (string)
 * @returns строка с цветом, например "#121212"
 */
export async function getDominantColor(imageUrl: string): Promise<string> {
  try {
    const colors = await ImageColors.getColors(imageUrl, {
      fallback: '#121212',
      cache: true,
      key: imageUrl,
    });

    switch (colors.platform) {
      case 'android':
        return colors.dominant ?? '#121212';
      case 'ios':
        return colors.primary ?? '#121212';
      case 'web':
        return colors.dominant ?? '#121212';
      default:
        return '#121212';
    }
  } catch (error) {
    console.warn('Ошибка получения доминирующего цвета:', error);
    return '#121212';
  }
}

export async function getDominantColorForOneAlbum(imageUrl: string) {
  try {
    const colors = await ImageColors.getColors(imageUrl, {
      fallback: '#121212',
      cache: true,
      key: imageUrl,
    });

    switch (colors.platform) {
      case 'android':
        return colors.dominant ?? '#121212';
      case 'ios':
        return colors.primary ?? '#121212';
      case 'web':
        return colors.dominant ?? '#121212';
      default:
        return '#121212';
    }
  } catch (error) {
    console.warn('Ошибка получения доминирующего цвета:', error);
    return '#121212';
  }
}