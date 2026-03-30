import React, { useState } from 'react';

interface HeaderProps {
  speechRate: number;
  onRateChange: (rate: number) => void;
  isHospitalMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ speechRate, onRateChange, isHospitalMode = false }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${isHospitalMode
        ? 'bg-primary/8 border-primary/20 backdrop-blur-2xl'
        : 'bg-surface/80 backdrop-blur-2xl border-border'
        }`}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isHospitalMode ? 'bg-primary' : 'bg-primary/10 border border-primary/20'
            }`}>
            <i className={`fa-solid fa-notes-medical text-sm ${isHospitalMode ? 'text-white' : 'text-primary'}`} />
          </div>
          <h1 className="text-base font-bold text-text-primary tracking-tight">
            Clinical Companion
          </h1>
          {isHospitalMode && (
            <span className="bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse shadow-sm tracking-wide">
              Hospital Mode
            </span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {!isHospitalMode && (
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-text-secondary bg-surface-raised border border-border px-3 py-1.5 rounded-full">
              <i className="fa-solid fa-shield-halved text-primary text-[10px]" />
              <span className="font-medium">HIPAA-inspired</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showSettings
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary border border-transparent'
                }`}
              title="Voice Settings"
            >
              <i className="fa-solid fa-sliders text-sm" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-3 w-64 bg-surface rounded-2xl shadow-2xl border border-border p-5 animate-in fade-in zoom-in-95 duration-200 z-50 origin-top-right">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/60">
                  <h3 className="text-sm font-bold text-text-primary">Voice Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-text-secondary hover:text-danger hover:bg-danger/8 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Speech Rate
                    </label>
                    <span className="text-[10px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded-full border border-primary/20">
                      {speechRate.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => onRateChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between mt-1.5 text-[9px] text-text-tertiary font-semibold">
                    <span>0.5×</span>
                    <span>1.0×</span>
                    <span>2.0×</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className={`py-1 px-4 text-center transition-colors duration-300 ${isHospitalMode
        ? 'bg-primary/10 border-t border-primary/15 text-primary'
        : 'bg-surface-raised border-t border-border text-text-tertiary'
        }`}>
        <p className="text-[9px] font-bold uppercase tracking-widest">
          {isHospitalMode ? '⚡ Hospital Sync Enabled · Pro Data Mode' : 'Clinical Companion Ready · AI-Powered Logging'}
        </p>
      </div>
    </header>
  );
};

export default Header;
