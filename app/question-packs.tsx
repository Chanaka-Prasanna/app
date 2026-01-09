import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface QuestionPack {
  id: string;
  title: string;
  questionCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
}

export default function QuestionPacksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { pdfName, subjectName } = useLocalSearchParams();
  
  const questionPacks: QuestionPack[] = [
    {
      id: '1',
      title: 'Quick Review Pack',
      questionCount: 10,
      difficulty: 'Easy',
      createdAt: 'Just now',
    },
    {
      id: '2',
      title: 'Practice Set',
      questionCount: 20,
      difficulty: 'Medium',
      createdAt: 'Just now',
    },
    {
      id: '3',
      title: 'Challenge Pack',
      questionCount: 15,
      difficulty: 'Hard',
      createdAt: 'Just now',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#4CAF50';
      case 'Medium':
        return '#FF9800';
      case 'Hard':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.subtitle}>{subjectName as string}</Text>
            <Text style={styles.title}>Question Packs</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Available Packs</Text>
          
          {questionPacks.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              style={styles.card}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name="quiz" size={28} color={colors.primary} />
              </View>
              
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{pack.title}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>{pack.questionCount} questions</Text>
                  <View style={styles.metaDivider} />
                  <Text style={[styles.difficultyBadge, { color: getDifficultyColor(pack.difficulty) }]}>
                    {pack.difficulty}
                  </Text>
                </View>
                <Text style={styles.timeText}>Created {pack.createdAt}</Text>
              </View>
              
              <MaterialIcons name="play-circle-outline" size={32} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 8,
  },
  difficultyBadge: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
