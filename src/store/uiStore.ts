import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
    theme: 'light' | 'dark' | 'system';
    backgroundColor: string;
    accentColor: string;
    opacity: number;
    isAlwaysOnTop: boolean;
    isScreenSharePrivate: boolean;
    isFocusMode: boolean;
    activeModal: string | null;
    sidebarCollapsed: boolean;
    activeView: 'tasks' | 'notes';

    // Actions
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setActiveView: (view: 'tasks' | 'notes') => void;
    setBackgroundColor: (color: string) => void;
    setAccentColor: (color: string) => void;
    setOpacity: (opacity: number) => void;
    setAlwaysOnTop: (flag: boolean) => void;
    setScreenSharePrivacy: (flag: boolean) => void;
    setFocusMode: (flag: boolean) => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
    toggleSidebar: () => void;
}

// Helper to convert hex to RGB channels for Tailwind
const updateCssVariable = (variable: string, hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.documentElement.style.setProperty(variable, `${r} ${g} ${b}`);
};

export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            theme: 'dark', // Default to dark for Fastodo style
            backgroundColor: '#121212',
            accentColor: '#fbbf24', // Amber-400
            opacity: 1.0,
            isAlwaysOnTop: false,
            isScreenSharePrivate: false,
            isFocusMode: false,
            activeModal: null,
            sidebarCollapsed: false,
            activeView: 'tasks',

            setActiveView: (view) => set({ activeView: view }),

            setTheme: (theme) => {
                set({ theme });
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },

            setBackgroundColor: (color) => {
                set({ backgroundColor: color });
                updateCssVariable('--bg-color', color);
                // Also update surface color to be slightly lighter
                // Simple heuristic: lighten by 10%
                // For now just keep it static or derived? 
                // Let's just update main bg for now.
                if (window.electronAPI) {
                    window.electronAPI.setBackgroundColor(color);
                }
            },

            setAccentColor: (color) => {
                set({ accentColor: color });
                updateCssVariable('--primary-color', color);
            },

            setOpacity: (opacity) => {
                set({ opacity });
                if (window.electronAPI) {
                    window.electronAPI.setOpacity(opacity);
                }
            },

            setAlwaysOnTop: async (flag) => {
                set({ isAlwaysOnTop: flag });
                if (window.electronAPI) {
                    await window.electronAPI.setAlwaysOnTop(flag);
                }
            },

            setScreenSharePrivacy: async (flag) => {
                set({ isScreenSharePrivate: flag });
                if (window.electronAPI) {
                    await window.electronAPI.setScreenSharePrivacy(flag);
                }
            },

            setFocusMode: (flag) => set({ isFocusMode: flag }),

            openModal: (modalId) => set({ activeModal: modalId }),

            closeModal: () => set({ activeModal: null }),

            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        }),
        {
            name: 'ui-settings',
            partialize: (state) => ({
                theme: state.theme,
                backgroundColor: state.backgroundColor,
                accentColor: state.accentColor,
                opacity: state.opacity,
                sidebarCollapsed: state.sidebarCollapsed,
            }),
            onRehydrateStorage: () => (state) => {
                // Restore CSS variables on load
                if (state) {
                    if (state.backgroundColor) updateCssVariable('--bg-color', state.backgroundColor);
                    if (state.accentColor) updateCssVariable('--primary-color', state.accentColor);
                }
            },
        }
    )
);
