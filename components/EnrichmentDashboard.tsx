
import React from 'react';
import { EnrichmentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EnrichmentDashboardProps {
  status: EnrichmentStatus;
  isFinished: boolean;
  onDownload: () => void;
  onReset: () => void;
}

const EnrichmentDashboard: React.FC<EnrichmentDashboardProps> = ({ status, isFinished, onDownload, onReset }) => {
  const percentage = Math.round((status.completed / status.total) * 100) || 0;
  
  const chartData = [
    { name: 'Completed', value: status.completed, color: '#10b981' },
    { name: 'Remaining', value: status.total - status.completed - status.failed, color: '#e2e8f0' },
    { name: 'Failed', value: status.failed, color: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Progress Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Process Progress</h3>
          <div className="flex items-end justify-between mt-2">
            <span className="text-4xl font-bold text-slate-900">{percentage}%</span>
            <span className="text-slate-500 text-sm">{status.completed} / {status.total} rows</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${isFinished ? 'bg-green-500' : 'bg-blue-600 animate-pulse'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {isFinished && (
          <div className="mt-6 flex flex-col space-y-2">
            <button 
              onClick={onDownload}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <i className="fas fa-download"></i>
              <span>Download Fixed CSV</span>
            </button>
            <button 
              onClick={onReset}
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 flex items-center justify-center space-x-2 transition-all"
            >
              <i className="fas fa-undo"></i>
              <span>Process New File</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-4">Distribution</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-600">Enriched: {status.completed}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-600">Failed: {status.failed}</span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-600 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">AI Status</h3>
          <p className="text-lg font-semibold mb-4">
            {isFinished ? 'Data Cleaned & Verified' : status.isProcessing ? 'Researcher AI is searching the web...' : 'Ready to start'}
          </p>
          <div className="flex items-center space-x-2 text-blue-100 text-sm">
            <i className="fas fa-shield-alt"></i>
            <span>Privacy-focused processing</span>
          </div>
        </div>
        <i className="fas fa-robot absolute bottom-[-20px] right-[-10px] text-8xl text-blue-500 opacity-30"></i>
      </div>
    </div>
  );
};

export default EnrichmentDashboard;
