import React from 'react';
import { Activity, ShieldAlert, LogOut } from 'lucide-react';
import useStore from '../../store/useStore';
import ThemeToggle from '../ThemeToggle';

const TopNav = () => {
    const { alerts, logout } = useStore();

    return (
        <nav className="flex justify-between items-center mb-8 glass-card px-5 py-3.5 sticky top-4 z-50">
            {/* Brand */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Activity className="text-primary" size={18} />
                </div>
                <h1 className="text-xl font-black tracking-tight text-text-primary">
                    RecoverAI<span className="text-primary">∞</span>
                </h1>

                {/* Live status badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-success/8 dark:bg-success/10 border border-success/20 rounded-full">
                    <span className="status-dot-live" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider whitespace-nowrap">Live Synced</span>
                </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
                {alerts?.length > 0 && (
                    <div className="flex items-center gap-2 text-danger bg-danger/8 dark:bg-danger/10 px-3 py-1.5 rounded-xl border border-danger/20 animate-pulse">
                        <ShieldAlert size={15} />
                        <span className="text-xs font-bold">{alerts.length} Alert{alerts.length > 1 ? 's' : ''}</span>
                    </div>
                )}

                <ThemeToggle />

                <button
                    onClick={logout}
                    className="glass-button text-xs gap-1.5 py-2 px-3"
                >
                    <LogOut size={14} />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default TopNav;
