import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { TaskList } from './components/TaskList';
import { NotesView } from './components/NotesView';
import { TitleBar } from './components/TitleBar';
import { Modal } from './components/ui/Modal';
import { TaskForm } from './components/TaskForm';
import { SettingsPanel } from './components/SettingsPanel';
import { useUIStore } from './store/uiStore';
import { useEffect, useState } from 'react';

function App() {
    const {
        theme,
        activeModal,
        closeModal,
        openModal,
        setTheme
    } = useUIStore();

    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        // Initialize theme
        const savedTheme = theme || 'system';
        setTheme(savedTheme);

        // Dynamic greeting based on time
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 18) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
        };

        updateGreeting();
        // Update greeting every minute just in case
        const interval = setInterval(updateGreeting, 60000);
        return () => clearInterval(interval);
    }, [theme, setTheme]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'n':
                        e.preventDefault();
                        openModal('new-task');
                        break;
                    case 'f':
                        e.preventDefault();
                        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
                        break;
                    case ',':
                        e.preventDefault();
                        openModal('settings');
                        break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openModal]);

    return (
        <div className="flex h-screen bg-background text-gray-100 overflow-hidden font-sans transition-colors duration-300">
            {/* Title Bar (Floating on top) */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <TitleBar />
            </div>

            {/* Main Grid Content - Padded top to avoid TitleBar overlap */}
            <div className="flex w-full h-full pt-8">

                {/* Left Column: Sidebar */}
                <div className="w-[260px] flex-shrink-0 h-full border-r border-white/5 bg-background z-20">
                    <Sidebar />
                </div>

                {/* Center Column: Main Content */}
                <div className="flex-1 h-full min-w-0 relative flex flex-col z-10 bg-background">
                    {useUIStore.getState().activeView === 'tasks' ? (
                        <>
                            {/* Header Area */}
                            <div className="px-8 pt-8 pb-4">
                                <h1 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                                    {greeting}.
                                </h1>
                                <p className="text-gray-500 text-lg mt-1 font-medium">What's your plan for today?</p>
                            </div>

                            {/* Quick Add Input */}
                            <div className="px-8 mb-6">
                                <button
                                    onClick={() => openModal('new-task')}
                                    className="w-full bg-surface hover:bg-white/10 text-gray-400 text-left p-4 rounded-xl transition-all border border-white/5 flex items-center gap-3 group"
                                >
                                    <span className="text-xl font-light group-hover:text-primary transition-colors">+</span>
                                    <span className="font-medium">Add Todo</span>
                                </button>
                            </div>

                            {/* Task List Container */}
                            <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
                                <TaskList />
                            </div>
                        </>
                    ) : (
                        // Notes View
                        <div className="flex-1 h-full overflow-hidden">
                            <NotesView />
                        </div>
                    )}
                </div>

                {/* Right Column: Widgets */}
                <div className="w-[320px] flex-shrink-0 h-full border-l border-white/5 bg-background z-20">
                    <RightPanel />
                </div>
            </div>

            {/* Modals Overlay */}
            <Modal
                isOpen={activeModal === 'new-task'}
                onClose={closeModal}
                title="New Task"
            >
                <TaskForm />
            </Modal>

            <Modal
                isOpen={activeModal === 'edit-task'}
                onClose={closeModal}
                title="Edit Task"
            >
                <TaskForm />
            </Modal>

            <Modal
                isOpen={activeModal === 'settings'}
                onClose={closeModal}
                title="Settings"
            >
                <SettingsPanel />
            </Modal>
        </div>
    );
}

export default App;
