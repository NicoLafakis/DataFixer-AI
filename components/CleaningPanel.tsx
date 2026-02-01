
import React from 'react';
import { CleaningRules } from '../types';

interface CleaningPanelProps {
  rules: CleaningRules;
  onToggle: (rule: keyof CleaningRules) => void;
}

const CleaningPanel: React.FC<CleaningPanelProps> = ({ rules, onToggle }) => {
  const ruleList: { id: keyof CleaningRules; label: string; icon: string; desc: string }[] = [
    { id: 'removeDuplicates', label: 'Deduplicate', icon: 'fa-copy', desc: 'Remove rows with duplicate domains' },
    { id: 'validateEmails', label: 'Email Format', icon: 'fa-envelope', desc: 'Verify and fix email structures' },
    { id: 'validatePhones', label: 'Phone Cleanup', icon: 'fa-phone', desc: 'Standardize phone digit counts' },
    { id: 'standardizeUrls', label: 'URL Normalize', icon: 'fa-link', desc: 'Ensure domains have consistent prefixes' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
        <i className="fas fa-broom text-blue-500"></i>
        <span>Cleaning & Validation Rules</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ruleList.map(rule => (
          <div 
            key={rule.id}
            onClick={() => onToggle(rule.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
              rules[rule.id] 
                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                : 'bg-white border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${
              rules[rule.id] ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              <i className={`fas ${rule.icon} text-xs`}></i>
            </div>
            <div>
              <p className={`text-sm font-semibold ${rules[rule.id] ? 'text-blue-900' : 'text-slate-700'}`}>
                {rule.label}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">{rule.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CleaningPanel;
