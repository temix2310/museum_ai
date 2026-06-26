import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Typography } from '../components/Theme';
import { ScanResult } from '../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const MOCK_RESULTS: Record<string, any> = {
  mona_lisa: {
    painting_id: 'mona_lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    artist_id: 'leonardo_da_vinci',
    year: 1503,
    story: 'Я писал её четыре года. Говорят, улыбка её загадочна — но я просто пытался поймать момент живой мысли на лице.',
    audio_url: '/audio/mona_lisa',
    artist_photo_url: '/artist/leonardo_da_vinci',
    local_audio: require('../assets/mona_lisa.mp3'),
    local_photo: require('../assets/leonardo_da_vinci.jpg')
  },
  starry_night: {
    painting_id: 'starry_night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    artist_id: 'vincent_van_gogh',
    year: 1889,
    story: 'Я написал её из окна своей палаты в Сен-Реми. Ночное небо живёт и дышит — я писал не то, что видел, а то, что чувствовал.',
    audio_url: '/audio/starry_night',
    artist_photo_url: '/artist/vincent_van_gogh',
    local_audio: require('../assets/starry_night.mp3'),
    local_photo: require('../assets/vincent_van_gogh.jpg')
  }
};

export default function HomeScreen({ navigation }: Props) {
  const handleMockPress = (id: string) => {
    const result = MOCK_RESULTS[id];
    if (result) {
      navigation.navigate('PaintingDetail', { result });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Приветственный блок */}
      <View style={styles.welcomeSection}>
        <Text style={styles.subtitle}>ЭЛЕКТРОННЫЙ АУДИОГИД</Text>
        <Text style={styles.title}>Интерактивный путеводитель</Text>
        <Text style={styles.description}>
          Сделайте фото картины, выделите её границы на экране, и приложение расскажет вам её историю голосом автора.
        </Text>
      </View>

      {/* Кнопка сканирования в бело-синем стиле */}
      <View style={styles.scannerWrapper}>
        <TouchableOpacity
          style={styles.scanButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Camera')}
        >
          <View style={styles.scanButtonInner}>
            <Ionicons name="camera" size={48} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.scanButtonText}>Сделать снимок картины</Text>
      </View>

      {/* Раздел экспонатов */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Экспонаты в зале</Text>
          <Text style={styles.sectionSubtitle}>Нажмите для быстрого прослушивания без камеры:</Text>
        </View>

        {/* Карточки картин в светлом стиле с синими акцентами */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => handleMockPress('mona_lisa')}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Mona Lisa</Text>
              <Text style={styles.cardArtist}>Leonardo da Vinci</Text>
              <Text style={styles.cardYear}>1503 год</Text>
            </View>
            <View style={styles.cardActionIcon}>
              <Ionicons name="headset" size={20} color={Colors.accent} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => handleMockPress('starry_night')}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>The Starry Night</Text>
              <Text style={styles.cardArtist}>Vincent van Gogh</Text>
              <Text style={styles.cardYear}>1889 год</Text>
            </View>
            <View style={styles.cardActionIcon}>
              <Ionicons name="headset" size={20} color={Colors.accent} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginTop: 15,
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    // Мягкая тень для светлой темы
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  title: {
    ...Typography.titleLarge,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    color: Colors.textMuted,
    lineHeight: 21,
  },
  scannerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  scanButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonInner: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    ...Typography.bodyLarge,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 14,
  },
  recentSection: {
    width: '100%',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.primary,
  },
  sectionSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: 'Georgia',
  },
  cardArtist: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 3,
  },
  cardYear: {
    fontSize: 12,
    color: Colors.accent,
    marginTop: 3,
    fontWeight: '600',
  },
  cardActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
