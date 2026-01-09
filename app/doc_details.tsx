import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

type ContentType = 'question-packs' | 'summary' | 'flash-cards' | 'short-notes' | 'mind-map' | null;

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
  type: ContentType;
}

export default function PDFDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { pdfId, pdfName, subjectName } = useLocalSearchParams();
  const [selectedContent, setSelectedContent] = useState<ContentType>(null);
  
  const displayPdfName = (pdfName as string) || 'Document.pdf';
  const displaySubjectName = (subjectName as string) || 'Subject';
  
  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Question Packs',
      icon: 'quiz',
      description: 'Practice with generated questions',
      type: 'question-packs',
    },
    {
      id: '2',
      title: 'Summary',
      icon: 'description',
      description: 'Read AI-generated summary',
      type: 'summary',
    },
    {
      id: '3',
      title: 'Flash Cards',
      icon: 'style',
      description: 'Study with digital flashcards',
      type: 'flash-cards',
    },
    {
      id: '4',
      title: 'Short Notes',
      icon: 'note',
      description: 'Quick reference notes',
      type: 'short-notes',
    },
    {
      id: '5',
      title: 'Mind Map',
      icon: 'account-tree',
      description: 'Visual concept mapping',
      type: 'mind-map',
    },
  ];

  const handleMenuPress = (type: ContentType) => {
    setSelectedContent(type);
  };

  const renderContent = () => {
    if (!selectedContent) return null;

    switch (selectedContent) {
      case 'question-packs':
        return <QuestionPacksContent colors={colors} />;
      case 'summary':
        return <SummaryContent colors={colors} />;
      case 'flash-cards':
        return <FlashCardsContent colors={colors} />;
      case 'short-notes':
        return <ShortNotesContent colors={colors} />;
      case 'mind-map':
        return <MindMapContent colors={colors} />;
      default:
        return null;
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (selectedContent) {
                setSelectedContent(null);
              } else {
                router.back();
              }
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.subtitle}>{displaySubjectName}</Text>
            <Text style={styles.title} numberOfLines={1}>{displayPdfName}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!selectedContent ? (
            <>
              <Text style={styles.sectionTitle}>Study Materials</Text>
              
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuCard}
                  onPress={() => handleMenuPress(item.type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    <MaterialIcons name={item.icon} size={28} color={colors.primary} />
                  </View>
                  
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                  
                  <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </>
          ) : (
            renderContent()
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Content Components
const QuestionPacksContent = ({ colors }: { colors: typeof Colors.light }) => (
  <View>
    <Text style={[styles2.contentTitle, { color: colors.text }]}>Question Packs</Text>
    {[1, 2, 3].map((i) => (
      <View key={i} style={[styles2.contentCard, { backgroundColor: colors.card }]}>
        <Text style={[styles2.cardTitle, { color: colors.text }]}>Practice Set {i}</Text>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary }]}>
          {10 * i} questions • {i === 1 ? 'Easy' : i === 2 ? 'Medium' : 'Hard'}
        </Text>
      </View>
    ))}
  </View>
);

const SummaryContent = ({ colors }: { colors: typeof Colors.light }) => (
  <View>
    <Text style={[styles2.contentTitle, { color: colors.text }]}>Summary</Text>
    <View style={[styles2.contentCard, { backgroundColor: colors.card }]}>
      <Text style={[styles2.cardTitle, { color: colors.text }]}>Key Points</Text>
      <Text style={[styles2.cardDesc, { color: colors.textSecondary }]}>
        • Introduction to organic chemistry reactions{'\n'}
        • Understanding reaction mechanisms{'\n'}
        • Common reaction types and applications{'\n'}
        • Factors affecting reaction rates
      </Text>
    </View>
  </View>
);

const FlashCardsContent = ({ colors }: { colors: typeof Colors.light }) => (
  <View>
    <Text style={[styles2.contentTitle, { color: colors.text }]}>Flash Cards</Text>
    {['What is an SN2 reaction?', 'Define transition state', 'What factors affect reaction rate?'].map((q, i) => (
      <View key={i} style={[styles2.contentCard, { backgroundColor: colors.card }]}>
        <Text style={[styles2.cardTitle, { color: colors.text }]}>Card {i + 1}</Text>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary }]}>{q}</Text>
      </View>
    ))}
  </View>
);

const ShortNotesContent = ({ colors }: { colors: typeof Colors.light }) => (
  <View>
    <Text style={[styles2.contentTitle, { color: colors.text }]}>Short Notes</Text>
    {['Key Reactions', 'Important Factors', 'Quick Tips'].map((note, i) => (
      <View key={i} style={[styles2.contentCard, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
        <Text style={[styles2.cardTitle, { color: colors.text }]}>{note}</Text>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary }]}>
          Sample note content about {note.toLowerCase()}
        </Text>
      </View>
    ))}
  </View>
);

const MindMapContent = ({ colors }: { colors: typeof Colors.light }) => (
  <View>
    <Text style={[styles2.contentTitle, { color: colors.text }]}>Mind Map</Text>
    <View style={[styles2.contentCard, { backgroundColor: colors.card }]}>
      <Text style={[styles2.cardTitle, { color: colors.text }]}>Organic Reactions</Text>
      <View style={{ marginTop: 12 }}>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary }]}>├─ Substitution</Text>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary, marginLeft: 12 }]}>  ├─ SN1</Text>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary, marginLeft: 12 }]}>  └─ SN2</Text>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary }]}>└─ Elimination</Text>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary, marginLeft: 12 }]}>  ├─ E1</Text>
        <Text style={[styles2.cardDesc, { color: colors.textSecondary, marginLeft: 12 }]}>  └─ E2</Text>
      </View>
    </View>
  </View>
);

const styles2 = StyleSheet.create({
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  contentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});

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
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
