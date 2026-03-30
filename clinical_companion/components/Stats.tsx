import React from 'react';
import { MedicalLog } from '../types';

interface StatsProps {
  logs: MedicalLog[];
  activeColor?: string;
  missedCount?: number;
}

interface StatItemProps {
  value: string | number;
  label: string;
  icon: string;
  highlight?: string;
  subtext?: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, icon, highlight, subtext }) => (
  <div className="flex flex-col items-center text-center px-3 py-2 rounded-xl bg-surface-raised border border-border">
    <div className={`w-8 h-8 rounded-xl bg-surface flex items-center justify-center mb-2.5 border border-border shadow-sm ${highlight ? 'ring-2 ring-primary/5' : ''}`}>
      <i className={`fa-solid ${icon} ${highlight ? highlight : 'text-text-tertiary'} text-[11px]`} />
    </div>
    <p className={`text-xl font-black leading-none ${highlight || 'text-text-primary'}`}>{value}</p>
    {subtext && <p className="text-[10px] font-medium text-text-tertiary mt-0.5">{subtext}</p>}
    <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const Stats: React.FC<StatsProps> = ({ logs, activeColor = 'bg-primary', missedCount = 0 }) => {
  const uniqueMeds = new Set(
    logs.filter(l => l.name).map(l => l.name!.toLowerCase())
  ).size;

  const lastEntry = logs.length > 0 ? logs[0].timestamp : null;
  const lastTime = lastEntry
    ? new Date(lastEntry).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const textColor = activeColor.includes('bg-') ? activeColor.replace('bg-', 'text-') : 'text-primary';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatItem
        value={logs.length}
        label="Total Logs"
        icon="fa-notes-medical"
      />
      <StatItem
        value={uniqueMeds}
        label="Unique Items"
        icon="fa-pills"
        highlight={textColor}
      />
      <StatItem
        value={missedCount}
        label="Missed"
        icon="fa-triangle-exclamation"
        highlight={missedCount > 0 ? 'text-warning' : 'text-text-secondary'}
      />
      <StatItem
        value={lastTime}
        label="Latest Entry"
        icon="fa-clock"
      />
    </div>
  );
};

export default Stats;
