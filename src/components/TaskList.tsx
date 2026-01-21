import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { useTaskStore } from '../store/taskStore';
import { useUIStore } from '../store/uiStore';
import { Task } from '../types';
import { isToday, isPast } from 'date-fns';

import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from './ContextMenu';

export const TaskList: React.FC = () => {
    const { tasks, searchQuery, filters, setSelectedTask, updateTask, deleteTask } = useTaskStore();
    const { openModal, isFocusMode } = useUIStore();

    // Context Menu State
    const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; taskId: string } | null>(null);
    const [isCreatingList, setIsCreatingList] = React.useState(false);
    const [newListName, setNewListName] = React.useState('');

    const handleContextMenu = (e: React.MouseEvent, task: Task) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, taskId: task.id });
        setIsCreatingList(false);
        setNewListName('');
    };

    const handleMoveToProject = (projectId: string) => {
        if (contextMenu) {
            updateTask(contextMenu.taskId, { projectId });
            setContextMenu(null);
        }
    };

    const handleStatusChange = (status: 'todo' | 'in-progress' | 'done' | 'dropped') => {
        if (contextMenu) {
            updateTask(contextMenu.taskId, { status });
            setContextMenu(null);
        }
    };


    const filteredTasks = useMemo(() => {
        let filtered = tasks;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter((task) => filters.status!.includes(task.status));
        }

        // Priority filter
        if (filters.priority && filters.priority.length > 0) {
            filtered = filtered.filter((task) => filters.priority!.includes(task.priority));
        }

        // Sort Logic
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'date':
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    case 'name':
                        return a.title.localeCompare(b.title);
                    case 'priority': {
                        const priorities = { high: 3, medium: 2, low: 1 };
                        return (priorities[b.priority] || 0) - (priorities[a.priority] || 0);
                    }
                    case 'tag':
                        // Assuming tags will be implemented later, for now sort by title
                        return a.title.localeCompare(b.title);
                    default:
                        return 0;
                }
            });
        }

        // Filter by Project
        if (filters.projects && filters.projects.length > 0) {
            filtered = filtered.filter((task) => task.projectId && filters.projects!.includes(task.projectId));
        }

        // Filter by Date Range
        if (filters.dateRange) {
            const startStr = filters.dateRange.start;
            const endStr = filters.dateRange.end;

            // Check if specific date filter (start === end)
            if (startStr && endStr && startStr === endStr) {
                const filterDate = new Date(startStr);
                filtered = filtered.filter(task => {
                    if (!task.dueDate) return false;
                    const taskDate = new Date(task.dueDate);
                    return taskDate.getDate() === filterDate.getDate() &&
                        taskDate.getMonth() === filterDate.getMonth() &&
                        taskDate.getFullYear() === filterDate.getFullYear();
                });
            }
        }

        // Sort Logic
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'date':
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    case 'name':
                        return a.title.localeCompare(b.title);
                    case 'priority': {
                        const priorities = { high: 3, medium: 2, low: 1 };
                        return (priorities[b.priority] || 0) - (priorities[a.priority] || 0);
                    }
                    case 'tag':
                        // Sort by Project Name as Tag
                        const pA = a.projectId || '';
                        const pB = b.projectId || '';
                        return pA.localeCompare(pB);
                    default:
                        return 0;
                }
            });
        }

        // Focus mode - show only today's tasks or top 3 priorities
        if (isFocusMode) {
            filtered = filtered.filter(
                (task) =>
                    task.status !== 'done' &&
                    (task.dueDate ? isToday(new Date(task.dueDate)) : task.priority === 'high')
            );
            filtered = filtered.slice(0, 3);
        }

        return filtered;
    }, [tasks, searchQuery, filters, isFocusMode]);

    const groupedTasks = useMemo(() => {
        const groups: { [key: string]: Task[] } = {
            overdue: [],
            today: [],
            upcoming: [],
            'no-date': [],
        };

        filteredTasks.forEach((task) => {
            if (task.status === 'done') return;

            if (!task.dueDate) {
                groups['no-date'].push(task);
            } else {
                const dueDate = new Date(task.dueDate);
                if (isPast(dueDate) && !isToday(dueDate)) {
                    groups.overdue.push(task);
                } else if (isToday(dueDate)) {
                    groups.today.push(task);
                } else {
                    groups.upcoming.push(task);
                }
            }
        });

        return groups;
    }, [filteredTasks]);

    const handleToggle = (id: string) => {
        const task = tasks.find((t) => t.id === id);
        if (task) {
            const newStatus = task.status === 'done' ? 'todo' : 'done';
            updateTask(id, {
                status: newStatus,
                completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
            });
        }
    };

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        openModal('edit-task');
    };

    const handleDelete = (id: string) => {
        deleteTask(id);
    };

    const renderGroup = (title: string, tasks: Task[], color: string) => {
        if (tasks.length === 0) return null;

        return (
            <div key={title} className="mb-6">
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${color}`}>
                    {title} ({tasks.length})
                </h3>
                <div className="space-y-2">
                    <AnimatePresence>
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={handleToggle}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onContextMenu={handleContextMenu}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    if (filteredTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md"
                >
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No tasks found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchQuery
                            ? 'Try adjusting your search or filters'
                            : 'Create your first task to get started!'}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-6 overflow-y-auto overflow-x-hidden min-h-0">
            {/* If Sorting is Active, Show Flat List */}
            {filters.sortBy ? (
                <div className="space-y-2">
                    <AnimatePresence>
                        {filteredTasks.filter(t => t.status !== 'done').map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={handleToggle}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onContextMenu={handleContextMenu}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <>
                    {renderGroup('Overdue', groupedTasks.overdue, 'text-red-600 dark:text-red-400')}
                    {renderGroup('Today', groupedTasks.today, 'text-blue-600 dark:text-blue-400')}
                    {renderGroup('Upcoming', groupedTasks.upcoming, 'text-green-600 dark:text-green-400')}
                    {renderGroup('No Due Date', groupedTasks['no-date'], 'text-gray-600 dark:text-gray-400')}
                </>
            )}

            {/* Completed tasks */}
            {tasks.filter((t) => t.status === 'done').length > 0 && (
                <details className="mt-6">
                    <summary className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 cursor-pointer mb-3">
                        Completed ({tasks.filter((t) => t.status === 'done').length})
                    </summary>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {tasks
                                .filter((t) => t.status === 'done')
                                .map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={handleToggle}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onContextMenu={handleContextMenu}
                                    />
                                ))}
                        </AnimatePresence>
                    </div>
                </details>
            )}
            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                >
                    {/* Change Status Section */}
                    <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
                        Change Status
                    </div>
                    <ContextMenuItem onClick={() => handleStatusChange('todo')}>
                        <span className="text-gray-400">📋 To Do</span>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleStatusChange('in-progress')}>
                        <span className="text-blue-400">⚡ In Progress</span>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleStatusChange('done')}>
                        <span className="text-green-400">✅ Done</span>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleStatusChange('dropped')}>
                        <span className="text-gray-500">❌ Dropped</span>
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
                        Move to List
                    </div>

                    {/* Existing Lists */}
                    {['Life', 'Work'].concat(Array.from(new Set(tasks.map(t => t.projectId).filter((id): id is string => !!id && id !== 'Life' && id !== 'Work')))).map(project => (
                        <ContextMenuItem
                            key={project}
                            onClick={() => handleMoveToProject(project)}
                        >
                            {project}
                        </ContextMenuItem>
                    ))}

                    <ContextMenuSeparator />

                    {/* Create New List */}
                    {isCreatingList ? (
                        <div className="px-2 py-1">
                            <input
                                autoFocus
                                type="text"
                                placeholder="List Name..."
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newListName.trim()) {
                                        handleMoveToProject(newListName.trim());
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <ContextMenuItem onClick={() => setIsCreatingList(true)}>
                            <span className="text-primary">+ Create New List</span>
                        </ContextMenuItem>
                    )}
                </ContextMenu>
            )}
        </div>
    );
};
