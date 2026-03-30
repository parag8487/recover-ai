import React, { useState } from 'react';
import { Send } from 'lucide-react';
import useStore from '../../store/useStore';

const VitalsLog = () => {
    const { addLog } = useStore();
    const [newLog, setNewLog] = useState({ hr: 72, bp: '120/80', spO2: 98, symptoms: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleAddLog = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await addLog({
            vitals: { hr: parseInt(newLog.hr), bp: newLog.bp, spO2: parseInt(newLog.spO2) },
            symptoms: newLog.symptoms.split(',').map(s => s.trim()).filter(s => s)
        });
        setIsSubmitting(false);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2500);
    };

    return (
        <div className="glass-card p-7 relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="absolute -left-24 -top-24 w-56 h-56 bg-accent/5 dark:bg-accent/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="mb-6">
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Post-Discharge Monitoring</p>
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">Log Daily Vitals</h2>
                </div>

                {submitted && (
                    <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-success/8 dark:bg-success/10 border border-success/20 rounded-xl text-success font-semibold text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <i className="fa-solid fa-circle-check" />
                        Vitals synchronized with your digital twin!
                    </div>
                )}

                <form onSubmit={handleAddLog} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Heart Rate</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={newLog.hr}
                                    onChange={(e) => setNewLog({ ...newLog, hr: e.target.value })}
                                    className="input-field text-xl font-bold pr-14"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-tertiary">BPM</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Blood Pressure</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newLog.bp}
                                    onChange={(e) => setNewLog({ ...newLog, bp: e.target.value })}
                                    className="input-field text-xl font-bold pr-16"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-tertiary">mmHg</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Oxygen Saturation</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={newLog.spO2}
                                    onChange={(e) => setNewLog({ ...newLog, spO2: e.target.value })}
                                    className="input-field text-xl font-bold pr-10"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-tertiary">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Current Symptoms</label>
                        <textarea
                            value={newLog.symptoms}
                            onChange={(e) => setNewLog({ ...newLog, symptoms: e.target.value })}
                            className="input-field resize-none h-28 text-sm leading-relaxed"
                            placeholder="Describe symptoms separated by commas (e.g. headache, fatigue, mild nausea)..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full premium-bg-gradient py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={15} className={isSubmitting ? 'animate-pulse' : ''} />
                        {isSubmitting ? 'Synchronizing...' : 'Synchronize with Digital Twin'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VitalsLog;
