import React, { useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
import { useNoteStore } from '../store/noteStore';
import { Plus, Trash2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export const NotesView: React.FC = () => {
    const { notes, activeNoteId, loadNotes, addNote, updateNote, deleteNote, setActiveNote } = useNoteStore();

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const activeNote = notes.find(n => n.id === activeNoteId);

    return (
        <div className="flex h-full w-full">
            {/* Notes List (Left Pane) */}
            <div className="w-64 border-r border-white/5 flex flex-col bg-surface/30">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-200">All Notes</h2>
                    <button
                        onClick={addNote}
                        className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {notes.map(note => (
                        <motion.div
                            key={note.id}
                            layout
                            onClick={() => setActiveNote(note.id)}
                            className={`
                                p-3 rounded-xl cursor-pointer transition-all group relative
                                ${activeNoteId === note.id ? 'bg-primary text-background' : 'hover:bg-white/5 text-gray-400'}
                            `}
                        >
                            <div className="font-medium truncate pr-4">{note.title || 'Untitled'}</div>
                            <div className={`text-xs mt-1 truncate ${activeNoteId === note.id ? 'text-black/60' : 'text-gray-600'}`}>
                                {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete note?')) deleteNote(note.id);
                                }}
                                className={`
                                    absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                                    ${activeNoteId === note.id ? 'hover:bg-black/10 text-black/60' : 'hover:bg-red-500/20 hover:text-red-500'}
                                `}
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}

                    {notes.length === 0 && (
                        <div className="text-center mt-10 text-gray-500 text-sm">
                            No notes yet.<br />Click + to create one.
                        </div>
                    )}
                </div>
            </div>

            {/* Editor (Right Pane) */}
            <div className="flex-1 flex flex-col bg-background relative">
                {activeNote ? (
                    <>
                        <div className="p-4 border-b border-white/5">
                            <input
                                type="text"
                                value={activeNote.title}
                                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                                placeholder="Note Title"
                                className="text-2xl font-bold bg-transparent border-none focus:outline-none w-full text-white placeholder-gray-600"
                            />
                        </div>
                        <div className="flex-1 overflow-hidden notes-editor-container">
                            <ReactQuill
                                theme="snow"
                                value={activeNote.content}
                                onChange={(content) => updateNote(activeNote.id, { content })}
                                className="h-full border-none"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p>Select a note to view</p>
                    </div>
                )}
            </div>

            {/* Custom Styles for Quill Dark Mode Override */}
            <style>{`
                .notes-editor-container .ql-container {
                    border: none !important;
                    font-family: 'Inter', sans-serif;
                    font-size: 1rem;
                }
                .notes-editor-container .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                }
                .notes-editor-container .ql-editor {
                    color: #e5e7eb;
                    height: 100%;
                }
                .notes-editor-container .ql-stroke {
                    stroke: #9ca3af !important;
                }
                .notes-editor-container .ql-fill {
                    fill: #9ca3af !important;
                }
                .notes-editor-container .ql-picker {
                    color: #9ca3af !important;
                }
            `}</style>
        </div>
    );
};
