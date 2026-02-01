
import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import EnrichmentSettings from './components/EnrichmentSettings';
import CleaningPanel from './components/CleaningPanel';
import DataTable from './components/DataTable';
import EnrichmentDashboard from './components/EnrichmentDashboard';
import { GeminiService } from './services/geminiService';
import { CSVRow, AppState, CleaningRules } from './types';

const INITIAL_STATE: AppState = {
  headers: [],
  rows: [],
  selectedDomainColumn: null,
  columnsToEnrich: [],
  cleaningRules: {
    removeDuplicates: true,
    validateEmails: true,
    validatePhones: true,
    standardizeUrls: true,
  },
  enrichmentStatus: { total: 0, completed: 0, failed: 0, isProcessing: false },
  isFinished: false,
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const geminiService = new GeminiService();

  const handleDataLoaded = (headers: string[], rows: CSVRow[]) => {
    // Initialize all rows with 'pending' status
    const rowsWithStatus = rows.map(row => ({ ...row, _status: 'pending' as const }));
    setState(prev => ({
      ...prev,
      headers,
      rows: rowsWithStatus,
      enrichmentStatus: { ...prev.enrichmentStatus, total: rows.length, completed: 0, failed: 0 }
    }));
  };

  const handleDomainSelect = (col: string) => {
    setState(prev => ({ ...prev, selectedDomainColumn: col }));
  };

  const handleEnrichToggle = (col: string) => {
    setState(prev => {
      const columns = [...prev.columnsToEnrich];
      const index = columns.indexOf(col);
      if (index > -1) {
        columns.splice(index, 1);
      } else {
        columns.push(col);
      }
      return { ...prev, columnsToEnrich: columns };
    });
  };

  const toggleCleaningRule = (rule: keyof CleaningRules) => {
    setState(prev => ({
      ...prev,
      cleaningRules: { ...prev.cleaningRules, [rule]: !prev.cleaningRules[rule] }
    }));
  };

  const startEnrichment = async () => {
    if (!state.selectedDomainColumn || state.columnsToEnrich.length === 0) return;

    setState(prev => ({
      ...prev,
      enrichmentStatus: { ...prev.enrichmentStatus, isProcessing: true }
    }));

    let rowsToProcess = [...state.rows];

    // 1. Initial Cleaning: Deduplication
    if (state.cleaningRules.removeDuplicates) {
      const seen = new Set<string>();
      rowsToProcess = rowsToProcess.filter(row => {
        const domain = (row[state.selectedDomainColumn!] as string || '').toLowerCase().trim();
        if (!domain) return true; // Keep empty domains
        if (seen.has(domain)) return false;
        seen.add(domain);
        return true;
      });
    }

    // 2. Initial Cleaning: URL Standardization
    if (state.cleaningRules.standardizeUrls) {
      rowsToProcess = rowsToProcess.map(row => {
        let domain = row[state.selectedDomainColumn!] as string || '';
        if (domain && !domain.startsWith('http')) {
          domain = 'https://' + domain.replace(/^www\./, '');
        }
        return { ...row, [state.selectedDomainColumn!]: domain, _status: 'pending' as const };
      });
    }

    setState(prev => ({
      ...prev,
      rows: rowsToProcess,
      enrichmentStatus: { ...prev.enrichmentStatus, total: rowsToProcess.length, completed: 0, failed: 0 }
    }));

    let completedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < rowsToProcess.length; i++) {
      const row = rowsToProcess[i];
      const domain = row[state.selectedDomainColumn!] as string;

      // Update current row to 'processing'
      rowsToProcess[i] = { ...row, _status: 'processing' };
      setState(prev => ({ ...prev, rows: [...rowsToProcess] }));

      if (!domain) {
        completedCount++;
        rowsToProcess[i] = { ...rowsToProcess[i], _status: 'completed' };
        setState(prev => ({
          ...prev,
          rows: [...rowsToProcess],
          enrichmentStatus: { ...prev.enrichmentStatus, completed: completedCount }
        }));
        continue;
      }

      try {
        const { data, sources } = await geminiService.enrichAndCleanRow(
          domain, 
          state.columnsToEnrich, 
          row,
          { 
            validateEmails: state.cleaningRules.validateEmails, 
            validatePhones: state.cleaningRules.validatePhones 
          }
        );
        
        // Store enriched data along with grounding sources for attribution
        rowsToProcess[i] = { ...rowsToProcess[i], ...data, _sources: sources, _status: 'completed' };
        completedCount++;

        setState(prev => ({
          ...prev,
          rows: [...rowsToProcess],
          enrichmentStatus: { ...prev.enrichmentStatus, completed: completedCount }
        }));
      } catch (error) {
        console.error(`Row ${i} failed:`, error);
        failedCount++;
        rowsToProcess[i] = { ...rowsToProcess[i], _status: 'failed' };
        setState(prev => ({
          ...prev,
          rows: [...rowsToProcess],
          enrichmentStatus: { ...prev.enrichmentStatus, failed: failedCount }
        }));
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setState(prev => ({
      ...prev,
      enrichmentStatus: { ...prev.enrichmentStatus, isProcessing: false },
      isFinished: true
    }));
  };

  const handleDownload = () => {
    const csvContent = [
      state.headers.join(','),
      ...state.rows.map(row => 
        state.headers.map(header => `"${(row[header] as string || '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `datafixer_cleaned_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {state.headers.length === 0 ? (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <FileUpload onDataLoaded={handleDataLoaded} />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-blue-600 mb-2"><i className="fas fa-search text-2xl"></i></div>
                <h4 className="font-semibold text-slate-800">Domain Research</h4>
                <p className="text-[11px] text-slate-500">Gemini uses Google Search grounding for real-time company profiles.</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-emerald-600 mb-2"><i className="fas fa-broom text-2xl"></i></div>
                <h4 className="font-semibold text-slate-800">Deep Cleaning</h4>
                <p className="text-[11px] text-slate-500">Format emails, normalize phone numbers, and remove duplicates.</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-indigo-600 mb-2"><i className="fas fa-file-csv text-2xl"></i></div>
                <h4 className="font-semibold text-slate-800">Clean CSV Export</h4>
                <p className="text-[11px] text-slate-500">Get your fixed dataset back in a ready-to-use spreadsheet format.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {(state.enrichmentStatus.isProcessing || state.isFinished) ? (
              <EnrichmentDashboard 
                status={state.enrichmentStatus} 
                isFinished={state.isFinished}
                onDownload={handleDownload}
                onReset={handleReset}
              />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <EnrichmentSettings 
                  headers={state.headers}
                  selectedDomainColumn={state.selectedDomainColumn}
                  columnsToEnrich={state.columnsToEnrich}
                  onDomainSelect={handleDomainSelect}
                  onEnrichToggle={handleEnrichToggle}
                  onStart={startEnrichment}
                />
                <CleaningPanel 
                  rules={state.cleaningRules}
                  onToggle={toggleCleaningRule}
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <i className="fas fa-table text-slate-400"></i>
                  <span>Live Preview</span>
                  {state.isFinished && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Cleaned</span>}
                </h2>
                <div className="flex items-center space-x-4 text-xs">
                   <div className="flex items-center space-x-1 text-slate-500">
                     <div className="w-2 h-2 rounded-full bg-blue-100 border border-blue-400"></div>
                     <span>AI Fixed</span>
                   </div>
                   <div className="flex items-center space-x-1 text-slate-500">
                     <div className="w-2 h-2 rounded-full border-b-2 border-red-300"></div>
                     <span>Check Format</span>
                   </div>
                </div>
              </div>
              <DataTable 
                headers={state.headers} 
                rows={state.rows} 
                columnsToEnrich={state.columnsToEnrich} 
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 text-center text-slate-400 text-xs">
        <div className="flex justify-center space-x-4 mb-2">
          <span className="hover:text-blue-500 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-blue-500 cursor-pointer">Terms of Service</span>
          <span className="hover:text-blue-500 cursor-pointer">API Status</span>
        </div>
        <p>&copy; {new Date().getFullYear()} DataFixer AI. Intelligence-driven data maintenance.</p>
      </footer>
    </div>
  );
};

export default App;
