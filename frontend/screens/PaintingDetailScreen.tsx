import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Typography } from '../components/Theme';
import { BASE_URL } from '../services/api';

type PaintingDetailRouteProp = RouteProp<RootStackParamList, 'PaintingDetail'>;

interface Props {
  route: PaintingDetailRouteProp;
}

export default function PaintingDetailScreen({ route }: Props) {
  const { result } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const localPhoto = (result as any).local_photo;
  const localAudio = (result as any).local_audio;

  const fullAudioUrl = result.audio_url.startsWith('http') 
    ? result.audio_url 
    : `${BASE_URL}${result.audio_url}`;

  const fullArtistPhotoUrl = result.artist_photo_url.startsWith('http') 
    ? result.artist_photo_url 
    : `${BASE_URL}${result.artist_photo_url}`;

  const imageSource = localPhoto ? localPhoto : { uri: fullArtistPhotoUrl };
  const audioSource = localAudio ? localAudio : { uri: fullAudioUrl };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setAudioPosition(status.positionMillis);
      setAudioDuration(status.durationMillis || 1);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setAudioPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      if (soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      } else {
        setLoadingAudio(true);
        const { sound } = await Audio.Sound.createAsync(
          audioSource,
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setLoadingAudio(false);
        setIsPlaying(true);
      }
    } catch (error) {
      setLoadingAudio(false);
      console.error('Ошибка воспроизведения аудио:', error);
    }
  };

  const getProgress = () => {
    if (audioDuration === 0) return 0;
    return audioPosition / audioDuration;
  };

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Карточка художника */}
      <View style={styles.artistSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={imageSource}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.artistIntro}>Голос автора:</Text>
        <Text style={styles.artistName}>{result.artist}</Text>
      </View>

      {/* Информационная плашка картины */}
      <View style={styles.infoCard}>
        <Text style={styles.paintingTitle}>{result.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Создано:</Text>
          <Text style={styles.metaValue}>{result.year} г.</Text>
        </View>
      </View>

      {/* Аудиоплеер в сине-белых тонах */}
      <View style={styles.playerCard}>
        <Text style={styles.playerTitle}>Рассказ о картине</Text>
        
        {/* Прогресс-бар */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${getProgress() * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(audioPosition)}</Text>
            <Text style={styles.timeText}>{formatTime(audioDuration)}</Text>
          </View>
        </View>

        {/* Кнопка воспроизведения */}
        <View style={styles.controlsRow}>
          {loadingAudio ? (
            <ActivityIndicator size="large" color={Colors.accent} style={styles.playButton} />
          ) : (
            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
              <Ionicons 
                name={isPlaying ? "pause-circle" : "play-circle"} 
                size={64} 
                color={Colors.accent} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Текстовая история */}
      <View style={styles.storyCard}>
        <View style={styles.storyHeader}>
          <Ionicons name="chatbubble-ellipses" size={20} color={Colors.accent} />
          <Text style={styles.storyTitle}>История создания</Text>
        </View>
        <Text style={styles.storyText}>{result.story}</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  artistSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.border,
    padding: 4,
    backgroundColor: '#FFF',
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  artistIntro: {
    ...Typography.caption,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  artistName: {
    ...Typography.titleMedium,
    marginTop: 4,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  paintingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaLabel: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    marginRight: 6,
  },
  metaValue: {
    ...Typography.bodyLarge,
    color: Colors.accent,
    fontWeight: '600',
  },
  playerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  playerTitle: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  controlsRow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: Colors.primary,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storyTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 8,
  },
  storyText: {
    ...Typography.bodyLarge,
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    fontStyle: 'italic',
  },
});
