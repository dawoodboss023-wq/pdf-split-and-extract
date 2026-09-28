/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  Download,
  Archive,
  RotateCcw,
  FileText,
  ExternalLink,
  Sparkles,
  Loader2,
  FileCheck,
} from 'lucide-react';
import type { GeneratedPdfFile } from '../types/pdf';
import { formatBytes, createZipArchive, triggerDownload } from '../services/pdfService';

interface ResultsViewProps {
  files: GeneratedPdfFile[];
  originalFileName: string;
  onStartNew: () => void;
  onPreviewFile: (file: GeneratedPdfFile) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  files,
  originalFileName,
  onStartNew,
  onPreviewFile,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const handleDownloadSingle = (file: GeneratedPdfFile) => {
    triggerDownload(file.downloadUrl, file.name);
    setDownloadedIds((prev) => new Set(prev).add(file.id));
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      const baseName = originalFileName.replace(/\.[^/.]+$/, '');
      const zipName = `${baseName}_separated_documents.zip`;
      const { downloadUrl, filename } = await createZipArchive(files, zipName);
      triggerDownload(downloadUrl, filename);
    } catch (err) {
      console.error('Failed to create ZIP', err);
      alert('Could not package ZIP. You can still download individual PDFs.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs mb-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
          <CheckCircle className="w-9 h-9" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your PDFs are ready!
        </h3>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-lg mx-auto">
          Your combined PDF has been separated into{' '}
          <strong className="text-slate-900 font-semibold">{files.length} individual documents</strong>.
        </p>

        {/* Big Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-[#E53935] hover:bg-[#d32f2f] active:bg-[#c62828] rounded-xl shadow-lg shadow-red-200 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Packaging ZIP Archive...
              </>
            ) : (
              <>
                <Archive className="w-5 h-5" />
                Download All as ZIP
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onStartNew}
            className="w-full sm:w-auto px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Start New PDF
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Full quality & vector properties preserved</span>
        </p>
      </div>

      {/* Generated Files List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
          <span>Individual Files ({files.length})</span>
          <span>Download Action</span>
        </div>

        {files.map((file, idx) => {
          const isDownloaded = downloadedIds.has(file.id);

          return (
            <div
              key={file.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-14 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E53935] shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 truncate">
                      {file.name}
                    </h4>
                    {isDownloaded && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <FileCheck className="w-3 h-3" />
                        Downloaded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>
                      {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'} (Pages {file.startPage}–{file.endPage})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatBytes(file.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onPreviewFile(file)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Preview PDF in browser"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingle(file)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#E53935] hover:bg-[#d32f2f] active:bg-[#c62828] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
