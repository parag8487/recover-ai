import React, { useState } from 'react';
import { Brain, Activity, Send, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import useStore from '../../store/useStore';

const Intelligence = () => {
    const { user } = useStore();
    const [activeScenario, setActiveScenario] = useState(null);
    const [chatMessages, setChatMessages] = useState([
        { role: 'agent', text: 'Hello, I am your RecoverAI clinical companion. How can I assist with your recovery today?' }
    ]);
    const [inputText, setInputText] = useState('');

    const handleSimulate = async (scenario) => {
        try {
            const res = await axios.post('/api/intelligence/simulate', { patientId: user?.id || 'current-user', scenario });
            setActiveScenario(res.data.projection);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChat = async (e) => {
        e.preventDefault();
        if (!inputText) return;
        const newMessages = [...chatMessages, { role: 'user', text: inputText }];
        setChatMessages(newMessages);
        setInputText('');

        try {
            const res = await axios.post('/api/intelligence/chat', { message: inputText });
            setChatMessages([...newMessages, { role: 'agent', text: res.data.response, path: res.data.agentPath }]);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* AI Chat */}
            <div className="glass-card flex flex-col h-[700px] border border-border shadow-sm relative overflow-hidden bg-surface">
                <div className="absolute -left-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                            <Brain className="text-primary" size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-text-primary">Agent Consultation</h3>
                            <p className="text-[9px] text-primary font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Clinical Multi-Agent Active
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans text-sm relative z-10 scrollbar-hide">
                    {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-5 rounded-2xl shadow-sm relative ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-surface border border-border text-text-primary rounded-bl-sm'}`}>
                                {msg.role === 'agent' && (
                                    <div className="absolute -left-3 top-4 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm">
                                        <Brain size={12} className="text-primary" />
                                    </div>
                                )}
                                <p className="leading-relaxed font-medium">{msg.text}</p>
                                {msg.path && (
                                    <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={10} /> Clinical Reasoning Path
                                        </span>
                                        <span className="text-[11px] font-bold text-accent italic bg-accent/10 px-2 py-1 rounded inline-block w-fit border border-accent/20">
                                            {msg.path}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                </div>

                <form onSubmit={handleChat} className="p-6 border-t border-border bg-surface relative z-10">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Discuss symptoms or recovery progress..."
                            className="w-full bg-surface-raised relative border border-border rounded-xl py-4 pl-6 pr-16 text-text-primary outline-none transition-all placeholder:text-text-tertiary font-medium z-10 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                        />
                        <button type="submit" className="absolute right-2 top-2 bottom-2 px-4 bg-primary hover:bg-blue-600 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 z-20 font-bold">
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Simulation Engine */}
            <div className="glass-card flex flex-col h-[700px] border border-border shadow-sm relative overflow-hidden bg-surface">
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="p-8 border-b border-border relative z-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black flex items-center gap-3 text-text-primary">
                            <Activity className="text-accent" size={24} />
                            Predictive Twin
                        </h3>
                        <div className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent/20 shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                            Stable
                        </div>
                    </div>
                </div>

                <div className="p-8 pb-4 relative z-10">
                    <div className="grid grid-cols-1 gap-4 mb-2">
                        {[
                            { id: 'miss_medication_3days', name: 'Medication Non-Adherence', sub: 'Simulate 3 missed cycles', icon: <AlertTriangle size={16} />, color: 'text-warning border-warning/20 hover:border-warning/50 hover:bg-warning/5' },
                            { id: 'increased_activity', name: 'Aggressive Rehab', sub: 'Test impact of 2x activity', icon: <Activity size={16} />, color: 'text-accent border-accent/20 hover:border-accent/50 hover:bg-accent/5' },
                            { id: 'low_hydration', name: 'Critical Dehydration', sub: 'Model low fluid intake', icon: <AlertTriangle size={16} />, color: 'text-danger border-danger/20 hover:border-danger/50 hover:bg-danger/5' }
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleSimulate(s.id)}
                                className={`group relative overflow-hidden bg-surface-raised border border-border transition-all p-5 rounded-2xl text-left flex items-center justify-between ${activeScenario?.reasoning?.includes(s.name.split(' ')[0]) ? 'border-primary bg-primary/5 shadow-sm' : s.color
                                    }`}
                            >
                                <div>
                                    <span className="font-black text-sm text-text-primary block mb-1 group-hover:text-primary transition-colors">{s.name}</span>
                                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{s.sub}</span>
                                </div>
                                <div className={`aspect-square w-10 rounded-xl flex items-center justify-center bg-surface shadow-sm border border-border ${s.color.split(' ')[0]} group-hover:scale-110 transition-transform`}>
                                    {s.icon}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8 pt-4 flex-1 flex flex-col relative z-10">
                    {activeScenario ? (
                        <div className="flex-1 premium-bg-gradient rounded-3xl p-[1px] shadow-lg animate-in zoom-in-95 duration-500">
                            <div className="h-full w-full bg-surface rounded-[23px] p-8 flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <h4 className="font-black text-[10px] uppercase text-primary tracking-[0.3em]">Clinical Projection</h4>
                                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-white shadow-sm border ${activeScenario.riskLevel === 'High' ? 'bg-danger border-danger/50' : 'bg-warning border-warning/50'
                                        }`}>
                                        LEVEL: {activeScenario.riskLevel}
                                    </span>
                                </div>

                                <div className="space-y-10 flex-1 relative z-10">
                                    <div>
                                        <p className="text-[10px] text-text-secondary mb-2 font-black uppercase tracking-widest">NET RECOVERY DELAY</p>
                                        <p className={`text-6xl font-black tracking-tighter ${activeScenario.recoveryImpact.startsWith('-') ? 'text-danger' : 'text-success'}`}>
                                            {activeScenario.recoveryImpact}
                                        </p>
                                    </div>
                                    <div className="relative bg-surface border border-border p-6 rounded-2xl flex-1 shadow-sm">
                                        <p className="text-[10px] text-text-secondary mb-3 font-black uppercase tracking-widest">TWIN REASONING MATRIX</p>
                                        <p className="text-sm text-text-primary leading-relaxed font-medium pl-4 border-l-2 border-primary/50 relative">
                                            "{activeScenario.reasoning}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 border-2 border-dashed border-border/60 rounded-3xl flex flex-col items-center justify-center text-text-tertiary space-y-4 bg-transparent">
                            <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-sm text-text-tertiary group-hover:text-primary transition-colors">
                                <Brain className="text-text-secondary" size={32} />
                            </div>
                            <p className="tracking-widest uppercase text-[10px] font-black text-text-secondary">Select trajectory to initialize simulation</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Intelligence;
