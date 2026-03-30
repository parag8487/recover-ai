import React, { useState, useMemo } from 'react';
import { MedicalLog } from '../types';

interface LogListProps {
  logs: MedicalLog[];
  onDelete: (id: string) => void;
  onPlay?: (log: MedicalLog) => void;
  activeColor?: string;
  allLogs?: MedicalLog[];
}

interface GroupedLogs {
  type: 'stay' | 'standalone';
  stayId?: string;
  logs: MedicalLog[];
  latestTimestamp: string;
}

const getTypeIcon = (type: string | null) => {
  switch (type) {
    case 'medication': return 'fa-pills';
    case 'vitamin': return 'fa-bottle-droplet';
    case 'treatment': return 'fa-hand-holding-medical';
    case 'observation': return 'fa-face-smile-beam';
    case 'doctor_visit': return 'fa-stethoscope';
    default: return 'fa-notes-medical';
  }
};

const getTypeColor = (type: string | null) => {
  switch (type) {
    case 'medication': return 'text-primary bg-primary/8 border-primary/20';
    case 'vitamin': return 'text-success bg-success/8 border-success/20';
    case 'treatment': return 'text-accent bg-accent/8 border-accent/20';
    case 'observation': return 'text-warning bg-warning/8 border-warning/20';
    case 'doctor_visit': return 'text-primary bg-primary/8 border-primary/20';
    default: return 'text-text-secondary bg-surface-raised border-border';
  }
};

