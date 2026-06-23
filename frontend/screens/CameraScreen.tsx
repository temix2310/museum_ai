import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Image, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Typography } from '../components/Theme';
import { uploadPaintingImage } from '../services/api';
import * as Haptics from 'expo-haptics';

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

interface Props {
  navigation: CameraScreenNavigationProp;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Размеры рамки выделения по умолчанию
const INITIAL_BOX_SIZE = 220;

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<{ uri: string; width: number; height: number } | null>(null);
  
  // Координаты и размеры рамки выделения
  const [boxX, setBoxX] = useState((SCREEN_WIDTH - INITIAL_BOX_SIZE) / 2);
  const [boxY, setBoxY] = useState((SCREEN_HEIGHT - INITIAL_BOX_SIZE) / 2 - 50);
  const [boxWidth, setBoxWidth] = useState(INITIAL_BOX_SIZE);
  const [boxHeight, setBoxHeight] = useState(INITIAL_BOX_SIZE);

  const cameraRef = useRef<any>(null);
  
  // Координаты начала перетаскивания (для корректного смещения)
  const dragStartPos = useRef({ x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });

  if (!permission) {
    return (
      <View style={styles.fallbackContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.fallbackContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.textMuted} style={{ marginBottom: 16 }} />
        <Text style={styles.fallbackText}>Для распознавания картин приложению нужен доступ к камере.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Предоставить доступ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Делаем снимок
  const takePicture = async () => {
    if (cameraRef.current && !loading) {
      try {
        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          skipProcessing: false,
        });

        if (photo) {
          setCapturedPhoto(photo);
        }
      } catch (error) {
        console.error('Ошибка съемки:', error);
        Alert.alert('Ошибка', 'Не удалось сделать фото.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Обрезка и отправка
  const cropAndRecognize = async () => {
    if (!capturedPhoto) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Рассчитываем соотношение сторон снимка и экрана
      // Камера на весь экран обычно растягивает изображение по высоте,
      // поэтому сопоставим координаты экрана с координатами реального фото
      const scaleX = capturedPhoto.width / SCREEN_WIDTH;
      const scaleY = capturedPhoto.height / SCREEN_HEIGHT;

      // Масштабируем область кропа
      const originX = Math.round(boxX * scaleX);
      const originY = Math.round(boxY * scaleY);
      const width = Math.round(boxWidth * scaleX);
      const height = Math.round(boxHeight * scaleY);

      // Проверка границ на случай округлений
      const safeOriginX = Math.max(0, Math.min(capturedPhoto.width - width, originX));
      const safeOriginY = Math.max(0, Math.min(capturedPhoto.height - height, originY));
      const safeWidth = Math.min(capturedPhoto.width - safeOriginX, width);
      const safeHeight = Math.min(capturedPhoto.height - safeOriginY, height);

      // Обрезаем изображение
      const croppedResult = await manipulateAsync(
        capturedPhoto.uri,
        [
          {
            crop: {
              originX: safeOriginX,
              originY: safeOriginY,
              width: safeWidth,
              height: safeHeight,
            },
          },
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      // Отправляем на бэкенд
      const result = await uploadPaintingImage(croppedResult.uri);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('PaintingDetail', { result });

    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Экспонат не найден',
        'Не удалось распознать картину в выделенной области. Попробуйте точнее настроить рамку или сделать другое фото.',
        [{ text: 'Понятно', onPress: () => setLoading(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  // ОБРАБОТЧИКИ ПЕРЕТАСКИВАНИЯ (Кастомный тач-интерфейс без лишних библиотек)

  // Перемещение рамки
  const handleBoxTouchStart = (e: any) => {
    const touch = e.nativeEvent;
    dragStartPos.current = {
      x: touch.pageX,
      y: touch.pageY,
      boxX,
      boxY,
      boxW: boxWidth,
      boxH: boxHeight
    };
  };

  const handleBoxTouchMove = (e: any) => {
    const touch = e.nativeEvent;
    const dx = touch.pageX - dragStartPos.current.x;
    const dy = touch.pageY - dragStartPos.current.y;

    // Ограничиваем перемещение границами экрана
    let newX = dragStartPos.current.boxX + dx;
    let newY = dragStartPos.current.boxY + dy;

    newX = Math.max(0, Math.min(SCREEN_WIDTH - boxWidth, newX));
    newY = Math.max(40, Math.min(SCREEN_HEIGHT - boxHeight - 120, newY)); // Оставляем место сверху под шапку и снизу под кнопки

    setBoxX(newX);
    setBoxY(newY);
  };

  // Изменение размера рамки (тянем за правый нижний угол)
  const handleResizeTouchStart = (e: any) => {
    e.stopPropagation(); // Чтобы событие перемещения самой рамки не срабатывало
    const touch = e.nativeEvent;
    dragStartPos.current = {
      x: touch.pageX,
      y: touch.pageY,
      boxX,
      boxY,
      boxW: boxWidth,
      boxH: boxHeight
    };
  };

  const handleResizeTouchMove = (e: any) => {
    e.stopPropagation();
    const touch = e.nativeEvent;
    const dx = touch.pageX - dragStartPos.current.x;
    const dy = touch.pageY - dragStartPos.current.y;

    // Минимальный размер 100x100, максимальный - до краев экрана
    let newW = dragStartPos.current.boxW + dx;
    let newH = dragStartPos.current.boxH + dy;

    newW = Math.max(100, Math.min(SCREEN_WIDTH - boxX, newW));
    newH = Math.max(100, Math.min(SCREEN_HEIGHT - boxY - 120, newH));

    setBoxWidth(newW);
    setBoxHeight(newH);
  };

  // РЕНДЕР: ШАГ 1 (СЪЕМКА ФОТО)
  if (!capturedPhoto) {
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            {/* Верхняя часть пустая для предотвращения наложения на крестик */}
            <View />

            {/* Элементы управления снизу */}
            <View style={styles.bottomCameraControls}>
              <Text style={styles.cameraTitle}>Сфотографируйте картину</Text>
              
              {loading ? (
                <ActivityIndicator size="large" color="#FFF" style={styles.shutterButton} />
              ) : (
                <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                  <View style={styles.shutterButtonInner} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
        
        {/* Белая кнопка крестика для выхода */}
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // РЕНДЕР: ШАГ 2 (ИНТЕРАКТИВНОЕ ВЫДЕЛЕНИЕ)
  return (
    <View style={styles.container}>
      {/* Снимок на полный экран */}
      <Image
        source={{ uri: capturedPhoto.uri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Белая кнопка крестика для выхода */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Затемненная маска вокруг рамки */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {/* Верхняя тень */}
        <View style={[styles.maskDark, { height: boxY, width: SCREEN_WIDTH }]} />
        
        {/* Средний ряд (тень левая, рамка, тень правая) */}
        <View style={{ flexDirection: 'row', height: boxHeight }} pointerEvents="box-none">
          <View style={[styles.maskDark, { width: boxX, height: boxHeight }]} />
          
          {/* Прозрачное окно видоискателя с рамкой */}
          <View 
            style={[styles.cropFrame, { width: boxWidth, height: boxHeight }]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleBoxTouchStart}
            onResponderMove={handleBoxTouchMove}
          >
            {/* Угловые синие маркеры */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Текст внутри рамки */}
            <View style={styles.frameCenterTextContainer}>
              <Ionicons name="move" size={24} color={Colors.accentMuted} />
              <Text style={styles.frameCenterText}>Перетащите на картину</Text>
            </View>

            {/* Сенсорная кнопка ресайза (правый нижний угол) */}
            <View
              style={styles.resizeHandle}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleResizeTouchStart}
              onResponderMove={handleResizeTouchMove}
            >
              <Ionicons name="resize" size={20} color="#FFF" />
            </View>
          </View>

          <View style={[styles.maskDark, { width: SCREEN_WIDTH - boxX - boxWidth, height: boxHeight }]} />
        </View>

        {/* Нижняя тень */}
        <View style={[styles.maskDark, { height: SCREEN_HEIGHT - boxY - boxHeight, width: SCREEN_WIDTH }]} />
      </View>

      {/* Панель управления снизу */}
      <View style={styles.controlsPanel}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Обработка кадра...</Text>
          </View>
        ) : (
          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={() => setCapturedPhoto(null)}
            >
              <Ionicons name="arrow-undo-outline" size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Переснять</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]} 
              onPress={cropAndRecognize}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Распознать</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  fallbackText: {
    ...Typography.bodyLarge,
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.textMuted,
  },
  permissionButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 40,
  },
  bottomCameraControls: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20, // Отодвигаем от кнопки вниз
    textAlign: 'center',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  maskDark: {
    backgroundColor: 'rgba(15, 26, 28, 0.65)',
  },
  cropFrame: {
    borderWidth: 2,
    borderColor: Colors.accent,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: Colors.accent,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  frameCenterTextContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 26, 28, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    opacity: 0.9,
  },
  frameCenterText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 38,
    height: 38,
    backgroundColor: Colors.accent,
    borderTopLeftRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
    paddingTop: 4,
  },
  controlsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    marginTop: 8,
    fontWeight: '600',
    color: Colors.primary,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    flex: 0.47,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Затемненный круг для высокой контрастности на любом фоне
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // Поверх всего
  },
});
