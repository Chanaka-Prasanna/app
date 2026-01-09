import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface ProgressItem {
  id: string;
  subject: string;
  progress: number;
  total: number;
  lastActivity: string;
}

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const progressItems: ProgressItem[] = [
    {
      id: '1',
      subject: 'Organic Chemistry',
      progress: 45,
      total: 100,
      lastActivity: '2 hours ago',
    },
    {
      id: '2',
      subject: 'Calculus II',
      progress: 78,
      total: 100,
      lastActivity: '1 day ago',
    },
    {
      id: '3',
      subject: 'Physics',
      progress: 23,
      total: 100,
      lastActivity: '3 days ago',
    },
  ];

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>
            Track your learning journey
          </Text>
        </View>

        {/* Progress Items */}
        <View style={styles.progressList}>
          {progressItems.map((item) => (
            <View key={item.id} style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="school"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.subjectName}>{item.subject}</Text>
                  <Text style={styles.lastActivity}>
                    Last activity {item.lastActivity}
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${item.progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.progress}% complete
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Empty state if no progress */}
        {progressItems.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="trending-up"
              size={64}
              color={colors.iconSecondary}
            />
            <Text style={styles.emptyTitle}>No Progress Yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload your notes to start tracking your progress
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
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
  progressList: {
    gap: 16,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  progressInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  lastActivity: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
