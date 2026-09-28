/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DetectedDocument, GeneratedPdfFile, PageMetadata } from '../types/pdf';
import { triggerDownload } from '../services/pdfService';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedDoc?: DetectedDocument | null;
  generatedPdf?: GeneratedPdfFile | null;
  pages?: PageMetadata[];
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  detectedDoc,
  generatedPdf,
  pages = [],
}) => {
  if (!isOpen) return null;

  const title = generatedPdf?.name || detectedDoc?.name || 'Document Preview';

  // If detected document, get all its pages
  const docPages = detectedDoc
    ? pages.filter((p) => p.pageNumber >= detectedDoc.startPage && p.pageNumber <= detectedDoc.endPage)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-[#E53935] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                {title}
              </h3>
              <p className="text-xs text-slate-500">
                {generatedPdf
                  ? `${generatedPdf.pageCount} pages • Pages ${generatedPdf.startPage}–${generatedPdf.endPage}`
                  : detectedDoc
                  ? `${detectedDoc.pageCount} pages • Pages ${detectedDoc.startPage}–${detectedDoc.endPage}`
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {generatedPdf && (
              <button
                type="button"
                onClick={() => triggerDownload(generatedPdf.downloadUrl, generatedPdf.name)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#E53935] hover:bg-[#d32f2f] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          {generatedPdf ? (
            // Full embedded PDF viewer
            <div className="w-full h-[65vh] bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200">
              <iframe
                src={`${generatedPdf.downloadUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-none"
                title={generatedPdf.name}
              />
            </div>
          ) : (
            // Thumbnail & text preview for detected document pages
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {docPages.map((pg) => (
                  <div
                    key={pg.pageNumber}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-col"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>Page {pg.pageNumber}</span>
                      {pg.pageNumberDetected && (
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {pg.pageNumberDetected.raw}
                        </span>
                      )}
                    </div>

                    <div className="w-full h-64 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex items-center justify-center mb-2">
                      {pg.thumbnailUrl ? (
                        <img
                          src={pg.thumbnailUrl}
                          alt={`Page ${pg.pageNumber}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="p-4 text-xs text-slate-400 text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <span>Layout Preview</span>
                        </div>
                      )}
                    </div>

                    {pg.firstLine && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-auto italic">
                        &ldquo;{pg.firstLine}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
