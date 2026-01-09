import { Colors } from '@/constants/theme';
import { storage } from '@/firebase';
import { useSubjectStore } from '@/hooks/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { URLS } from '@/utils/urls';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Upload {
  id: string;
  name: string;
  uploadedAt: string;
  downloadUrl?: string;
  subjectId: string;
}

export default function UploadScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Zustand store
  const { subjects, loadSubjects, createSubject } = useSubjectStore();
  
  const [recentUploads, setRecentUploads] = useState<Upload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showNewSubjectInput, setShowNewSubjectInput] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [creatingSubject, setCreatingSubject] = useState(false);

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    try {
      setCreatingSubject(true);
      await createSubject(newSubjectName.trim());
      
      // Select the newly created subject
      const newSubjects = await loadSubjects();
      if (subjects.length > 0) {
        setSelectedSubject(subjects[0].id);
      }
      
      setNewSubjectName('');
      setShowNewSubjectInput(false);
      setShowDropdown(false);
      Alert.alert('Success', `Subject created!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create subject');
      console.error(error);
    } finally {
      setCreatingSubject(false);
    }
  };

  const uploadToFirebase = async () => {
    if (!selectedFile) {
      console.log('No file selected');
      return;
    }

    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject first');
      return;
    }

    console.log('=== STARTING UPLOAD ===');
    console.log('Selected file:', {
      name: selectedFile.name,
      size: selectedFile.size,
      uri: selectedFile.uri,
      mimeType: selectedFile.mimeType,
    });

    try {
      setUploading(true);

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${selectedFile.name}`;
      
      console.log('Creating storage reference for:', uniqueFileName);
      
      // Create storage reference
      const storageRef = ref(storage, `docs/uploaded_pdf/${uniqueFileName}`);
      console.log('Storage ref created:', storageRef.fullPath);
      
      // Fetch the file as a blob
      console.log('Fetching file from URI...');
      const response = await fetch(selectedFile.uri);
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created:', {
        size: blob.size,
        type: blob.type,
      });
      
      // Upload to Firebase Storage
      console.log('Starting Firebase upload...');
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log('Upload successful!');
      console.log('Upload metadata:', JSON.stringify({
        fullPath: uploadResult.metadata.fullPath,
        size: uploadResult.metadata.size,
        contentType: uploadResult.metadata.contentType,
      }, null, 2));
      
      // Get download URL
      console.log('Getting download URL...');
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadUrl);
      
      // call api
      const result = await fetch(URLS.UPLOAD_AND_SUMMARIZE,
        {
          method:'POST',
          headers:{
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            file_path: downloadUrl
          })
        }
      )
      
      if (!result.ok) {
        throw new Error(`API call failed with status ${result.status}`);
      }
      
      const apiData = await result.json();
      console.log('API response:', apiData);
      
      // Show the download URL
      Alert.alert(
        'Upload Complete!',
        `File uploaded successfully!\n\nDownload Link:\n${downloadUrl}`,
        [{ text: 'OK' }]
      );
      
      // Add to recent uploads with download URL
      const newUpload: Upload = {
        id: Date.now().toString(),
        name: selectedFile.name,
        uploadedAt: 'Just now',
        downloadUrl: downloadUrl,
        subjectId: selectedSubject,
      };
      
      setRecentUploads([newUpload, ...recentUploads]);
      setSelectedFile(null); // Clear selection after upload
      
      console.log('=== UPLOAD COMPLETE ===');
      
    } catch (error: any) {
      console.error('=== ERROR OCCURRED ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('Error stack:', error?.stack);
      
      let errorMessage = 'Failed to upload file';
      
      // Handle network errors
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
        // Check for 404 status which indicates storage bucket not configured
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
        `${errorMessage}\n\nError Code: ${error?.code || 'unknown'}\n\nCheck console for details.`
      );
    } finally {
      setUploading(false);
      console.log('Upload state reset');
    }
  };

  const pickDocument = async () => {
    try {
      console.log('Opening document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('File selected:', {
          name: file.name,
          size: file.size,
          uri: file.uri,
          mimeType: file.mimeType,
        });
        setSelectedFile(file);
      } else {
        console.log('Document picker was canceled or no file selected');
      }
    } catch (error: any) {
      console.error('Error picking document:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      Alert.alert('Error', `Failed to pick document: ${error?.message || error}`);
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar 
        style={colorScheme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colors.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upload Your Notes</Text>
          <Text style={styles.subtitle}>
            Select a subject and upload PDF files
          </Text>
        </View>

        {/* Subject Selection */}
        <View style={styles.subjectSection}>
          <Text style={styles.sectionTitle}>Select Subject</Text>
          
          {/* Subject Dropdown */}
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <View style={styles.dropdownContent}>
              <MaterialIcons name="folder" size={20} color={colors.primary} />
              <Text style={[styles.dropdownText, !selectedSubject && styles.dropdownPlaceholder]}>
                {selectedSubject 
                  ? subjects.find(s => s.id === selectedSubject)?.name 
                  : 'Choose a subject...'}
              </Text>
            </View>
            <MaterialIcons 
              name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {showDropdown && (
            <View style={styles.dropdownMenu}>
              <ScrollView 
                style={styles.dropdownScroll}
                nestedScrollEnabled
              >
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.dropdownItem,
                      selectedSubject === subject.id && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedSubject(subject.id);
                      setShowDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedSubject === subject.id && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {subject.name}
                    </Text>
                    {selectedSubject === subject.id && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Add New Subject Button */}
          <TouchableOpacity
            style={styles.addSubjectButton}
            onPress={() => setShowNewSubjectInput(!showNewSubjectInput)}
          >
            <MaterialIcons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.addSubjectButtonText}>Create New Subject</Text>
          </TouchableOpacity>

          {/* New Subject Input */}
          {showNewSubjectInput && (
            <View style={styles.newSubjectContainer}>
              <TextInput
                style={styles.newSubjectInput}
                placeholder="Enter subject name"
                placeholderTextColor={colors.textSecondary}
                value={newSubjectName}
                onChangeText={setNewSubjectName}
                autoFocus
              />
              <TouchableOpacity
                style={styles.createSubjectButton}
                onPress={handleCreateSubject}
                disabled={creatingSubject}
              >
                {creatingSubject ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createSubjectText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upload Area */}
        <TouchableOpacity
          style={[
            styles.uploadArea,
            !selectedSubject && styles.uploadAreaDisabled,
          ]}
          onPress={pickDocument}
          activeOpacity={0.7}
          disabled={uploading || !selectedSubject}
        >
          <View style={styles.uploadIconContainer}>
            <MaterialIcons
              name="picture-as-pdf"
              size={48}
              color={colors.iconOnPrimary}
            />
          </View>
          <Text style={styles.uploadText}>
            {selectedSubject ? 'Tap to Select PDF' : 'Select a Subject First'}
          </Text>
          <Text style={styles.uploadSubtext}>
            PDF files only
          </Text>
        </TouchableOpacity>

        {/* Selected File Preview */}
        {selectedFile && (
          <View style={styles.selectedFileSection}>
            <Text style={styles.selectedFileTitle}>Selected File</Text>
            <View style={styles.selectedFileCard}>
              <View style={styles.selectedFileIconContainer}>
                <MaterialIcons
                  name="picture-as-pdf"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <View style={styles.selectedFileInfo}>
                <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                <Text style={styles.selectedFileSize}>
                  {(selectedFile.size! / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFile(null)}
                style={styles.removeButton}
              >
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Upload and Process Button */}
            <TouchableOpacity
              style={[
                styles.uploadButton,
                uploading && styles.uploadButtonDisabled
              ]}
              onPress={uploadToFirebase}
              disabled={uploading}
              activeOpacity={0.7}
            >
              {uploading ? (
                <ActivityIndicator color={colors.iconOnPrimary} />
              ) : (
                <>
                  <MaterialIcons
                    name="cloud-upload"
                    size={24}
                    color={colors.iconOnPrimary}
                  />
                  <Text style={styles.uploadButtonText}>
                    Upload PDF
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Uploads */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Uploads</Text>
          
          {recentUploads.map((upload) => (
            <View key={upload.id} style={styles.uploadItem}>
              <View style={styles.uploadItemIconContainer}>
                <MaterialIcons
                  name="insert-drive-file"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.uploadItemInfo}>
                <Text style={styles.uploadItemName}>{upload.name}</Text>
                <Text style={styles.uploadItemTime}>
                  Uploaded {upload.uploadedAt}
                </Text>
              </View>
            </View>
          ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
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
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: colors.backgroundSecondary,
  },
  uploadIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  uploadText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recentSection: {
    marginTop: 8,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  uploadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
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
  uploadItemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploadItemInfo: {
    flex: 1,
  },
  uploadItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  uploadItemTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  selectedFileSection: {
    marginBottom: 32,
  },
  selectedFileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
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
  selectedFileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedFileInfo: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedFileSize: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.iconOnPrimary,
  },
  subjectSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDashed,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  dropdownMenu: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderDashed,
    maxHeight: 200,
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
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  dropdownItemSelected: {
    backgroundColor: colors.backgroundSecondary,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  addSubjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addSubjectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  newSubjectContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  newSubjectInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderDashed,
  },
  createSubjectButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
  },
  createSubjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.iconOnPrimary,
  },
  uploadAreaDisabled: {
    opacity: 0.5,
  },
});
