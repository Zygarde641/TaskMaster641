import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNoteStore } from '../store/noteStore';
import { Plus, ArrowLeft, MoreVertical, Search, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export const NotesView: React.FC = () => {
    const { notes, activeNoteId, loadNotes, addNote, updateNote, deleteNote, setActiveNote } = useNoteStore();
    const [viewMode, setViewMode] = useState<'grid' | 'editor'>('grid');
    const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Handle initial view state based on activeNote
    useEffect(() => {
        if (viewMode === 'grid') {
            setActiveNote(null as any); // Clear active note when going to grid
        }
    }, [viewMode, setActiveNote]);

    const handleNoteClick = (id: string) => {
        setActiveNote(id);
        setViewMode('editor');
    };

    const handleBack = () => {
        setViewMode('grid');
    };

    const activeNote = notes.find(n => n.id === activeNoteId);

    return (
        <div className="h-full w-full bg-background relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col p-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Your Notes
                            </h2>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                                    <Search size={20} />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Note Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20 scrollbar-hide">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    addNote();
                                    // Use timeout to allow store to update before switching
                                    setTimeout(() => setViewMode('editor'), 50);
                                }}
                                className="aspect-[4/5] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span className="mt-2 text-sm text-gray-500 font-medium">Create Note</span>
                            </motion.div>

                            {notes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    layoutId={`note-${note.id}`}
                                    onClick={() => handleNoteClick(note.id)}
                                    className="aspect-[4/5] bg-surface rounded-2xl p-4 cursor-pointer hover:shadow-lg hover:shadow-black/20 transition-all flex flex-col relative group border border-white/5"
                                >
                                    <h3 className="font-bold text-lg text-gray-200 mb-2 line-clamp-2">
                                        {note.title || 'Untitled'}
                                    </h3>
                                    <div
                                        className="flex-1 text-xs text-gray-500 overflow-hidden line-clamp-[8] mb-2 font-mono opacity-70"
                                        dangerouslySetInnerHTML={{ __html: note.content }}
                                    />
                                    <div className="mt-auto text-[10px] text-gray-600 font-medium">
                                        {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                                    </div>

                                    {deletingNoteId === note.id ? (
                                        <div className="absolute top-2 right-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => {
                                                    deleteNote(note.id);
                                                    setDeletingNoteId(null);
                                                }}
                                                className="p-1.5 bg-green-500/80 rounded-full hover:bg-green-500 text-white transition-all backdrop-blur-sm"
                                                title="Confirm Delete"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingNoteId(null)}
                                                className="p-1.5 bg-black/40 rounded-full hover:bg-white/20 text-gray-300 transition-all backdrop-blur-sm"
                                                title="Cancel"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingNoteId(note.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all text-gray-300 backdrop-blur-sm"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col bg-background h-full"
                    >
                        {/* Editor Toolbar */}
                        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <input
                                type="text"
                                value={activeNote?.title || ''}
                                onChange={(e) => activeNote && updateNote(activeNote.id, { title: e.target.value })}
                                placeholder="Title"
                                className="flex-1 bg-transparent border-none text-xl font-bold focus:outline-none text-white placeholder-gray-600"
                            />
                            <div className="text-xs text-gray-500">
                                {activeNote && format(new Date(activeNote.updatedAt), 'h:mm a')}
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-hidden samsung-editor-container bg-background">
                            <ReactQuill
                                theme="snow"
                                value={activeNote?.content || ''}
                                onChange={(content) => activeNote && updateNote(activeNote.id, { content })}
                                className="h-full border-none"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'check': 'true' }],
                                        ['link', 'image'],
                                        [{ 'color': [] }, { 'background': [] }],
                                        ['clean']
                                    ],
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .samsung-editor-container .ql-container {
                    border: none !important;
                    font-family: 'Inter', sans-serif;
                    font-size: 1.1rem;
                }
                .samsung-editor-container .ql-toolbar {
                    border: none !important;
                    background: transparent;
                    padding: 12px;
                }
                .samsung-editor-container .ql-editor {
                    color: #d1d5db;
                    padding: 24px;
                }
                .samsung-editor-container .ql-stroke { stroke: #9ca3af !important; }
                .samsung-editor-container .ql-fill { fill: #9ca3af !important; }
                .samsung-editor-container .ql-picker { color: #9ca3af !important; }
            `}</style>
        </div>
    );
};
