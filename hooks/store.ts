import { Subject, createSubject as createSubjectDB, deleteSubject as deleteSubjectDB, getAllSubjects } from '@/utils/subjectDB';
import { create } from 'zustand';

interface SubjectStore {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  selectedSubject: Subject | null;
  
  // Actions
  loadSubjects: () => Promise<void>;
  createSubject: (name: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  setSelectedSubject: (subject: Subject | null) => void;
  clearError: () => void;
}

export const useSubjectStore = create<SubjectStore>((set, get) => ({
  subjects: [],
  loading: false,
  error: null,
  selectedSubject: null,

  loadSubjects: async () => {
    set({ loading: true, error: null });
    try {
      const subjects = await getAllSubjects();
      set({ subjects, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load subjects',
        loading: false 
      });
    }
  },

  createSubject: async (name: string) => {
    set({ loading: true, error: null });
    try {
        if (get().subjects.find(sub => sub.name.toLowerCase() === name.toLowerCase())){
            throw new Error('Subject with this name already exists');
        }
      await createSubjectDB(name);
      await get().loadSubjects();

    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create subject',
        loading: false 
      });
      throw error;
    }
  },

  deleteSubject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteSubjectDB(id);
      await get().loadSubjects();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete subject',
        loading: false 
      });
      throw error;
    }
  },

  setSelectedSubject: (subject: Subject | null) => {
    set({ selectedSubject: subject });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// PDF Store
interface PDF {
  id: string;
  name: string;
  uploadedAt: string;
  size: string;
  pages: number;
  url: string;
}

type ContentType = 'question-packs' | 'summary' | 'flash-cards' | 'short-notes' | 'mind-map' | null;

interface PDFStore {
  pdfs: PDF[];
  selectedPDF: PDF | null;
  selectedContent: ContentType;
  loading: boolean;
  
  // Actions
  setPDFs: (pdfs: PDF[]) => void;
  setSelectedPDF: (pdf: PDF | null) => void;
  setSelectedContent: (content: ContentType) => void;
  resetSelection: () => void;
}

export const usePDFStore = create<PDFStore>((set) => ({
  pdfs: [],
  selectedPDF: null,
  selectedContent: null,
  loading: false,

  setPDFs: (pdfs: PDF[]) => {
    set({ pdfs });
  },

  setSelectedPDF: (pdf: PDF | null) => {
    set({ selectedPDF: pdf, selectedContent: null });
  },

  setSelectedContent: (content: ContentType) => {
    set({ selectedContent: content });
  },

  resetSelection: () => {
    set({ selectedPDF: null, selectedContent: null });
  },
}));
