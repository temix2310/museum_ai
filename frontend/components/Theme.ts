export const Colors = {
  background: '#F8FAFC',       // Чистый светлый фон (светло-серый с голубым оттенком)
  cardBackground: '#FFFFFF',   // Белоснежные карточки для контраста
  primary: '#1E3A8A',          // Глубокий классический синий (цвет академических галерей)
  accent: '#2563EB',           // Насыщенный синий для активных кнопок и рамок
  accentMuted: '#60A5FA',      // Светло-синий для вспомогательных элементов
  text: '#0F172A',             // Темно-грифельный текст (высокая контрастность)
  textMuted: '#64748B',        // Серый сланец для подписей и описаний
  border: '#E2E8F0',           // Тонкие светло-серые рамки
  error: '#EF4444',            // Красный для ошибок
  success: '#10B981',          // Приятный зеленый для успеха
};

export const Typography = {
  titleLarge: {
    fontSize: 26,
    fontWeight: '700' as const,
    fontFamily: 'Georgia',
    letterSpacing: 0.5,
    color: Colors.primary,
  },
  titleMedium: {
    fontSize: 19,
    fontWeight: '600' as const,
    fontFamily: 'Georgia',
    letterSpacing: 0.2,
    color: Colors.primary,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  caption: {
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.accent,
  },
};
