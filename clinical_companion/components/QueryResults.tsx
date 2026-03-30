import React, { useState } from 'react';
import { QueryResponse } from '../types';

interface QueryResultsProps {
  result: QueryResponse;
  onExit: () => void;
  onPlay?: (item: any) => void;
}

const QueryResults: React.FC<QueryResultsProps> = ({ result, onExit, onPlay }) => {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case 'medication': return 'fa-pills';
      case 'vitamin': return 'fa-bottle-droplet';
      case 'treatment': return 'fa-hand-holding-medical';
      default: return 'fa-notes-medical';
    }
  };

  const handlePlay = async (item: any, idx: number) => {
    if (!onPlay) return;
    setPlayingIdx(idx);
    try {
      // Create a dummy log object for playback compatibility
      const playbackObj = {
        name: item.name,
        dosage: { amount: item.dosage.split(' ')[0], unit: item.dosage.split(' ')[1] || '' },
        time_taken: item.time,
        timestamp: new Date().toISOString()
      };
      await onPlay(playbackObj);
    } finally {
      setPlayingIdx(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
            <i className="fa-solid fa-sparkles text-[10px]"></i>
            AI Query Result
          </h2>
          <p className="text-xl font-bold text-text-primary italic">"{result.query}"</p>
        </div>
        <button
          onClick={onExit}
          className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm font-medium bg-black/5 dark:bg-white/5 border border-border px-3 py-1.5 rounded-full transition-colors shadow-inner"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to History
        </button>
      </div>

      {result.results.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-border p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-text-secondary/70 border border-border shadow-inner">
            <i className="fa-solid fa-magnifying-glass-slash text-2xl"></i>
          </div>
          <p className="text-text-secondary font-medium">No matching records found with current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {result.results.map((item, idx) => (
            <div
              key={idx}
              className="bg-surface border-l-4 border-l-primary rounded-2xl shadow-sm border border-border p-5 animate-in fade-in slide-in-from-right-4 duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm border border-border ${playingIdx === idx ? 'bg-primary text-white shadow-md' : 'bg-primary/5 text-primary'}`}>
                    <i className={`fa-solid ${playingIdx === idx ? 'fa-volume-high animate-pulse' : getTypeIcon(item.type)}`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{item.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlay(item, idx)}
                    className={`p-2 rounded-full transition-colors ${playingIdx === idx ? 'text-primary bg-primary/10 shadow-inner' : 'text-text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'}`}
                    title="Read Aloud"
                  >
                    <i className={`fa-solid ${playingIdx === idx ? 'fa-volume-high animate-pulse' : 'fa-volume-low'} text-sm`}></i>
                  </button>
                  <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded uppercase tracking-tighter border border-primary/20 shadow-sm">
                    Match
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-tighter">Date</span>
                  <span className="text-sm text-text-secondary font-medium">{item.date}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-tighter">Time/Freq</span>
                  <span className="text-sm text-text-secondary font-medium">{item.time}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-tighter">Dosage</span>
                  <span className="text-sm text-text-secondary font-medium">{item.dosage}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-tighter">Context</span>
                  <span className="text-sm text-text-secondary font-medium capitalize">{item.context}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueryResults;
