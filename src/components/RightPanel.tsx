import React from 'react';
import { motion } from 'framer-motion';

export const RightPanel: React.FC = () => {
    // Current date logic
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'short' }); // Feb
    const currentYear = today.getFullYear(); // 2023

    // Mock calendar grid generation (simple version)
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const calendarDays = Array.from({ length: 28 }, (_, i) => i + 1); // Mock Feb
    const activeDay = 4; // Mock

    return (
        <div className="h-full flex flex-col bg-background/50 p-6 no-drag">
            {/* Calendar Widget */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <span className="text-gray-400">◄</span>
                    </button>
                    <div className="text-center">
                        <div className="text-xl font-bold">{currentYear}</div>
                        <div className="text-primary font-medium">{currentMonth}</div>
                    </div>
                    <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <span className="text-gray-400">►</span>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {days.map(d => (
                        <div key={d} className="text-gray-500 font-medium py-2">{d}</div>
                    ))}
                    {calendarDays.map(d => (
                        <div
                            key={d}
                            className={`
                                py-2 rounded-full text-gray-300 cursor-pointer hover:bg-white/5 transition-colors
                                ${d === activeDay ? 'bg-primary text-background font-bold shadow-soft' : ''}
                            `}
                        >
                            {d}
                        </div>
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 py-2.5 bg-surface text-gray-300 rounded-xl hover:bg-white/5 transition-colors font-medium border border-white/5"
                >
                    Show All
                </motion.button>
            </div>

            {/* Sort/Filter Widget */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Sort Method</h3>
                <div className="grid grid-cols-2 gap-3">
                    {['None', 'Date', 'Name', 'Tag', 'Priority'].map((item) => (
                        <motion.button
                            key={item}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                px-4 py-3 rounded-xl font-medium text-sm text-left transition-all
                                ${item === 'Priority' ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'bg-surface text-gray-400 hover:text-white'}
                            `}
                        >
                            {item}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};
