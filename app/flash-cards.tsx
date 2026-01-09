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

interface FlashCard {
  id: string;
  question: string;
  answer: string;
}

export default function FlashCardsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { pdfName, subjectName } = useLocalSearchParams();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  
  const flashCards: FlashCard[] = [
    {
      id: '1',
      question: 'What is an SN2 reaction?',
      answer: 'A bimolecular nucleophilic substitution reaction that occurs in a single step with inversion of configuration.',
    },
    {
      id: '2',
      question: 'What factors affect reaction rate?',
      answer: 'Temperature, concentration, catalyst presence, surface area, and nature of reactants.',
    },
    {
      id: '3',
      question: 'Define a transition state',
      answer: 'The highest energy point along the reaction coordinate, representing the unstable arrangement of atoms during bond breaking and forming.',
    },
    {
      id: '4',
      question: 'What is Le Chatelier\'s Principle?',
      answer: 'When a system at equilibrium is disturbed, it shifts to counteract the disturbance and restore equilibrium.',
    },
  ];

  const toggleCard = (cardId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
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
            <Text style={styles.title}>Flash Cards</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>{flashCards.length} Cards Available</Text>
          <Text style={styles.helperText}>Tap any card to reveal the answer</Text>
          
          {flashCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.flashCard,
                flippedCards.has(card.id) && styles.flashCardFlipped,
              ]}
              onPress={() => toggleCard(card.id)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <MaterialIcons 
                  name={flippedCards.has(card.id) ? 'lightbulb' : 'help-outline'} 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.cardLabel}>
                  {flippedCards.has(card.id) ? 'Answer' : 'Question'}
                </Text>
              </View>
              
              <Text style={styles.cardText}>
                {flippedCards.has(card.id) ? card.answer : card.question}
              </Text>
              
              <View style={styles.cardFooter}>
                <MaterialIcons 
                  name="flip-to-front" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.tapToFlipText}>Tap to flip</Text>
              </View>
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
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  flashCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  flashCardFlipped: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 16,
    minHeight: 60,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapToFlipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
