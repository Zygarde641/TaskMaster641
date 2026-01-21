import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import fs from 'fs';

const isDev = process.env.NODE_ENV === 'development';
const SETTINGS_FILE = path.join(app.getPath('userData'), 'window-settings.json');
const NOTES_FILE = path.join(app.getPath('userData'), 'notes.json');
const TASKS_FILE = path.join(app.getPath('userData'), 'tasks.json');

interface WindowSettings {
    x?: number;
    y?: number;
    width: number;
    height: number;
    isAlwaysOnTop: boolean;
    isScreenSharePrivate: boolean;
    backgroundColor: string;
    opacity: number;
}

// NOTE: We treat notes/tasks as opaque JSON here.
// Render process handles structure.
function loadNotes(): any[] {
    try {
        if (fs.existsSync(NOTES_FILE)) {
            const data = fs.readFileSync(NOTES_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
    }
    return [];
}

function saveNotes(notes: any[]) {
    try {
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    } catch (error) {
        console.error('Error saving notes:', error);
    }
}

function loadTasks(): any[] {
    try {
        if (fs.existsSync(TASKS_FILE)) {
            const data = fs.readFileSync(TASKS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
    return [];
}

function saveTasks(tasks: any[]) {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

let mainWindow: BrowserWindow | null = null;

function loadWindowSettings(): WindowSettings {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading window settings:', error);
    }

    return {
        width: 1000,
        height: 700,
        isAlwaysOnTop: false,
        isScreenSharePrivate: false,
        backgroundColor: '#ffffff',
        opacity: 1.0,
    };
}

function saveWindowSettings(settings: Partial<WindowSettings>) {
    try {
        const currentSettings = loadWindowSettings();
        const newSettings = { ...currentSettings, ...settings };
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    } catch (error) {
        console.error('Error saving window settings:', error);
    }
}

function createWindow() {
    const settings = loadWindowSettings();

    mainWindow = new BrowserWindow({
        width: settings.width || 1200,
        height: settings.height || 800,
        minWidth: 800,
        minHeight: 600,
        x: settings.x,
        y: settings.y,
        frame: false,
        show: false, // Don't show until content is loaded
        backgroundColor: settings.backgroundColor || '#000000',
        opacity: settings.opacity || 1.0,
        alwaysOnTop: settings.isAlwaysOnTop || false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Show window only when ready to avoid blank screen
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    if (process.platform === 'win32' && settings.isScreenSharePrivate) {
        mainWindow.setContentProtection(true);
    }

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
        // TEMPORARY: Open DevTools in production to debug loading issue
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('moved', () => {
        if (mainWindow) {
            const [x, y] = mainWindow.getPosition();
            saveWindowSettings({ x, y });
        }
    });

    mainWindow.on('resized', () => {
        if (mainWindow) {
            const [width, height] = mainWindow.getSize();
            saveWindowSettings({ width, height });
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.handle('window:close', () => {
    mainWindow?.close();
});

ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() || false;
});

ipcMain.handle('window:setAlwaysOnTop', (_event, flag: boolean) => {
    mainWindow?.setAlwaysOnTop(flag);
    saveWindowSettings({ isAlwaysOnTop: flag });
    return flag;
});

ipcMain.handle('window:getAlwaysOnTop', () => {
    const settings = loadWindowSettings();
    return settings.isAlwaysOnTop;
});

ipcMain.handle('window:setScreenSharePrivacy', (_event, flag: boolean) => {
    if (process.platform === 'win32' && mainWindow) {
        mainWindow.setContentProtection(flag);
        saveWindowSettings({ isScreenSharePrivate: flag });
        return flag;
    }
    return false;
});

ipcMain.handle('window:getScreenSharePrivacy', () => {
    const settings = loadWindowSettings();
    return settings.isScreenSharePrivate;
});

ipcMain.handle('window:setBackgroundColor', (_event, color: string) => {
    mainWindow?.setBackgroundColor(color);
    saveWindowSettings({ backgroundColor: color });
    return color;
});

ipcMain.handle('window:setOpacity', (_event, opacity: number) => {
    mainWindow?.setOpacity(opacity);
    saveWindowSettings({ opacity });
    return opacity;
});

ipcMain.handle('settings:get', () => {
    return loadWindowSettings();
});

ipcMain.handle('settings:save', (_event, settings: Partial<WindowSettings>) => {
    saveWindowSettings(settings);
    return loadWindowSettings();
});

ipcMain.handle('notes:get', () => {
    return loadNotes();
});

ipcMain.handle('notes:save', (_event, notes: any[]) => {
    saveNotes(notes);
    return true;
});

ipcMain.handle('tasks:get', () => {
    return loadTasks();
});

ipcMain.handle('tasks:save', (_event, tasks: any[]) => {
    saveTasks(tasks);
    return true;
});
