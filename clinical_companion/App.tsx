import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MedicalLog, QueryResponse, UserProfile, MissedDose, QualityAssessment, AuditEntry, GeminiExtractionResponse, HandoverSummary } from './types';
import {
  processVoiceCommand,
  processTextLog,
  queryMedicalLogs,
  synthesizeSpeech,
  decodeBase64Audio,
  decodeAudioData,
  assessLogQuality,
  generateAuditEntry,
  generateClinicalHandover
} from './services/geminiService';
import Header from './components/Header';
import LogList from './components/LogList';
import VoiceAction from './components/VoiceAction';
import Stats from './components/Stats';
import QueryResults from './components/QueryResults';
import FilterPanel from './components/FilterPanel';
import ProfileSwitcher from './components/ProfileSwitcher';
import DoctorHandover from './components/DoctorHandover';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PROFILE: UserProfile = {
  id: 'default',
  name: 'Myself',
  color: 'bg-primary'
};

const App: React.FC = () => {
  const [logs, setLogs] = useState<MedicalLog[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([DEFAULT_PROFILE]);
  const [activeProfileId, setActiveProfileId] = useState<string>(DEFAULT_PROFILE.id);
  const [isHospitalMode, setIsHospitalMode] = useState(false);
  const [currentStayId, setCurrentStayId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clarification, setClarification] = useState<string | null>(null);
  const [safetyNotice, setSafetyNotice] = useState<string | null>(null);

  // Handover State
  const [handoverSummary, setHandoverSummary] = useState<HandoverSummary | null>(null);
  const [isGeneratingHandover, setIsGeneratingHandover] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterContext, setFilterContext] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Chat Log Input
  const [chatInput, setChatInput] = useState('');

  // Speech rate state
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('Voice Clinical Log_speech_rate');
    return saved ? parseFloat(saved) : 1.0;
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  // Search state
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load Initial State
  useEffect(() => {
    const savedLogs = localStorage.getItem('Voice Clinical Log_data_v2');
    const savedProfiles = localStorage.getItem('Voice Clinical Log_profiles');
    const savedActiveId = localStorage.getItem('Voice Clinical Log_active_id');
    const savedHospitalMode = localStorage.getItem('Voice Clinical Log_hospital_mode');
    const savedStayId = localStorage.getItem('Voice Clinical Log_stay_id');

    if (savedLogs) try { setLogs(JSON.parse(savedLogs)); } catch (e) { }
    if (savedProfiles) try { setProfiles(JSON.parse(savedProfiles)); } catch (e) { }
    if (savedActiveId) setActiveProfileId(savedActiveId);
    if (savedHospitalMode) setIsHospitalMode(savedHospitalMode === 'true');
    if (savedStayId) setCurrentStayId(savedStayId);
  }, []);

  // Save State
  useEffect(() => {
    localStorage.setItem('Voice Clinical Log_data_v2', JSON.stringify(logs));
    localStorage.setItem('Voice Clinical Log_profiles', JSON.stringify(profiles));
    localStorage.setItem('Voice Clinical Log_active_id', activeProfileId);
    localStorage.setItem('Voice Clinical Log_hospital_mode', isHospitalMode.toString());
    localStorage.setItem('Voice Clinical Log_stay_id', currentStayId || '');
  }, [logs, profiles, activeProfileId, isHospitalMode, currentStayId]);

  useEffect(() => {
    localStorage.setItem('Voice Clinical Log_speech_rate', speechRate.toString());
  }, [speechRate]);

  const activeProfile = useMemo(() =>
    profiles.find(p => p.id === activeProfileId) || profiles[0]
    , [profiles, activeProfileId]);

  // Scoped Logs for current profile
  const profileScopedLogs = useMemo(() =>
    logs.filter(l => l.profileId === activeProfileId)
    , [logs, activeProfileId]);

  // Missed Dose Detection Logic
  const missedDoses = useMemo(() => {
    const missed: MissedDose[] = [];
    const now = new Date();

    // Group by medication name
    const medGroups: { [name: string]: MedicalLog[] } = {};
    profileScopedLogs.forEach(log => {
      if (!log.name || log.type === 'observation') return;
      const name = log.name.toLowerCase();
      if (!medGroups[name]) medGroups[name] = [];
      medGroups[name].push(log);
    });

    Object.keys(medGroups).forEach(name => {
      const logsForMed = medGroups[name].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const latestLog = logsForMed[0];

      if (latestLog.reminder?.needs_reminder && latestLog.reminder_timestamp) {
        const expectedTime = new Date(latestLog.reminder_timestamp);
        // If the expected time is more than 30 mins in the past and no newer log exists
        if (now.getTime() > expectedTime.getTime() + (30 * 60 * 1000)) {
          missed.push({
            medicationName: latestLog.name!,
            expectedTimestamp: latestLog.reminder_timestamp,
            dosage: latestLog.dosage
          });
        }
      }
    });

    return missed;
  }, [profileScopedLogs]);

  // Filtering Logic (applied to scoped logs)
  const filteredLogs = useMemo(() => {
    return profileScopedLogs.filter(log => {
      if (filterType && log.type !== filterType) return false;
      if (filterContext && log.context !== filterContext) return false;
      const logDate = new Date(log.timestamp);
      if (startDate && logDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }
      return true;
    });
  }, [profileScopedLogs, filterType, filterContext, startDate, endDate]);

  const filteredSearchResults = useMemo(() => {
    if (!queryResult) return null;
    return {
      ...queryResult,
      results: queryResult.results.filter(item => {
        if (filterType && item.type !== filterType) return false;
        if (filterContext && item.context !== filterContext) return false;
        if (startDate || endDate) {
          const itemDate = new Date(item.date);
          if (isNaN(itemDate.getTime())) return true;
          if (startDate && itemDate < new Date(startDate)) return false;
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (itemDate > end) return false;
          }
        }
        return true;
      })
    };
  }, [queryResult, filterType, filterContext, startDate, endDate]);

  const playFeedback = async (text: string) => {
    try {
      setIsSpeaking(true);
      const audioBase64 = await synthesizeSpeech(text);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioData = decodeBase64Audio(audioBase64);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = speechRate;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsSpeaking(false);
    }
  };

  const handlePlayLog = async (log: MedicalLog | any) => {
    let text = "";
    if (log.type === 'observation') {
      text = `Caregiver observation for ${activeProfile.name}: ${log.name}. Recorded at ${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    } else {
      const dosageText = log.dosage?.amount ? `${log.dosage.amount} ${log.dosage.unit || ''}` : "unknown dosage";
      const timingText = log.time_taken || log.frequency || "unknown time";
      text = `${log.name}, ${dosageText}, recorded at ${timingText} for ${activeProfile.name}.`;
    }
    await playFeedback(text);
  };

  const handleCreateHandover = async () => {
    if (profileScopedLogs.length === 0) {
      setError("No medical history available to summarize for the doctor.");
      return;
    }
    setIsGeneratingHandover(true);
    setError(null);
    try {
      const summary = await generateClinicalHandover(activeProfile.name, profileScopedLogs);
      setHandoverSummary(summary);
    } catch (err: any) {
      setError("Failed to generate clinical summary.");
    } finally {
      setIsGeneratingHandover(false);
    }
  };

  const calculateReminderTimestamp = (reminderTimeStr: string | null): string | undefined => {
    if (!reminderTimeStr) return undefined;

    const now = new Date();
    // Try simple "HH:mm"
    const timeMatch = reminderTimeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const mins = parseInt(timeMatch[2]);
      const target = new Date();
      target.setHours(hours, mins, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1); // Tomorrow
      }
      return target.toISOString();
    }

    // Try "in X hours"
    const hoursMatch = reminderTimeStr.match(/in (\d+)\s*hours?/i);
    if (hoursMatch) {
      const h = parseInt(hoursMatch[1]);
      return new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
    }

    return undefined;
  };

  const handleExtractedLog = useCallback(async (result: GeminiExtractionResponse, transcript: string, source: "voice" | "text") => {
    if (result.hospital_mode_command) {
      if (result.hospital_mode_command === 'start') {
        setIsHospitalMode(true);
        setCurrentStayId(uuidv4());
        await playFeedback(`Hospital Mode activated for ${activeProfile.name}.`);
      } else {
        setIsHospitalMode(false);
        setCurrentStayId(null);
        await playFeedback("Hospital Mode deactivated.");
      }
      return;
    }

    if (result.switch_profile_to) {
      const targetProfile = profiles.find(p => p.name.toLowerCase() === result.switch_profile_to!.toLowerCase());
      if (targetProfile) {
        setActiveProfileId(targetProfile.id);
        await playFeedback(`Switched to ${targetProfile.name}'s profile.`);
        return;
      } else {
        setError(`I couldn't find a profile for "${result.switch_profile_to}".`);
      }
    }

    if (result.safety_disclaimer) {
      setSafetyNotice(result.safety_disclaimer);
      await playFeedback(result.safety_disclaimer);
      return;
    }

    if (!result.validation.is_complete && result.validation.follow_up_question) {
      setClarification(result.validation.follow_up_question);
    }

    if (result.name) {
      const latestLog = profileScopedLogs[0];
      let quality: QualityAssessment | undefined;
      let auditTrail: AuditEntry[] = [];

      try {
        quality = await assessLogQuality(result);
      } catch (qErr) {
        console.error("Quality assessment failed", qErr);
      }

      try {
        const auditEntry = await generateAuditEntry(result, transcript, latestLog || null, source);
        auditTrail.push(auditEntry);
      } catch (aErr) {
        auditTrail.push({
          timestamp: new Date().toISOString(),
          action: "created",
          source: source,
          details: "Created record."
        });
      }

      const reminderTimestamp = calculateReminderTimestamp(result.reminder?.time || null);
      const newLog: MedicalLog = {
        ...result,
        id: uuidv4(),
        profileId: activeProfileId,
        timestamp: new Date().toISOString(),
        originalText: transcript,
        stayId: isHospitalMode ? currentStayId || undefined : undefined,
        reminder_timestamp: reminderTimestamp,
        quality: quality,
        audit_trail: auditTrail
      };
      setLogs(prev => [newLog, ...prev]);
    }
    setQueryResult(null);
    setIsSearching(false);
    if (result.confirmation_message) {
      const personalizedConfirmation = result.confirmation_message
        .replace(/recorded/i, `Recorded for ${activeProfile.name}`)
        .replace(/done/i, `Done for ${activeProfile.name}`);
      await playFeedback(personalizedConfirmation);
    }
  }, [profileScopedLogs, profiles, activeProfileId, activeProfile.name, isHospitalMode, currentStayId]);

  const handleVoiceCommand = useCallback(async (audioBase64: string, transcript: string) => {
    setIsProcessing(true);
    setError(null);
    setClarification(null);
    setSafetyNotice(null);

    try {
      const isQuestion = transcript.toLowerCase().match(/\b(when|what|how|should|can|is)\b/i);

      if (isQuestion && profileScopedLogs.length > 0) {
        const result = await queryMedicalLogs(transcript, profileScopedLogs);
        if (result.safety_disclaimer) {
          setSafetyNotice(result.safety_disclaimer);
          await playFeedback(result.safety_disclaimer);
        } else {
          setQueryResult(result);
          setIsSearching(true);
          const count = result.results.length;
          await playFeedback(`I found ${count === 0 ? 'no' : count} matching records for ${activeProfile.name}.`);
        }
      } else {
        const latestLog = profileScopedLogs[0];
        const context = latestLog ? { id: latestLog.id, name: latestLog.name || 'Unknown', type: latestLog.type || 'medication' } : null;
        const result = await processVoiceCommand(audioBase64, transcript, isHospitalMode, context);
        await handleExtractedLog(result, transcript, "voice");
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your voice input.');
    } finally {
      setIsProcessing(false);
    }
  }, [profileScopedLogs, activeProfile.name, handleExtractedLog, isHospitalMode]);

  const handleChatSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const input = chatInput.trim();
    setChatInput('');
    setIsProcessing(true);
    setError(null);
    setClarification(null);
    setSafetyNotice(null);

    try {
      const isQuestion = input.toLowerCase().match(/\b(when|what|how|should|can|is)\b/i);

      if (isQuestion && profileScopedLogs.length > 0) {
        const result = await queryMedicalLogs(input, profileScopedLogs);
        if (result.safety_disclaimer) {
          setSafetyNotice(result.safety_disclaimer);
        } else {
          setQueryResult(result);
          setIsSearching(true);
        }
      } else {
        const latestLog = profileScopedLogs[0];
        const context = latestLog ? { id: latestLog.id, name: latestLog.name || 'Unknown', type: latestLog.type || 'medication' } : null;
        const result = await processTextLog(input, isHospitalMode, context);
        await handleExtractedLog(result, input, "text");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process chat input.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setIsProcessing(true);
    setError(null);
    setSafetyNotice(null);
    try {
      const result = await queryMedicalLogs(queryInput, profileScopedLogs);
      if (result.safety_disclaimer) {
        setSafetyNotice(result.safety_disclaimer);
      } else {
        setQueryResult(result);
        setIsSearching(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to query logs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addProfile = (name: string, color: string) => {
    const newProfile: UserProfile = { id: uuidv4(), name, color };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const updateProfile = (id: string, name: string, color: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, name, color } : p));
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    if (window.confirm(`Are you sure you want to delete ${profiles.find(p => p.id === id)?.name}'s profile? All their records will be lost.`)) {
      setProfiles(prev => prev.filter(p => p.id !== id));
      setLogs(prev => prev.filter(l => l.profileId !== id));
      if (activeProfileId === id) {
        setActiveProfileId(profiles.find(p => p.id !== id)?.id || '');
      }
    }
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const clearFilters = () => {
    setFilterType(null);
    setFilterContext(null);
    setStartDate('');
    setEndDate('');
  };

  const clearSearch = () => {
    setQueryResult(null);
    setIsSearching(false);
    setQueryInput('');
    setSafetyNotice(null);
  };

  const toggleHospitalMode = () => {
    if (!isHospitalMode) {
      setCurrentStayId(uuidv4());
    } else {
      setCurrentStayId(null);
    }
    setIsHospitalMode(!isHospitalMode);
  };

  const accentColorClass = activeProfile.color.replace('bg-', 'text-');

  return (
    <div className={`min-h-screen pb-48 transition-colors duration-300 bg-background font-sans`}>
      <Header speechRate={speechRate} onRateChange={setSpeechRate} isHospitalMode={isHospitalMode} />

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6 md:space-y-8">
        {missedDoses.length > 0 && !isSearching && (
          <div className="bg-warning/8 dark:bg-warning/10 border border-warning/25 border-l-4 border-l-warning p-4 rounded-2xl animate-in fade-in slide-in-from-left-3 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <i className="fa-solid fa-triangle-exclamation text-warning text-sm"></i>
              <h4 className="text-[10px] font-bold text-warning uppercase tracking-widest">Missed Awareness</h4>
            </div>
            <div className="space-y-2">
              {missedDoses.map((dose, idx) => (
                <div key={idx} className="flex justify-between items-center bg-surface/50 px-4 py-2.5 rounded-xl border border-warning/20 shadow-sm transition-all hover:bg-surface/80">
                  <span className="text-sm font-bold text-text-primary truncate mr-2">{dose.medicationName}</span>
                  <div className="flex items-center gap-2">
                    <i className="fa-regular fa-clock text-[10px] text-warning/70" />
                    <span className="text-[11px] text-warning font-black whitespace-nowrap">{new Date(dose.expectedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isHospitalMode && (
          <div className="bg-surface border-b-4 border-b-primary rounded-2xl shadow-sm p-4 md:p-5 flex items-center justify-between border border-border animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner flex-shrink-0 border border-primary/20">
                <i className="fa-solid fa-hospital-user text-lg md:text-xl"></i>
              </div>
              <div className="overflow-hidden">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Active Monitoring</h3>
                <p className="text-text-primary font-black text-xs md:text-lg truncate tracking-tight">Stay: {activeProfile.name}</p>
              </div>
            </div>
            <button
              onClick={toggleHospitalMode}
              className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold hover:bg-primary/20 transition-colors flex-shrink-0 shadow-sm"
            >
              End Stay
            </button>
          </div>
        )}

        <section className="bg-surface rounded-2xl border border-border p-4 md:p-6 transition-all">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-5">
            <h2 className="text-base md:text-lg font-bold text-text-primary flex items-center gap-2">
              <i className={`fa-solid fa-people-roof ${accentColorClass} text-sm`}></i>
              Care Dashboard
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateHandover}
                disabled={isGeneratingHandover}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border border-border bg-surface-raised text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                {isGeneratingHandover ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-stethoscope"></i>}
                Handover
              </button>
              <button
                onClick={toggleHospitalMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${isHospitalMode ? 'bg-primary text-white border-primary shadow-sm' : 'text-text-secondary border-border hover:border-primary/40 hover:text-text-primary'}`}
              >
                <i className="fa-solid fa-square-h"></i>
                {isHospitalMode ? 'Exit Hospital' : 'Hospital Mode'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <ProfileSwitcher
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSwitch={setActiveProfileId}
              onAdd={addProfile}
              onUpdate={updateProfile}
              onDelete={deleteProfile}
            />
            <div className="pt-6 border-t border-border mt-6">
              <Stats logs={profileScopedLogs} activeColor={activeProfile.color} missedCount={missedDoses.length} />
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full flex-1">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={`Search history...`}
                className={`w-full bg-surface border border-border rounded-2xl py-3.5 md:py-4 pl-10 md:pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all text-sm text-text-primary placeholder:text-text-secondary/50 ${activeProfile.color.replace('bg-', 'focus:ring-').replace('bg-', 'focus:border-')}`}
                onKeyDown={(e) => e.key === 'Enter' && handleTextQuery(e as any)}
              />
              <i className={`fa-solid fa-magnifying-glass absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-text-secondary/70 text-sm`}></i>
              {(queryInput || isSearching) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-2 transition-colors"
                >
                  <i className="fa-solid fa-circle-xmark text-lg"></i>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3.5 md:p-4 rounded-2xl w-full md:w-auto flex items-center justify-center border transition-all shadow-sm ${showFilters ? `${activeProfile.color} text-white border-transparent` : 'bg-surface text-text-secondary border-border hover:border-primary/50'}`}
            >
              <i className="fa-solid fa-sliders mr-2 md:mr-0"></i>
              <span className="md:hidden font-bold text-sm">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <FilterPanel
                filterType={filterType} setFilterType={setFilterType}
                filterContext={filterContext} setFilterContext={setFilterContext}
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
                onClear={clearFilters}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
            <i className="fa-solid fa-triangle-exclamation mt-1"></i>
            <span className="flex-1 font-bold text-sm">{error}</span>
            <button onClick={() => setError(null)} className="hover:bg-danger/20 rounded-full p-1 transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        {safetyNotice && (
          <div className="bg-surface border border-warning/30 text-text-primary p-5 rounded-2xl shadow-lg flex items-start gap-4 animate-in fade-in zoom-in duration-300 z-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-warning/20 blur-2xl"></div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 border border-warning/30">
              <i className="fa-solid fa-user-doctor text-warning text-sm md:text-base"></i>
            </div>
            <div className="flex-1 pt-0.5 relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-warning mb-1">Safety Notice</h4>
              <p className="text-sm md:text-base font-medium leading-snug">{safetyNotice}</p>
            </div>
            <button onClick={() => setSafetyNotice(null)} className="hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors self-start relative z-10">
              <i className="fa-solid fa-xmark text-text-secondary"></i>
            </button>
          </div>
        )}

        {isSearching && filteredSearchResults ? (
          <QueryResults result={filteredSearchResults} onExit={clearSearch} onPlay={handlePlayLog} />
        ) : (
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-base md:text-xl font-bold text-text-primary">
                Recent Log
              </h2>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${activeProfile.color}`}>
                <span className="uppercase tracking-widest">{filteredLogs.length} Records</span>
              </div>
            </div>
            <LogList logs={filteredLogs} onDelete={deleteLog} onPlay={handlePlayLog} activeColor={activeProfile.color} allLogs={logs} />
          </section>
        )}
      </main>

      {/* Handover Modal */}
      {handoverSummary && (
        <DoctorHandover summary={handoverSummary} onClose={() => setHandoverSummary(null)} />
      )}

      {/* Bottom Action Area - Sticky Responsive */}
      <div className="fixed bottom-0 left-0 right-0 p-3 md:p-8 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-40">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          {/* Active mode indicator */}
          <div className="flex justify-center mb-3">
            <div className={`px-3 py-1.5 rounded-full text-[9px] font-bold flex items-center gap-1.5 uppercase tracking-wider ${isHospitalMode ? 'bg-primary/10 text-primary border border-primary/20' : `${activeProfile.color} text-white`}`}>
              {isHospitalMode ? <i className="fa-solid fa-house-medical-pulse text-[9px]"></i> : <i className="fa-solid fa-microphone-lines text-[9px]"></i>}
              {isHospitalMode ? 'Hospital Mode — Active' : activeProfile.name}
            </div>
          </div>

          {/* Chat input */}
          <form onSubmit={handleChatSubmission}>
            <div className={`bg-surface/95 backdrop-blur-2xl rounded-2xl shadow-lg border transition-all p-1.5 flex items-center gap-1 ${isProcessing ? 'border-primary/40 opacity-80' : 'border-border focus-within:border-primary/50 focus-within:shadow-ring'}`}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isProcessing ? 'Processing...' : 'Log medication, symptom, or consult...'}
                className="flex-1 bg-transparent border-none focus:ring-0 px-3.5 py-2.5 text-sm text-text-primary font-medium placeholder:text-text-tertiary outline-none"
                disabled={isProcessing}
              />

              {chatInput.trim() ? (
                <button
                  type="submit"
                  className={`${activeProfile.color} w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm hover:brightness-110 active:scale-95 transition-all`}
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              ) : (
                <div>
                  <VoiceAction
                    onVoiceCapture={handleVoiceCommand}
                    isProcessing={isProcessing || isSpeaking}
                    activeColor={isHospitalMode ? 'bg-primary' : activeProfile.color}
                  />
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
