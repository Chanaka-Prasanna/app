import { db } from '@/firebase';
import {
    addDoc,
    collection,
    deleteDoc as deleteFirestoreDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

export interface DOC {
  id: string;
  name: string;
  url: string;
  size: string;
  pages: number;
  uploadedAt: string;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DOCData {
  name: string;
  url: string;
  size: string;
  pages: number;
  uploadedAt: string;
  subjectId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const DOCUMENTS_COLLECTION = 'documents';

/**
 * Create a new document
 * @param name - Document name
 * @param url - Document URL
 * @param size - Document size
 * @param pages - Number of pages
 * @param subjectId - Subject ID this document belongs to
 * @returns The created document with ID
 */
export async function createDoc(name: string, url: string, size: string, pages: number, subjectId: string): Promise<DOC> {
  try {
    const now = Timestamp.now();
    const uploadedAt = now.toDate().toISOString();
    const docData: DOCData = {
      name,
      url,
      size,
      pages,
      uploadedAt,
      subjectId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), docData);
    
    return {
      id: docRef.id,
      name,
      url,
      size,
      pages,
      uploadedAt,
      subjectId,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
}

/**
 * Get all documents
 * @returns Array of all documents
 */
export async function getAllDocs(): Promise<DOC[]> {
  try {
    const q = query(collection(db, DOCUMENTS_COLLECTION), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const documents: DOC[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DOCData;
      documents.push({
        id: doc.id,
        name: data.name,
        url: data.url,
        size: data.size,
        pages: data.pages,
        uploadedAt: data.uploadedAt,
        subjectId: data.subjectId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw new Error('Failed to fetch documents');
  }
}

/**
 * Get a single document by ID
 * @param docId - Document ID
 * @returns Document data or null if not found
 */
export async function getDOC(docId: string): Promise<DOC | null> {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as DOCData;
      return {
        id: docSnap.id,
        name: data.name,
        url: data.url,
        size: data.size,
        pages: data.pages,
        uploadedAt: data.uploadedAt,
        subjectId: data.subjectId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw new Error('Failed to fetch document');
  }
}

/**
 * Update a document's name
 * @param docId - Document ID
 * @param name - New document name
 */
export async function updateDocName(docId: string, name: string): Promise<void> {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, docId);
    await updateDoc(docRef, {
      name,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating document name:', error);
    throw new Error('Failed to update document name');
  }
}

/**
 * Delete a document
 * @param docId - Document ID
 */
export async function deleteDoc(docId: string): Promise<void> {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, docId);
    await deleteFirestoreDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Get documents by subject ID
 * @param subjectId - Subject ID to filter documents
 * @returns Array of documents for the subject
 */
export async function getDocsBySubject(subjectId: string): Promise<DOC[]> {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('subjectId', '==', subjectId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const documents: DOC[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DOCData;
      documents.push({
        id: doc.id,
        name: data.name,
        url: data.url,
        size: data.size,
        pages: data.pages,
        uploadedAt: data.uploadedAt,
        subjectId: data.subjectId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting documents by subject:', error);
    throw new Error('Failed to fetch documents');
  }
}
