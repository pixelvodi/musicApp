// db.ts
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'musicapp.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

export const connectToDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // Создаем папку SQLite, если ее нет
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });

  // Проверяем, существует ли уже база
  const dbInfo = await FileSystem.getInfoAsync(DB_PATH);

  if (!dbInfo.exists) {
    console.log('Copying pre-populated DB...');
    const asset = Asset.fromModule(require('@/db/musicapp.db'));
    await asset.downloadAsync(); // гарантирует, что файл доступен

    // Копируем из ассетов в SQLite-папку
    await FileSystem.copyAsync({
      from: asset.localUri!,
      to: DB_PATH,
    });
    console.log('Database copied');
  } else {
    console.log('Database already exists');
  }

  // Подключаемся к базе
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
};
