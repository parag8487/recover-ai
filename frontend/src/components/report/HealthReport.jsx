import React from 'react';
import { Send } from 'lucide-react';

const HealthReport = ({ report }) => {
    if (!report) return null;

    return (
        <div className="glass-card p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto border-t-4 border-t-primary shadow-sm bg-surface">
            <div className="flex justify-between items-start border-b border-border pb-8">
                <div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight text-text-primary">AGGREGATED HEALTH REPORT</h2>
                    <p className="text-text-secondary/70 font-mono text-[10px] uppercase tracking-widest">Patient ID: {report.patientId} | Serial: REC-2026-X</p>
                </div>
                <div className="text-right">
                    <p className="text-primary font-black tracking-tight italic">RecoverAI Intelligence v2.0</p>
                    <p className="text-text-secondary text-[10px] font-bold mt-1 uppercase">{report.generatedAt ? new Date(report.generatedAt).toLocaleString() : 'Just Now'}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full border-2 border-accent"></span> Quantitative Metrics
                    </h4>
                    <div className="space-y-4 bg-black/5 dark:bg-black/20 p-5 rounded-2xl border border-border shadow-inner">
                        <div className="flex justify-between border-b border-border pb-3">
                            <span className="text-text-secondary font-bold text-sm">Mean Heart Rate</span>
                            <span className="font-black text-text-primary">{report.metrics?.averageHeartRate || '--'} BPM</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-3">
                            <span className="text-text-secondary font-bold text-sm">Symptom diversity index</span>
                            <span className="font-black text-text-primary">{report.metrics?.symptomDiversity ?? '--'} Patterns</span>
                        </div>
                        <div className="flex justify-between pb-1">
                            <span className="text-text-secondary font-bold text-sm">Recovery confidence</span>
                            <span className="font-black text-primary">{report.metrics?.latestStabilityScore || '--'}%</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full border-2 border-danger"></span> Clinical Assertions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {(report.clinicalFlags || []).map((f, i) => (
                            <span key={i} className="bg-danger/10 text-danger px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-danger/20 shadow-sm">
                                {f}
                            </span>
                        ))}
                        {(!report.clinicalFlags || report.clinicalFlags.length === 0) && (
                            <span className="text-text-secondary/70 text-sm font-medium italic">No immediate assertions.</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-8 bg-primary/5 rounded-3xl border border-border space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full premium-bg-gradient"></div>
                <h4 className="font-black text-[10px] uppercase text-primary tracking-[0.2em]">Intelligence Summary</h4>
                <p className="text-lg font-medium text-text-primary leading-relaxed">
                    {report.summary || 'Awaiting synchronization point analysis...'}
                </p>
            </div>

            <div className="space-y-6">
                <h4 className="font-black text-[10px] uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full border-2 border-success"></span> Prescribed Trajectory
                </h4>
                <ul className="space-y-3 bg-black/5 dark:bg-black/20 p-6 rounded-2xl border border-border mt-3 shadow-inner">
                    {(report.lifestyleRecs || []).map((r, i) => (
                        <li key={i} className="flex items-start gap-3 text-text-primary text-sm font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shadow-sm"></div>
                            <span className="flex-1 leading-relaxed">{r}</span>
                        </li>
                    ))}
                    {(!report.lifestyleRecs || report.lifestyleRecs.length === 0) && (
                        <li className="text-text-secondary text-sm font-medium italic">Trajectory computation pending.</li>
                    )}
                </ul>
            </div>

            <button className="w-full text-white bg-text-primary hover:bg-text-secondary font-black py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group shadow-md dark:text-black">
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                TRANSMIT TO PRIMARY PHYSICIAN
            </button>
        </div>
    );
};

export default HealthReport;
