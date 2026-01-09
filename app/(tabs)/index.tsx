import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Subject {
  id: string;
  name: string;
  pdfCount: number;
  questionPacksCount: number;
  summariesCount: number;
  lastUpdated: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Mock data - in real app this would come from a state management solution or API
  const [subjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Organic Chemistry',
      pdfCount: 5,
      questionPacksCount: 3,
      summariesCount: 5,
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      name: 'Calculus II',
      pdfCount: 8,
      questionPacksCount: 5,
      summariesCount: 8,
      lastUpdated: '1 day ago',
    },
    {
      id: '3',
      name: 'Physics',
      pdfCount: 3,
      questionPacksCount: 2,
      summariesCount: 3,
      lastUpdated: '3 days ago',
    },
  ]);

  const handleSubjectPress = (subjectId: string, subjectName: string) => {
    // Navigate to subject detail screen
    router.push({
      pathname: '/(tabs)/explore',
      params: { subjectId, subjectName }
    });
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Subjects</Text>
            <Text style={styles.subtitle}>
              Select a subject to view questions and summaries
            </Text>
          </View>

          {/* Subjects Grid */}
          <View style={styles.subjectsGrid}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={styles.subjectCard}
                onPress={() => handleSubjectPress(subject.id, subject.name)}
                activeOpacity={0.7}
              >
                <View style={styles.subjectIconContainer}>
                  <MaterialIcons
                    name="book"
                    size={32}
                    color={colors.primary}
                  />
                </View>
                
                <Text style={styles.subjectName}>{subject.name}</Text>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="picture-as-pdf" size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{subject.pdfCount} PDFs</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <MaterialIcons name="quiz" size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{subject.questionPacksCount} Packs</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <MaterialIcons name="description" size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{subject.summariesCount} Summaries</Text>
                  </View>
                </View>
                
                <Text style={styles.lastUpdated}>Updated {subject.lastUpdated}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State */}
          {subjects.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="school" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Subjects Yet</Text>
              <Text style={styles.emptyStateText}>
                Go to Upload tab to create your first subject
              </Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  subjectsGrid: {
    gap: 16,
  },
  subjectCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  subjectIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
