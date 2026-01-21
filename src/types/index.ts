export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in-progress' | 'done' | 'dropped';
    projectId?: string;
    parentTaskId?: string;
    isRecurring: boolean;
    recurringPatternId?: string;
    progress: number;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface Project {
    id: string;
    name: string;
    color: string;
    icon?: string;
    createdAt: string;
}

export interface TaskTag {
    taskId: string;
    tagId: string;
}

export interface RecurringPattern {
    id: string;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday
    dayOfMonth?: number;
    monthOfYear?: number;
    endDate?: string;
    occurrenceCount?: number;
    customPattern?: string;
}

export interface Subtask {
    id: string;
    taskId: string;
    title: string;
    isCompleted: boolean;
    order: number;
}

export interface Attachment {
    id: string;
    taskId: string;
    type: 'link' | 'file' | 'note';
    content: string;
    createdAt: string;
}

export interface Reminder {
    id: string;
    taskId: string;
    reminderTime: string;
    isSnoozed: boolean;
    snoozeUntil?: string;
}

export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    backgroundColor: string;
    opacity: number;
    isAlwaysOnTop: boolean;
    isScreenSharePrivate: boolean;
    defaultView: 'list' | 'calendar' | 'kanban' | 'matrix';
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    soundVolume: number;
    defaultReminderTime: number;
    autoSaveInterval: number;
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    hasCompletedOnboarding: boolean;
}

export interface FilterOptions {
    status?: ('todo' | 'in-progress' | 'done' | 'dropped')[];
    priority?: ('high' | 'medium' | 'low')[];
    tags?: string[];
    projects?: string[];
    dateRange?: {
        start: string;
        end: string;
    };
    searchQuery?: string;
    sortBy?: 'date' | 'name' | 'priority' | 'tag';
}

export type ViewMode = 'list' | 'calendar' | 'kanban' | 'matrix';

export interface TaskStatistics {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
    byPriority: {
        high: number;
        medium: number;
        low: number;
    };
    byProject: Record<string, number>;
}
