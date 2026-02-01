
import React from 'react';
import { CSVRow } from '../types';

interface DataTableProps {
  headers: string[];
  rows: CSVRow[];
  columnsToEnrich: string[];
}

const DataTable: React.FC<DataTableProps> = ({ headers, rows, columnsToEnrich }) => {
  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  
  const isPhone = (val: string) => {
    // Check basic format: optional +, followed by digits, spaces, hyphens, or parens
    const formatOk = /^\+?[\d\s\-()]{7,}$/.test(val);
    // Count actual digits to ensure they are within the 10-15 range
    const digitCount = val.replace(/\D/g, '').length;
    const lengthOk = digitCount >= 10 && digitCount <= 15;
    return formatOk && lengthOk;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'processing':
        return <i className="fas fa-spinner fa-spin text-blue-500"></i>;
      case 'completed':
        return <i className="fas fa-check-circle text-emerald-500"></i>;
      case 'failed':
        return <i className="fas fa-times-circle text-red-500"></i>;
      case 'pending':
      default:
        return <i className="fas fa-circle text-slate-200"></i>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto max-h-[600px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-4 w-12 text-center text-xs font-bold text-slate-400 uppercase">#</th>
              <th className="px-2 py-4 w-8 text-center text-xs font-bold text-slate-400 uppercase">Status</th>
              {headers.map((header) => (
                <th
                  key={header}
                  className={`px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider ${
                    columnsToEnrich.includes(header) ? 'bg-blue-50/50 text-blue-700' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header}</span>
                    {columnsToEnrich.includes(header) && (
                      <i className="fas fa-sparkles text-[10px] text-blue-500"></i>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sources</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {rows.map((row, idx) => (
              <tr key={idx} className={`hover:bg-slate-50 transition-colors group ${row._status === 'processing' ? 'bg-blue-50/30' : ''}`}>
                <td className="px-4 py-4 whitespace-nowrap text-[10px] text-slate-300 font-mono text-center">{idx + 1}</td>
                <td className="px-2 py-4 whitespace-nowrap text-center text-sm">
                  {getStatusIcon(row._status)}
                </td>
                {headers.map((header) => {
                  const isEnrichedColumn = columnsToEnrich.includes(header);
                  const value = (row[header] as string) || '';
                  const isEmpty = value.trim() === '';
                  
                  // Simple heuristic validation
                  let hasError = false;
                  if (!isEmpty && header.toLowerCase().includes('email') && !isEmail(value)) hasError = true;
                  if (!isEmpty && (header.toLowerCase().includes('phone') || header.toLowerCase().includes('mobile')) && !isPhone(value)) hasError = true;

                  return (
                    <td
                      key={header}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isEnrichedColumn ? 'font-medium' : 'text-slate-600'
                      }`}
                    >
                      {isEmpty ? (
                        <span className="text-slate-300 italic text-xs">empty</span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`${isEnrichedColumn ? 'text-blue-700 bg-blue-50 px-2 py-0.5 rounded' : ''} ${hasError ? 'border-b-2 border-red-300' : ''}`}>
                            {value}
                          </span>
                          {hasError && (
                            <i className="fas fa-exclamation-triangle text-red-400 text-[10px]" title="Invalid format or digit length (10-15 required)"></i>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                  {row._sources && row._sources.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {row._sources.slice(0, 3).map((source: any, sIdx: number) => (
                        <a 
                          key={sIdx} 
                          href={source.web?.uri || source.maps?.uri || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-slate-100 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] text-slate-500 hover:text-blue-600 transition-colors"
                          title={source.web?.title || source.maps?.title}
                        >
                          [{sIdx + 1}]
                        </a>
                      ))}
                      {row._sources.length > 3 && <span className="text-[9px]">+{row._sources.length - 3}</span>}
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="py-20 flex flex-col items-center text-slate-400">
          <i className="fas fa-table text-5xl mb-4"></i>
          <p>No data to display. Please upload a CSV.</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;
