import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Clock, Check, X } from 'lucide-react';
import { Task } from '../types';
import { format } from 'date-fns';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onContextMenu?: (e: React.MouseEvent, task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete, onContextMenu }) => {
    const [confirmDelete, setConfirmDelete] = useState(false);
    // Priority colors
    const priorityColors = {
        high: 'text-priority-high',
        medium: 'text-priority-medium',
        low: 'text-priority-low',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onContextMenu={(e) => onContextMenu?.(e, task)}
            className={`
                group relative flex items-center gap-4 bg-surface/80 hover:bg-surface 
                p-4 rounded-2xl border border-white/5 shadow-sm hover:shadow-md transition-all
                ${task.status === 'done' ? 'opacity-50' : ''}
            `}
        >
            {/* Checkbox (Circle) */}
            <button
                onClick={() => onToggle(task.id)}
                className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                    ${task.status === 'done'
                        ? 'bg-primary border-primary text-background'
                        : 'border-white/20 hover:border-primary'
                    }
                `}
            >
                {task.status === 'done' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-background"
                    />
                )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className={`font-medium text-base truncate pr-2 ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {task.title}
                    </h3>

                    {/* Status & Priority */}
                    <div className="flex items-center gap-2 text-xs">
                        {task.priority !== 'low' && (
                            <span className={`font-medium ${priorityColors[task.priority]} px-2 py-1 rounded-lg bg-white/5`}>
                                {task.priority}
                            </span>
                        )}
                        <span className={`font-medium px-2 py-1 rounded-lg ${task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                                    task.status === 'dropped' ? 'bg-gray-500/20 text-gray-400' :
                                        'bg-white/5 text-gray-400'
                            }`}>
                            {task.status === 'in-progress' ? 'In Progress' :
                                task.status === 'dropped' ? 'Dropped' :
                                    task.status === 'done' ? 'Done' : 'To Do'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    {task.dueDate && (
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                    )}
                    {task.description && (
                        <span className="truncate max-w-[200px] opacity-70">
                            {task.description}
                        </span>
                    )}
                </div>
            </div>

            {/* Edit/Delete Actions (Hover only) */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-1 rounded-lg backdrop-blur-sm -mr-12 group-hover:mr-2">
                {!confirmDelete ? (
                    <>
                        <button
                            onClick={() => onEdit(task)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                ) : (
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                onDelete(task.id);
                                setConfirmDelete(false);
                            }}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Confirm Delete"
                        >
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Cancel"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
