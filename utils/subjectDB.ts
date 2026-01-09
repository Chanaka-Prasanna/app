import { db } from '@/firebase';
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
} from 'firebase/firestore';

export interface Subject {
  id: string;
  name: string;
  pdfUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectData {
  name: string;
  pdfUrls: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const SUBJECTS_COLLECTION = 'subjects';


export async function createSubject(name: string): Promise<Subject> {
  try {
    const now = Timestamp.now();
    const subjectData: SubjectData = {
      name,
      pdfUrls: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, SUBJECTS_COLLECTION), subjectData);
    
    return {
      id: docRef.id,
      name,
      pdfUrls: [],
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error creating subject:', error);
    throw new Error('Failed to create subject');
  }
}

export async function getAllSubjects(): Promise<Subject[]> {
  try {
    const q = query(collection(db, SUBJECTS_COLLECTION), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const subjects: Subject[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as SubjectData;
      subjects.push({
        id: doc.id,
        name: data.name,
        pdfUrls: data.pdfUrls || [],
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });
    
    return subjects;
  } catch (error) {
    console.error('Error getting subjects:', error);
    throw new Error('Failed to fetch subjects');
  }
}

export async function getSubject(subjectId: string): Promise<Subject | null> {
  try {
    const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SubjectData;
      return {
        id: docSnap.id,
        name: data.name,
        pdfUrls: data.pdfUrls || [],
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting subject:', error);
    throw new Error('Failed to fetch subject');
  }
}

export async function updateSubjectName(subjectId: string, name: string): Promise<void> {
  try {
    const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
    await updateDoc(docRef, {
      name,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating subject name:', error);
    throw new Error('Failed to update subject name');
  }
}

export async function addPdfToSubject(subjectId: string, pdfUrl: string): Promise<void> {
  try {
    const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
    await updateDoc(docRef, {
      pdfUrls: arrayUnion(pdfUrl),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding PDF to subject:', error);
    throw new Error('Failed to add PDF to subject');
  }
}

export async function removePdfFromSubject(subjectId: string, pdfUrl: string): Promise<void> {
  try {
    const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
    await updateDoc(docRef, {
      pdfUrls: arrayRemove(pdfUrl),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing PDF from subject:', error);
    throw new Error('Failed to remove PDF from subject');
  }
}

export async function deleteSubject(subjectId: string): Promise<void> {
  try {
    const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw new Error('Failed to delete subject');
  }
}
