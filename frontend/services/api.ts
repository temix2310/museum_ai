import { ScanResult } from '../types';

// Настройки подключения к бэкенду
// ВАЖНО: Так как приложение запускается на телефоне через Expo Go,
// localhost работать не будет. Нужно указать локальный IP-адрес вашего компьютера.
// Пример: 'http://192.168.1.100:8000'
export const BASE_URL = 'http://192.168.0.162:8000'; // Автоматически определенный IP вашего компьютера

/**
 * Отправляет снимок с камеры на сервер для распознавания картины
 * @param imageUri Локальный URI снимка на телефоне
 */
export async function uploadPaintingImage(imageUri: string): Promise<ScanResult> {
  const formData = new FormData();

  // Формируем файл для отправки
  const filename = imageUri.split('/').pop() || 'painting.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  // В React Native FormData требует объект с uri, name, type
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  try {
    const response = await fetch(`${BASE_URL}/experience`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при отправке изображения:', error);
    throw error;
  }
}
