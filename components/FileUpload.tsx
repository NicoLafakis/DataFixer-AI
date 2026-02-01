
import React, { useRef } from 'react';

interface FileUploadProps {
  onDataLoaded: (headers: string[], rows: any[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });

      onDataLoaded(headers, rows);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-12 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center space-y-4 hover:border-blue-400 transition-colors group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <div className="bg-blue-50 p-4 rounded-full group-hover:bg-blue-100 transition-colors">
        <i className="fas fa-cloud-upload-alt text-4xl text-blue-600"></i>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800">Upload your CSV file</h3>
        <p className="text-sm text-slate-500">Drag and drop or click to browse</p>
      </div>
      <p className="text-xs text-slate-400 font-mono">Supports .csv files with domain lists</p>
    </div>
  );
};

export default FileUpload;
