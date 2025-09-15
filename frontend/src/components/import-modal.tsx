"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { buyersAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

const CSV_TEMPLATE_DATA = `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags
John Doe,john@example.com,9876543210,chandigarh,apartment,2,buy,5000000,8000000,0-3m,website,"Looking for 2BHK in Sector 22","premium,urgent"
Jane Smith,,9876543211,mohali,villa,3,buy,10000000,15000000,3-6m,referral,"Prefers villa with garden","luxury,referral"
Mike Johnson,mike@example.com,9876543212,zirakpur,plot,,buy,2000000,3000000,>6m,walk-in,"Commercial plot for business",business
Sarah Wilson,sarah@example.com,9876543213,panchkula,apartment,1,rent,,50000,0-3m,website,"Looking for 1BHK on rent","budget,rental"`;

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: buyersAPI.importCSV,
    onSuccess: (result) => {
      setImportResult(result as ImportResult);
      if (result.successCount > 0) {
        toast.success(`🎉 Successfully imported ${result.successCount} buyers!`);
        onImportComplete();
      }
      if (result.errorCount > 0) {
        toast.error(`${result.errorCount} rows had errors. Check details below.`);
      }
      if (result.successCount === 0 && result.errorCount === 0) {
        toast.error('No data was processed. Please check your CSV format.');
      }
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Import failed';
      
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        toast.error('⏰ Too many import attempts. Please wait a few minutes and try again.');
      } else {
        toast.error(`Import failed: ${errorMessage}`);
      }
      
      // Set a basic error result to show in UI
      setImportResult({
        successCount: 0,
        errorCount: 1,
        errors: [{
          row: 0,
          message: errorMessage
        }]
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    importMutation.mutate(selectedFile);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_DATA], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyers-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('📄 Template downloaded with correct format!');
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    setShowTemplate(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal */}
        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Import Buyer Leads</h3>
                <p className="text-blue-100 mt-1">Upload CSV file to add multiple prospects</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="text-white hover:bg-white/20 border-0"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Instructions Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Import Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Maximum 200 rows per import</li>
                  <li>• File size limit: 5MB</li>
                  <li>• Required fields: fullName, phone, city, propertyType, purpose, timeline, source</li>
                  <li>• Use lowercase values: city (chandigarh, mohali, zirakpur, panchkula, other)</li>
                  <li>• Property types: apartment, villa, plot, office, retail</li>
                  <li>• BHK values: studio, 1, 2, 3, 4 (numbers for BHK)</li>
                  <li>• Timeline: 0-3m, 3-6m, 6m, exploring</li>
                  <li>• Sources: website, referral, walk-in, call, other</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">CSV Template</h4>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="default" onClick={() => setShowTemplate(!showTemplate)}>
                  <FileText className="w-4 h-4 mr-2" />
                  {showTemplate ? 'Hide' : 'Show'} Template
                </Button>
                <Button variant="primary" size="default" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>

            {showTemplate && (
              <div className="bg-gray-50 rounded-xl p-4 border">
                <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {CSV_TEMPLATE_DATA}
                </pre>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Select CSV File</h4>
            
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              selectedFile 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-primary'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-2">Click to select a CSV file</p>
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Import Results</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">{importResult.successCount}</p>
                      <p className="text-sm text-green-700">Successfully imported</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">{importResult.errorCount}</p>
                      <p className="text-sm text-red-700">Errors found</p>
                    </div>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-red-900">Error Details:</p>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-800 mb-2 last:mb-0 p-2 bg-white rounded border-l-4 border-red-400">
                        <span className="font-medium">Row {error.row}:</span>{' '}
                        {error.field && <span className="font-medium bg-red-100 px-1 rounded">{error.field}</span>}{' '}
                        <span>{error.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button 
              variant="primary" 
              onClick={handleImport}
              disabled={!selectedFile}
              loading={importMutation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
