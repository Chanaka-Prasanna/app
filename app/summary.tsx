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

export default function SummaryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { pdfName, subjectName } = useLocalSearchParams();
  
  const summaryContent = {
    title: 'Document Summary',
    keyPoints: [
      'Introduction to organic chemistry reactions and mechanisms',
      'Understanding reaction intermediates and transition states',
      'Common reaction types: substitution, elimination, addition',
      'Factors affecting reaction rates and equilibrium',
      'Practical applications in synthesis and drug design',
    ],
    mainTopics: [
      {
        title: 'Reaction Mechanisms',
        description: 'Detailed explanation of how reactions proceed through various intermediates and transition states.',
      },
      {
        title: 'Substitution Reactions',
        description: 'SN1 and SN2 mechanisms, their characteristics, and factors affecting reaction pathways.',
      },
      {
        title: 'Elimination Reactions',
        description: 'E1 and E2 mechanisms, competition with substitution, and product formation.',
      },
    ],
    conclusion: 'The chapter provides a comprehensive overview of organic reaction mechanisms, essential for understanding chemical transformations and predicting reaction outcomes.',
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
            <Text style={styles.title}>Summary</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{summaryContent.title}</Text>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="stars" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Key Points</Text>
              </View>
              {summaryContent.keyPoints.map((point, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="topic" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Main Topics</Text>
              </View>
              {summaryContent.mainTopics.map((topic, index) => (
                <View key={index} style={styles.topicCard}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Conclusion</Text>
              </View>
              <Text style={styles.conclusionText}>{summaryContent.conclusion}</Text>
            </View>
          </View>
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
  summaryCard: {
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
        elevation: 2,
      },
    }),
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  topicCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  topicDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  conclusionText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
});
