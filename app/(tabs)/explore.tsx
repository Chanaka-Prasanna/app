import { Colors } from '@/constants/theme';
import { storage } from '@/firebase';
import { useDocsStore, useSubjectStore } from '@/hooks/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { URLS } from '@/utils/urls';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ContentType = 'question-packs' | 'summary' | 'flash-cards' | 'short-notes' | 'mind-map' | null;

export default function SubjectDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { subjectName, subjectId } = useLocalSearchParams();
  
  // Zustand stores
  const { docs, loading, selectedDoc, selectedContent, loadDocsBySubject, setSelectedDoc, setSelectedContent, resetSelection, createDoc } = useDocsStore();
  const { subjects, loadSubjects } = useSubjectStore();
  
  // Local state for upload
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  // Use the subject name from params or default
  const displayName = (subjectName as string) || 'Subject';
  const currentSubjectId = (subjectId as string) || '';
  
  // Load documents for this subject when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentSubjectId) {
        loadDocsBySubject(currentSubjectId);
      }
      loadSubjects();
    }, [currentSubjectId, loadDocsBySubject, loadSubjects])
  );
  
  // Reset selection when component unmounts
  useEffect(() => {
    return () => {
      resetSelection();
    };
  }, [resetSelection]);
  
  const handleDocPress = (doc: typeof docs[0]) => {
    setSelectedDoc(doc);
  };

  const handleBack = () => {
    if (selectedContent) {
      setSelectedContent(null);
    } else if (selectedDoc) {
      setSelectedDoc(null);
    } else {
      router.back();
    }
  };

  const handleOpenUploadModal = () => {
    setShowUploadModal(true);
    setSelectedFile(null);
  };

  const pickDocument = async () => {
    try {
      console.log('Opening document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('File selected:', {
          name: file.name,
          size: file.size,
          uri: file.uri,
          mimeType: file.mimeType,
        });
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a PDF file first');
      return;
    }

    if (!currentSubjectId) {
      Alert.alert('Error', 'No subject selected. Please go back and select a subject.');
      return;
    }

    try {
      setUploading(true);

      // Create unique filename
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${selectedFile.name}`;
      
      console.log('Creating storage reference for:', uniqueFileName);
      const storageRef = ref(storage, `docs/uploaded_pdf/${uniqueFileName}`);
      console.log('Storage ref created:', storageRef.fullPath);

      // Fetch and upload file
      console.log('Fetching file from URI...');
      const fileResponse = await fetch(selectedFile.uri);
      console.log('Fetch response status:', fileResponse.status);
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
      }
      
      const fileBlob = await fileResponse.blob();
      console.log('Blob created:', {
        size: fileBlob.size,
        type: fileBlob.type,
      });
      
      console.log('Starting Firebase upload...');
      const uploadResult = await uploadBytes(storageRef, fileBlob);
      console.log('Upload successful!');
      
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadURL);

      // Get file size in readable format
      const sizeInMB = (selectedFile.size || 0) / (1024 * 1024);
      const formattedSize = sizeInMB > 1 
        ? `${sizeInMB.toFixed(1)} MB` 
        : `${((selectedFile.size || 0) / 1024).toFixed(0)} KB`;

      // Call API to process the document
      console.log('Calling API to process document...');
      const apiResult = await fetch(URLS.UPLOAD_AND_SUMMARIZE, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          file_path: downloadURL
        })
      });
      
      if (!apiResult.ok) {
        throw new Error(`API call failed with status ${apiResult.status}`);
      }
      
      const apiData = await apiResult.json();
      console.log('API response:', apiData);

      // Save document metadata to Firestore
      await createDoc(
        selectedFile.name,
        downloadURL,
        formattedSize,
        0,
        currentSubjectId
      );

      // Reload documents for current subject
      await loadDocsBySubject(currentSubjectId);
      
      // Close modal and reset
      setShowUploadModal(false);
      setSelectedFile(null);
      
      Alert.alert(
        'Upload Complete!',
        `Document uploaded and processed successfully!`
      );
      
      console.log('=== UPLOAD COMPLETE ===');
    } catch (error: any) {
      console.error('=== ERROR OCCURRED ===');
      console.error('Error:', error);
      
      let errorMessage = 'Failed to upload document';
      
      if (error?.message === 'Network request failed') {
        errorMessage = 'Cannot connect to server.\n\nTroubleshooting:\n';
        if (Platform.OS === 'android') {
          errorMessage += '• Make sure your backend is running on port 8000\n';
          errorMessage += '• Android uses 10.0.2.2 to reach host machine\n';
          errorMessage += '• For physical device, update URL with your IP';
        } else {
          errorMessage += '• Make sure your backend is running on localhost:8000\n';
          errorMessage += '• For physical device, update URL with your IP';
        }
      } else if (error?.code === 'storage/unauthorized') {
        errorMessage = 'Permission denied. Check Firebase Storage rules.';
      } else if (error?.code === 'storage/canceled') {
        errorMessage = 'Upload was canceled.';
      } else if (error?.code === 'storage/unknown') {
        if (error?.status_ === 404) {
          errorMessage = 'Firebase Storage not configured.\n\nSetup Steps:\n1. Go to Firebase Console\n2. Navigate to Storage\n3. Click "Get Started"\n4. Set rules to test mode\n5. Try uploading again';
        } else {
          errorMessage = 'Unknown error occurred. Check Firebase configuration.';
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Upload Error',
        `${errorMessage}\n\nError Code: ${error?.code || 'unknown'}`
      );
    } finally {
      setUploading(false);
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
              {selectedDoc ? selectedDoc.name : displayName}
            </Text>
            <Text style={styles.subtitle}>
              {selectedDoc ? (selectedContent ? menuItems.find(m => m.id === selectedContent)?.title : 'Study Materials') : 'Documents'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!selectedDoc ? (
            // Document List View
            <>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading documents...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Documents</Text>
                  
                  {docs.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      style={styles.pdfCard}
                      onPress={() => handleDocPress(doc)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.pdfIconContainer}>
                        <MaterialIcons name="picture-as-pdf" size={32} color={colors.primary} />
                      </View>
                      
                      <View style={styles.pdfInfo}>
                        <Text style={styles.pdfName}>{doc.name}</Text>
                        <View style={styles.pdfMeta}>
                          <View style={styles.metaItem}>
                            <MaterialIcons name="insert-drive-file" size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{doc.size}</Text>
                          </View>
                          <View style={styles.metaDivider} />
                          <View style={styles.metaItem}>
                            <MaterialIcons name="description" size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{doc.pages} pages</Text>
                          </View>
                        </View>
                        <Text style={styles.uploadTime}>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</Text>
                      </View>
                      
                      <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                  
                  {docs.length === 0 && (
                    <View style={styles.emptyState}>
                      <MaterialIcons name="picture-as-pdf" size={64} color={colors.textSecondary} />
                      <Text style={styles.emptyStateTitle}>No Documents Yet</Text>
                      <Text style={styles.emptyStateText}>
                        Upload documents to this subject to get started
                      </Text>
                    </View>
                  )}
                </>
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

        {/* Upload FAB - only show when viewing document list and not selected any doc */}
        {!selectedDoc && !loading && (
          <TouchableOpacity
            style={[styles.uploadFab, { backgroundColor: colors.primary }]}
            onPress={handleOpenUploadModal}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Document</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Subject Display (Read-only) */}
            <View style={styles.subjectDisplayContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Subject</Text>
              <View style={[styles.subjectDisplay, { 
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border 
              }]}>
                <MaterialIcons name="folder" size={20} color={colors.primary} />
                <Text style={[styles.subjectDisplayText, { color: colors.text }]}>
                  {displayName}
                </Text>
              </View>
            </View>

            {/* Upload Area */}
            <Text style={[styles.label, { color: colors.text }]}>Select PDF Document</Text>
            <TouchableOpacity
              style={[styles.uploadArea, { 
                backgroundColor: colors.background,
                borderColor: selectedFile ? colors.primary : colors.border 
              }]}
              onPress={pickDocument}
            >
              <MaterialIcons name="cloud-upload" size={48} color={selectedFile ? colors.primary : colors.textSecondary} />
              <Text style={[styles.uploadAreaText, { color: colors.text }]}>
                {selectedFile ? selectedFile.name : 'Tap to select PDF file'}
              </Text>
              {selectedFile && (
                <Text style={[styles.uploadAreaSubtext, { color: colors.textSecondary }]}>
                  {((selectedFile.size || 0) / (1024 * 1024)).toFixed(2)} MB
                </Text>
              )}
            </TouchableOpacity>

            {/* Upload Button */}
            <TouchableOpacity
              style={[styles.uploadButton, { 
                backgroundColor: !selectedFile 
                  ? colors.border 
                  : colors.primary,
                opacity: !selectedFile || uploading ? 0.5 : 1 
              }]}
              onPress={handleUploadDocument}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.uploadButtonText}>Upload Document</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
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
  uploadFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  subjectDisplayContainer: {
    marginBottom: 4,
  },
  subjectDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  subjectDisplayText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadAreaText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  uploadAreaSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  uploadButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
