import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Typography } from '../components/Theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
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
});
