import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
    id: string;
    title: string;
    content: string; // HTML content from ReactQuill
    updatedAt: string;
}

interface NoteStore {
    notes: Note[];
    activeNoteId: string | null;
    isLoading: boolean;

    // Actions
    loadNotes: () => Promise<void>;
    addNote: () => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    setActiveNote: (id: string) => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
    notes: [],
    activeNoteId: null,
    isLoading: false,

    loadNotes: async () => {
        set({ isLoading: true });
        try {
            if (window.electronAPI) {
                const notes = await window.electronAPI.getNotes();
                set({ notes: notes || [], isLoading: false });
                if (notes && notes.length > 0 && !get().activeNoteId) {
                    set({ activeNoteId: notes[0].id });
                }
            } else {
                // Fallback for non-electron (dev)
                const saved = localStorage.getItem('notes');
                if (saved) set({ notes: JSON.parse(saved) });
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load notes', error);
            set({ isLoading: false });
        }
    },

    addNote: () => {
        const newNote: Note = {
            id: uuidv4(),
            title: 'New Note',
            content: '',
            updatedAt: new Date().toISOString(),
        };

        const { notes } = get();
        const updatedNotes = [newNote, ...notes];
        set({ notes: updatedNotes, activeNoteId: newNote.id });

        // Persist
        if (window.electronAPI) {
            window.electronAPI.saveNotes(updatedNotes);
        } else {
            localStorage.setItem('notes', JSON.stringify(updatedNotes));
        }
    },

    updateNote: (id, updates) => {
        const { notes } = get();
        const updatedNotes = notes.map(note =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
        );
        set({ notes: updatedNotes });

        // Persist (Debounce could be added here if needed, but for now direct save)
        if (window.electronAPI) {
            window.electronAPI.saveNotes(updatedNotes);
        } else {
            localStorage.setItem('notes', JSON.stringify(updatedNotes));
        }
    },

    deleteNote: (id) => {
        const { notes, activeNoteId } = get();
        const updatedNotes = notes.filter(n => n.id !== id);

        let newActiveId = activeNoteId;
        if (activeNoteId === id) {
            newActiveId = updatedNotes.length > 0 ? updatedNotes[0].id : null;
        }

        set({ notes: updatedNotes, activeNoteId: newActiveId });

        if (window.electronAPI) {
            window.electronAPI.saveNotes(updatedNotes);
        } else {
            localStorage.setItem('notes', JSON.stringify(updatedNotes));
        }
    },

    setActiveNote: (id) => set({ activeNoteId: id }),
}));
