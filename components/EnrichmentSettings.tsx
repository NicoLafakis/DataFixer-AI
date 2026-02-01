
import React from 'react';

interface EnrichmentSettingsProps {
  headers: string[];
  selectedDomainColumn: string | null;
  columnsToEnrich: string[];
  onDomainSelect: (col: string) => void;
  onEnrichToggle: (col: string) => void;
  onStart: () => void;
}

const EnrichmentSettings: React.FC<EnrichmentSettingsProps> = ({
  headers,
  selectedDomainColumn,
  columnsToEnrich,
  onDomainSelect,
  onEnrichToggle,
  onStart
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Enrichment Configuration</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">1. Select Domain / URL Column</label>
        <p className="text-xs text-slate-500 mb-2">The column that contains the website domain used for research.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {headers.map(header => (
            <button
              key={header}
              onClick={() => onDomainSelect(header)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all truncate ${
                selectedDomainColumn === header
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {header}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">2. Select Target Columns to Enrich</label>
        <p className="text-xs text-slate-500 mb-2">The AI will attempt to fill blanks in these columns.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {headers.map(header => (
            <button
              key={header}
              disabled={selectedDomainColumn === header}
              onClick={() => onEnrichToggle(header)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all truncate flex items-center justify-between ${
                columnsToEnrich.includes(header)
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-green-200 opacity-80'
              } ${selectedDomainColumn === header ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <span className="truncate">{header}</span>
              {columnsToEnrich.includes(header) && <i className="fas fa-check text-xs ml-2"></i>}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <button
          onClick={onStart}
          disabled={!selectedDomainColumn || columnsToEnrich.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center space-x-2 ${
            selectedDomainColumn && columnsToEnrich.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <i className="fas fa-bolt"></i>
          <span>Start Enrichment Process</span>
        </button>
      </div>
    </div>
  );
};

export default EnrichmentSettings;
