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

interface Note {
  id: string;
  title: string;
  content: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export default function ShortNotesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { pdfName, subjectName } = useLocalSearchParams();
  
  const notes: Note[] = [
    {
      id: '1',
      title: 'Key Reactions',
      content: 'SN1, SN2, E1, E2 mechanisms are the four primary types of substitution and elimination reactions in organic chemistry.',
      icon: 'science',
    },
    {
      id: '2',
      title: 'Important Factors',
      content: 'Steric hindrance, leaving group ability, nucleophile strength, and solvent polarity determine reaction pathways.',
      icon: 'list',
    },
    {
      id: '3',
      title: 'Remember',
      content: 'Strong bases favor elimination (E2), while weak nucleophiles favor substitution (SN1) in polar protic solvents.',
      icon: 'lightbulb',
    },
    {
      id: '4',
      title: 'Quick Tips',
      content: 'Primary carbocations are unstable, tertiary are most stable. Carbocation stability: 3° > 2° > 1° > methyl.',
      icon: 'tips-and-updates',
    },
    {
      id: '5',
      title: 'Common Mistakes',
      content: 'Don\'t confuse reaction kinetics with thermodynamics. Fast reactions aren\'t always thermodynamically favorable.',
      icon: 'warning',
    },
  ];

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
            <Text style={styles.title}>Short Notes</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Quick Reference</Text>
          
          {notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name={note.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.noteTitle}>{note.title}</Text>
              </View>
              <Text style={styles.noteContent}>{note.content}</Text>
            </View>
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
  noteCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
