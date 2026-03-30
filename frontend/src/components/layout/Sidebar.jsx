import React from 'react';
import { Activity, Thermometer, Brain, Stethoscope, FileHeart } from 'lucide-react';

const navItems = [
    { id: 'memory', icon: Stethoscope, label: 'Clinical Memory' },
];

const Sidebar = ({ activeTab, setActiveTab, onFetchReport }) => {
    return (
        <aside className="col-span-3 flex flex-col gap-1 glass-card p-3 h-[calc(100vh-140px)] sticky top-28">
            {/* Section label */}
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-3 pt-1 pb-2">Navigation</p>

            {/* Nav items */}
            <div className="flex-1 space-y-0.5">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.url) {
                                    window.open(item.url, '_blank');
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative border text-left group ${isActive
                                ? 'nav-item-active'
                                : 'text-text-secondary border-transparent hover:bg-surface-raised dark:hover:bg-surface-raised hover:text-text-primary'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r-full" />
                            )}
                            <Icon
                                size={17}
                                className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-text-secondary'}`}
                            />
                            <span className="text-sm font-semibold truncate">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
};

export default Sidebar;
