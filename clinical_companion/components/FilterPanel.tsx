
import React from 'react';

interface FilterPanelProps {
  filterType: string | null;
  setFilterType: (type: string | null) => void;
  filterContext: string | null;
  setFilterContext: (context: string | null) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onClear: () => void;
}

const types = ['medication', 'vitamin', 'treatment'];
const contexts = ['home', 'hospital', 'clinic', 'emergency'];

const contextColors: Record<string, string> = {
  home: 'bg-success/10 text-success border-success/20',
  hospital: 'bg-primary/10 text-primary border-primary/20',
  clinic: 'bg-accent/10 text-accent border-accent/20',
  emergency: 'bg-danger/10 text-danger border-danger/20',
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterType, setFilterType,
  filterContext, setFilterContext,
  startDate, setStartDate,
  endDate, setEndDate,
  onClear
}) => {
  const isAnyFilterActive = filterType || filterContext || startDate || endDate;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-filter text-primary" />
          Filter History
        </h3>
        {isAnyFilterActive && (
          <button
            onClick={onClear}
            className="text-[10px] font-bold text-primary bg-primary/8 hover:bg-primary/15 px-3 py-1 rounded-full transition-colors border border-primary/20"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Type Filter */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Log Type</label>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(filterType === t ? null : t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${filterType === t
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-transparent text-text-secondary border-border hover:border-primary/40 hover:text-text-primary'
                  }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Context Filter */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Context</label>
          <div className="flex flex-wrap gap-2">
            {contexts.map(c => (
              <button
                key={c}
                onClick={() => setFilterContext(filterContext === c ? null : c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${filterContext === c
                    ? contextColors[c]
                    : 'bg-transparent text-text-secondary border-border hover:border-text-tertiary hover:text-text-primary'
                  }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Date Range</label>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:flex-1 bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
            <span className="text-text-tertiary hidden sm:inline text-xs">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:flex-1 bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
