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

interface PDF {
  id: string;
  name: string;
  uploadedAt: string;
  size: string;
  pages: number;
}

type ContentType = 'question-packs' | 'summary' | 'flash-cards' | 'short-notes' | 'mind-map' | null;

export default function SubjectDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { subjectName } = useLocalSearchParams();
  const [selectedPDF, setSelectedPDF] = useState<PDF | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentType>(null);
  
  // Use the subject name from params or default
  const displayName = (subjectName as string) || 'Organic Chemistry';
  
  // Mock PDFs data - in real app this would be fetched based on subjectId
  const pdfs: PDF[] = [
    {
      id: '1',
      name: 'Chapter_5_Reactions.pdf',
      uploadedAt: '2 hours ago',
      size: '2.4 MB',
      pages: 12,
    },
    {
      id: '2',
      name: 'Chapter_3_Structures.pdf',
      uploadedAt: '1 day ago',
      size: '1.8 MB',
      pages: 8,
    },
    {
      id: '3',
      name: 'Chapter_2_Bonding.pdf',
      uploadedAt: '3 days ago',
      size: '3.2 MB',
      pages: 15,
    },
    {
      id: '4',
      name: 'Lab_Report_Synthesis.pdf',
      uploadedAt: '1 week ago',
      size: '1.2 MB',
      pages: 6,
    },
  ];

  const handlePDFPress = (pdf: PDF) => {
    setSelectedPDF(pdf);
    setSelectedContent(null);
  };

  const handleBack = () => {
    if (selectedContent) {
      setSelectedContent(null);
    } else if (selectedPDF) {
      setSelectedPDF(null);
    } else {
      router.back();
    }
  };

  const menuItems = [
    { id: 'question-packs', icon: 'quiz', title: 'Question Packs', description: 'Practice questions from your PDF' },
    { id: 'summary', icon: 'article', title: 'Summary', description: 'Key points and overview' },
    { id: 'flash-cards', icon: 'style', title: 'Flash Cards', description: 'Quick revision cards' },
    { id: 'short-notes', icon: 'note', title: 'Short Notes', description: 'Condensed study notes' },
    { id: 'mind-map', icon: 'account-tree', title: 'Mind Map', description: 'Visual concept map' },
  ];

  const QuestionPacksContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>Question Packs</Text>
      <Text style={styles.contentText}>
        Generated practice questions based on your PDF content will appear here. 
        This feature will help you test your understanding of the material.
      </Text>
    </View>
  );

  const SummaryContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>Summary</Text>
      <Text style={styles.contentText}>
        A comprehensive summary of your PDF will be displayed here. 
        This will help you quickly review the main concepts and key points.
      </Text>
    </View>
  );

  const FlashCardsContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>Flash Cards</Text>
      <Text style={styles.contentText}>
        Interactive flash cards for quick revision will be shown here. 
        Perfect for memorizing important concepts and terms.
      </Text>
    </View>
  );

  const ShortNotesContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>Short Notes</Text>
      <Text style={styles.contentText}>
        Condensed notes highlighting the most important information from your PDF. 
        Ideal for last-minute revision before exams.
      </Text>
    </View>
  );

  const MindMapContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>Mind Map</Text>
      <Text style={styles.contentText}>
        A visual representation of concepts and their relationships. 
        This will help you understand how different topics connect.
      </Text>
    </View>
  );

  const renderContent = () => {
    switch (selectedContent) {
      case 'question-packs':
        return <QuestionPacksContent />;
      case 'summary':
        return <SummaryContent />;
      case 'flash-cards':
        return <FlashCardsContent />;
      case 'short-notes':
        return <ShortNotesContent />;
      case 'mind-map':
        return <MindMapContent />;
      default:
        return null;
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with smart back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>
              {selectedPDF ? selectedPDF.name : displayName}
            </Text>
            <Text style={styles.subtitle}>
              {selectedPDF ? (selectedContent ? menuItems.find(m => m.id === selectedContent)?.title : 'Study Materials') : 'Uploaded PDFs'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!selectedPDF ? (
            // PDF List View
            <>
              <Text style={styles.sectionTitle}>PDF Documents</Text>
              
              {pdfs.map((pdf) => (
                <TouchableOpacity
                  key={pdf.id}
                  style={styles.pdfCard}
                  onPress={() => handlePDFPress(pdf)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pdfIconContainer}>
                    <MaterialIcons name="picture-as-pdf" size={32} color={colors.primary} />
                  </View>
                  
                  <View style={styles.pdfInfo}>
                    <Text style={styles.pdfName}>{pdf.name}</Text>
                    <View style={styles.pdfMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="insert-drive-file" size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{pdf.size}</Text>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <MaterialIcons name="description" size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{pdf.pages} pages</Text>
                      </View>
                    </View>
                    <Text style={styles.uploadTime}>Uploaded {pdf.uploadedAt}</Text>
                  </View>
                  
                  <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
              
              {pdfs.length === 0 && (
                <View style={styles.emptyState}>
                  <MaterialIcons name="picture-as-pdf" size={64} color={colors.textSecondary} />
                  <Text style={styles.emptyStateTitle}>No PDFs Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Upload PDFs to this subject to get started
                  </Text>
                </View>
              )}
            </>
          ) : !selectedContent ? (
            // Menu View
            <>
              <Text style={styles.sectionTitle}>Study Materials</Text>
              <Text style={styles.sectionDescription}>
                Choose a study material type to generate from your PDF
              </Text>
              
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuCard}
                  onPress={() => setSelectedContent(item.id as ContentType)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    <MaterialIcons name={item.icon as any} size={28} color={colors.primary} />
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
            // Content View
            renderContent()
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  pdfCard: {
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
  pdfIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  pdfMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 8,
  },
  uploadTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  menuCard: {
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  contentContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
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
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
