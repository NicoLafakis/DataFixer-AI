
export interface CSVRow {
  [key: string]: any;
  _validationErrors?: string[];
  _sources?: any[];
  _status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface CleaningRules {
  removeDuplicates: boolean;
  validateEmails: boolean;
  validatePhones: boolean;
  standardizeUrls: boolean;
}

export interface EnrichmentStatus {
  total: number;
  completed: number;
  failed: number;
  isProcessing: boolean;
}

export interface AppState {
  headers: string[];
  rows: CSVRow[];
  selectedDomainColumn: string | null;
  columnsToEnrich: string[];
  cleaningRules: CleaningRules;
  enrichmentStatus: EnrichmentStatus;
  isFinished: boolean;
}
