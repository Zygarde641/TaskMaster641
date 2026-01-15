import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
    closeWindow: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('window:setAlwaysOnTop', flag),
    getAlwaysOnTop: () => ipcRenderer.invoke('window:getAlwaysOnTop'),
    setScreenSharePrivacy: (flag: boolean) =>
        ipcRenderer.invoke('window:setScreenSharePrivacy', flag),
    getScreenSharePrivacy: () => ipcRenderer.invoke('window:getScreenSharePrivacy'),
    setBackgroundColor: (color: string) => ipcRenderer.invoke('window:setBackgroundColor', color),
    setOpacity: (opacity: number) => ipcRenderer.invoke('window:setOpacity', opacity),
    getSettings: () => ipcRenderer.invoke('settings:get'),
    saveSettings: (settings: unknown) => ipcRenderer.invoke('settings:save', settings),
    getNotes: () => ipcRenderer.invoke('notes:get'),
    saveNotes: (notes: unknown) => ipcRenderer.invoke('notes:save', notes),
});

export interface ElectronAPI {
    minimizeWindow: () => Promise<void>;
    maximizeWindow: () => Promise<void>;
    closeWindow: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    setAlwaysOnTop: (flag: boolean) => Promise<boolean>;
    getAlwaysOnTop: () => Promise<boolean>;
    setScreenSharePrivacy: (flag: boolean) => Promise<boolean>;
    getScreenSharePrivacy: () => Promise<boolean>;
    setBackgroundColor: (color: string) => Promise<string>;
    setOpacity: (opacity: number) => Promise<number>;
    getSettings: () => Promise<unknown>;
    saveSettings: (settings: unknown) => Promise<unknown>;
    getNotes: () => Promise<any[]>;
    saveNotes: (notes: any[]) => Promise<boolean>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
