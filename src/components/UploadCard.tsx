/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  FileCheck,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileCode,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { formatBytes } from '../services/pdfService';
import { generateSampleCombinedPdf } from '../services/samplePdfGenerator';

interface UploadCardProps {
  onFileSelected: (file: File) => void;
  onAnalyze: () => void;
  selectedFile: File | null;
  pageCount: number | null;
  onRemoveFile: () => void;
  isAnalyzing: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onFileSelected,
  onAnalyze,
  selectedFile,
  pageCount,
  onRemoveFile,
  isAnalyzing,
  errorMessage,
  onClearError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onClearError();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onClearError();
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    // 100 MB limit
    if (file.size > 100 * 1024 * 1024) {
      alert('This PDF is larger than the allowed file size (100 MB).');
      return;
    }
    onFileSelected(file);
  };

  const handleLoadSample = async () => {
    onClearError();
    setIsGeneratingSample(true);
    try {
      const sampleFile = await generateSampleCombinedPdf();
      onFileSelected(sampleFile);
    } catch (err) {
      console.error('Failed to generate sample PDF', err);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  return (
    <div id="upload-zone" className="w-full max-w-3xl mx-auto">
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3 text-red-700 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">Upload Issue</p>
              <p className="text-sm mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={onClearError}
            className="p-1 text-red-500 hover:text-red-800 rounded-md transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!selectedFile ? (
        // Standard Upload Dropzone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all bg-white shadow-xs ${
            isDragOver
              ? 'border-[#E53935] bg-red-50/40 ring-4 ring-red-100'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            id="pdf-file-input"
          />

          {/* Central PDF Icon */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E53935] mb-5 shadow-xs">
            <UploadCloud className="w-10 h-10 stroke-[1.6]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Upload your combined PDF
          </h3>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mb-6">
            Drag & drop your PDF here or select a file from your device.
          </p>

          {/* Large Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-[#E53935] hover:bg-[#d32f2f] active:bg-[#c62828] rounded-xl shadow-md shadow-red-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Select PDF
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isGeneratingSample}
              className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200 disabled:opacity-50"
            >
              {isGeneratingSample ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  Generating Sample...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Try Sample Combined PDF
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            PDF files only • Max file size: 100 MB
          </p>

          {/* Privacy badge below */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your files are processed securely in your browser and are automatically deleted after processing.
            </span>
          </div>
        </div>
      ) : (
        // File Selected Card
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs animate-in fade-in">
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E53935] shrink-0">
                <FileCode className="w-7 h-7" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-sm sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                  <span className="tabular-nums">{formatBytes(selectedFile.size)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {pageCount !== null ? `${pageCount} pages` : 'Reading pages...'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-medium">Ready for analysis</span>
                </div>
              </div>
            </div>

            <button
              onClick={onRemoveFile}
              disabled={isAnalyzing}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Remove uploaded file"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-signal document boundary detection ready</span>
            </div>

            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-[#E53935] hover:bg-[#d32f2f] active:bg-[#c62828] rounded-xl shadow-md shadow-red-200 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing PDF...
                </>
              ) : (
                <>
                  <span>Analyze PDF</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