const LogList: React.FC<LogListProps> = ({ logs, onDelete, onPlay, activeColor = 'bg-primary', allLogs = [] }) => {
  const [expandedTrail, setExpandedTrail] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const result: GroupedLogs[] = [];
    const stayMap = new Map<string, MedicalLog[]>();
    const standalones: MedicalLog[] = [];

    logs.forEach(log => {
      if (log.stayId) {
        if (!stayMap.has(log.stayId)) stayMap.set(log.stayId, []);
        stayMap.get(log.stayId)!.push(log);
      } else {
        standalones.push(log);
      }
    });

    stayMap.forEach((stayLogs, stayId) => {
      result.push({
        type: 'stay',
        stayId,
        logs: stayLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        latestTimestamp: stayLogs[0].timestamp
      });
    });

    standalones.forEach(log => {
      result.push({ type: 'standalone', logs: [log], latestTimestamp: log.timestamp });
    });

    return result.sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime());
  }, [logs]);

  const handlePlay = async (log: MedicalLog) => {
    if (!onPlay) return;
    setPlayingId(log.id);
    try { await onPlay(log); } finally { setPlayingId(null); }
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <div className="w-14 h-14 bg-surface-raised border border-border rounded-2xl flex items-center justify-center">
          <i className="fa-solid fa-microphone-slash text-xl text-text-tertiary" />
        </div>
        <p className="font-bold text-xs text-text-secondary uppercase tracking-wider">No history yet</p>
        <p className="text-xs text-text-tertiary max-w-xs leading-relaxed font-medium">
          Logs from home, doctor visits, and hospital stays appear here after processing.
        </p>
      </div>
    );
  }

  const renderLogItem = (log: MedicalLog, isNested: boolean = false) => {
    const isObservation = log.type === 'observation';
    const isDoctorVisit = log.type === 'doctor_visit';
    const isPlaying = playingId === log.id;
    const typeColorClass = getTypeColor(log.type);
    const linkedLog = log.linked_log_id ? allLogs.find(l => l.id === log.linked_log_id) : null;

    const timestamp = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isObservation || isDoctorVisit) {
      return (
        <div
          key={log.id}
          className={`group bg-surface rounded-2xl border p-4 transition-all ${isNested
            ? 'border-border/60 bg-surface-raised'
            : log.context === 'hospital'
              ? 'border-primary/25 bg-primary/3'
              : 'border-border border-dashed'
            }`}
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className={`w-9 h-9 mt-0.5 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${isPlaying ? 'bg-primary text-white border-primary' : typeColorClass
                }`}>
                <i className={`fa-solid ${isPlaying ? 'fa-volume-high animate-pulse' : getTypeIcon(log.type)} text-xs`} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mb-0.5">
                  {isDoctorVisit ? 'Professional Consult' : 'Clinical Observation'}
                </p>
                <p className={`text-sm font-bold leading-tight truncate ${isDoctorVisit ? 'text-primary' : 'text-text-primary'}`}>
                  {isDoctorVisit ? log.name : `"${log.name}"`}
                </p>
                <p className="text-[10px] text-text-tertiary font-medium mt-0.5">
                  <i className="fa-regular fa-clock mr-1" />{timestamp}
                </p>
                {log.notes && (
                  <p className={`mt-2 text-xs leading-relaxed italic p-2.5 rounded-lg border ${isDoctorVisit
                    ? 'bg-primary/5 text-primary border-primary/15'
                    : 'bg-surface-raised text-text-secondary border-border'
                    }`}>
                    {log.notes}
                  </p>
                )}
                {linkedLog && (
                  <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-primary/8 rounded-lg border border-primary/15 w-fit">
                    <i className="fa-solid fa-link text-primary text-[8px]" />
                    <span className="text-[9px] font-bold text-primary uppercase tracking-tight">→ {linkedLog.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0 mt-0.5">
              <button
                onClick={() => handlePlay(log)}
                className={`w-7 h-7 rounded-full transition-colors flex items-center justify-center ${isPlaying ? 'text-primary bg-primary/10' : 'text-text-tertiary hover:text-primary hover:bg-surface-raised'
                  }`}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-volume-high animate-pulse' : 'fa-volume-low'} text-xs`} />
              </button>
              <button
                onClick={() => onDelete(log.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/8 transition-colors opacity-0 group-hover:opacity-100"
              >
                <i className="fa-solid fa-trash-can text-xs" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Standard medication/vitamin/treatment log
    const hasName = !!log.name;
    return (
      <div
        key={log.id}
        className={`group bg-surface rounded-xl border p-4 transition-all ${isNested
          ? 'border-border/60'
          : log.context === 'hospital'
            ? 'border-l-2 border-l-primary border-border'
            : 'border-border'
          }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2.5">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${isPlaying ? 'bg-primary text-white border-primary' : typeColorClass
              }`}>
              <i className={`fa-solid ${isPlaying ? 'fa-volume-high animate-pulse' : getTypeIcon(log.type)} text-[10px]`} />
            </div>
            <div>
              <h3 className={`text-sm font-bold leading-tight ${hasName ? 'text-text-primary' : 'text-warning italic'}`}>
                {log.name || 'Missing Name'}
              </h3>
              <p className="text-[9px] text-text-tertiary font-semibold uppercase tracking-wider mt-0.5">
                {timestamp}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handlePlay(log)}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isPlaying ? 'text-primary bg-primary/10' : 'text-text-tertiary hover:text-primary hover:bg-surface-raised'
                }`}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-volume-high animate-pulse' : 'fa-volume-low'} text-xs`} />
            </button>
            <button
              onClick={() => onDelete(log.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-text-tertiary hover:text-danger hover:bg-danger/8 transition-colors opacity-0 group-hover:opacity-100"
            >
              <i className="fa-solid fa-trash-can text-xs" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {[
            { label: 'Dosage', value: `${log.dosage?.amount || '--'} ${log.dosage?.unit || ''}`.trim() },
            { label: 'Timing', value: log.time_taken || log.frequency || '--' },
            { label: 'Route', value: log.route || 'Oral' },
            { label: 'Context', value: log.context || 'Home', highlight: log.context === 'hospital' },
          ].map(d => (
            <div key={d.label} className="px-2.5 py-1.5 rounded-lg bg-surface-raised/40 border border-border/60 shadow-sm">
              <span className="block text-[8px] text-text-tertiary font-bold uppercase tracking-wider mb-0.5">{d.label}</span>
              <span className={`text-[11px] font-semibold truncate block capitalize ${d.highlight ? 'text-primary' : 'text-text-primary'}`}>
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {groups.map((group, idx) => (
        <div
          key={group.type === 'stay' ? group.stayId : group.logs[0].id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${idx * 40}ms` }}
        >
          {group.type === 'stay' ? (
            <div className="bg-primary/[0.03] dark:bg-primary/[0.05] border border-primary/20 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                    <i className="fa-solid fa-square-h text-xs" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Hospital Stay</p>
                    <p className="text-xs text-text-primary font-semibold">
                      {new Date(group.latestTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full">
                  {group.logs.length} events
                </div>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-primary/25 relative z-10">
                {group.logs.map(log => renderLogItem(log, true))}
              </div>
            </div>
          ) : (
            renderLogItem(group.logs[0])
          )}
        </div>
      ))}
    </div>
  );
};

export default LogList;
