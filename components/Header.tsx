
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <i className="fas fa-magic text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">DataFixer AI</h1>
            <p className="text-sm text-slate-500">Smart CSV Data Enrichment Tool</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Powered by Gemini
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Search Grounding Active
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
