import { DOC, createDoc as createDocDB, deleteDoc as deleteDocDB, getAllDocs, getDocsBySubject } from '@/utils/docs-db';
import { Subject, createSubject as createSubjectDB, deleteSubject as deleteSubjectDB, getAllSubjects } from '@/utils/subject-db';
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

// Docs Store
type ContentType = 'question-packs' | 'summary' | 'flash-cards' | 'short-notes' | 'mind-map' | null;

interface DocsStore {
  docs: DOC[];
  selectedDoc: DOC | null;
  selectedContent: ContentType;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadDocs: () => Promise<void>;
  loadDocsBySubject: (subjectId: string) => Promise<void>;
  createDoc: (name: string, url: string, size: string, pages: number, subjectId: string) => Promise<DOC>;
  deleteDoc: (id: string) => Promise<void>;
  setSelectedDoc: (doc: DOC | null) => void;
  setSelectedContent: (content: ContentType) => void;
  resetSelection: () => void;
  clearError: () => void;
}

export const useDocsStore = create<DocsStore>((set, get) => ({
  docs: [],
  selectedDoc: null,
  selectedContent: null,
  loading: false,
  error: null,

  loadDocs: async () => {
    set({ loading: true, error: null });
    try {
      const docs = await getAllDocs();
      set({ docs, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load documents',
        loading: false 
      });
    }
  },

  loadDocsBySubject: async (subjectId: string) => {
    set({ loading: true, error: null });
    try {
      const docs = await getDocsBySubject(subjectId);
      set({ docs, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load documents',
        loading: false 
      });
    }
  },

  createDoc: async (name: string, url: string, size: string, pages: number, subjectId: string) => {
    set({ loading: true, error: null });
    try {
      const newDoc = await createDocDB(name, url, size, pages, subjectId);
      await get().loadDocs();
      return newDoc;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create document',
        loading: false 
      });
      throw error;
    }
  },

  deleteDoc: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteDocDB(id);
      await get().loadDocs();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete document',
        loading: false 
      });
      throw error;
    }
  },

  setSelectedDoc: (doc: DOC | null) => {
    set({ selectedDoc: doc, selectedContent: null });
  },

  setSelectedContent: (content: ContentType) => {
    set({ selectedContent: content });
  },

  resetSelection: () => {
    set({ selectedDoc: null, selectedContent: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// PDF Store - backward compatibility wrapper around DocsStore
export const usePDFStore = useDocsStore;
