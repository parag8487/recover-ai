import React from 'react';
import { Activity, TrendingUp, Heart } from 'lucide-react';
import useStore from '../../store/useStore';

const StatCard = ({ label, value, suffix, accent, icon: Icon }) => (
    <div className={`glass-card p-6 border-t-2 ${accent} group hover:-translate-y-0.5 transition-all duration-300 cursor-default`}>
        <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</p>
            {Icon && (
                <div className="w-7 h-7 rounded-lg bg-surface-raised flex items-center justify-center">
                    <Icon size={14} className="text-text-tertiary" />
                </div>
            )}
        </div>
        <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-text-primary leading-none">{value}</span>
            {suffix && <span className="text-sm font-semibold text-text-tertiary mb-0.5">{suffix}</span>}
        </div>
    </div>
);

const Dashboard = () => {
    const { user, patientLogs, alerts } = useStore();

    const latestHR = patientLogs[0]?.vitals?.hr || 72;
    const recoveryScore = Math.max(0, 90 - (alerts?.length * 5 || 0));
    const stability = patientLogs.length > 5 ? 94 : 88;
    const alertCount = alerts?.length || 0;

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Hero header */}
            <div className="glass-card px-7 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/4 via-accent/3 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-text-tertiary mb-1 uppercase tracking-wider">Patient Dashboard</p>
                        <h2 className="text-2xl font-black text-text-primary tracking-tight">
                            Welcome back, <span className="text-primary">{user?.name}</span>
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">Digital twin is actively synchronized</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/8 dark:bg-success/10 border border-success/20 rounded-full">
                            <span className="status-dot-live" />
                            <span className="text-xs font-bold text-success">Live Sync</span>
                        </div>
                        {alertCount > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/8 dark:bg-danger/10 border border-danger/20 rounded-full">
                                <span className="text-xs font-bold text-danger">{alertCount} Alert{alertCount > 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    label="Recovery Score"
                    value={recoveryScore}
                    suffix="/100"
                    accent="border-t-primary"
                    icon={TrendingUp}
                />
                <StatCard
                    label="Stability Index"
                    value={stability}
                    suffix="%"
                    accent="border-t-success"
                    icon={Activity}
                />
                <StatCard
                    label="Resting HR"
                    value={latestHR}
                    suffix="BPM"
                    accent="border-t-warning"
                    icon={Heart}
                />
            </div>

            {/* HR Trend chart */}
            <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/4 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/15">
                            <Activity className="text-primary" size={14} />
                        </div>
                        <h3 className="text-sm font-bold text-text-primary">Heart Rate Trend</h3>
                    </div>
                    <span className="text-xs text-text-tertiary font-medium">Last 10 readings</span>
                </div>

                {patientLogs.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center">
                            <Activity className="text-text-tertiary" size={18} />
                        </div>
                        <p className="text-xs text-text-tertiary font-medium">Awaiting physiological telemetry</p>
                    </div>
                ) : (
                    <>
                        <div className="h-40 flex items-end gap-2.5 pb-1 relative z-10">
                            {patientLogs.slice(0, 10).reverse().map((l, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end h-full group cursor-pointer">
                                    <div
                                        style={{ height: `${Math.min((l.vitals?.hr || 70) / 120 * 100, 100)}%` }}
                                        className="w-full rounded-t-md bg-primary/15 dark:bg-primary/20 group-hover:bg-primary/40 border-t border-primary/25 transition-all duration-300 relative min-h-[4px]"
                                    >
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-2 py-0.5 rounded-md border border-border shadow-sm whitespace-nowrap z-20 pointer-events-none">
                                            {l.vitals?.hr || '--'} BPM
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-text-tertiary font-semibold uppercase tracking-wider border-t border-border pt-3">
                            <span>Oldest</span>
                            <span>Most Recent</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
