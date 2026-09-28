/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scissors, FileText, Plus, AlertCircle } from 'lucide-react';
import type { PageMetadata, DetectedDocument } from '../types/pdf';

interface VisualPageStripProps {
  pages: PageMetadata[];
  documents: DetectedDocument[];
  onToggleSplit: (pageNumber: number) => void;
  onSelectDocument: (docId: string) => void;
  selectedDocId?: string;
  onPageClick?: (pageNumber: number) => void;
}

const DOC_COLORS = [
  { border: 'border-red-500', bg: 'bg-red-50/50', badge: 'bg-red-600 text-white' },
  { border: 'border-blue-500', bg: 'bg-blue-50/50', badge: 'bg-blue-600 text-white' },
  { border: 'border-emerald-500', bg: 'bg-emerald-50/50', badge: 'bg-emerald-600 text-white' },
  { border: 'border-purple-500', bg: 'bg-purple-50/50', badge: 'bg-purple-600 text-white' },
  { border: 'border-amber-500', bg: 'bg-amber-50/50', badge: 'bg-amber-600 text-white' },
  { border: 'border-cyan-500', bg: 'bg-cyan-50/50', badge: 'bg-cyan-600 text-white' },
  { border: 'border-indigo-500', bg: 'bg-indigo-50/50', badge: 'bg-indigo-600 text-white' },
  { border: 'border-rose-500', bg: 'bg-rose-50/50', badge: 'bg-rose-600 text-white' },
];

export const VisualPageStrip: React.FC<VisualPageStripProps> = ({
  pages,
  documents,
  onToggleSplit,
  onSelectDocument,
  selectedDocId,
  onPageClick,
}) => {
  // Map pageNumber -> document index
  const pageToDocMap = new Map<number, { docIndex: number; doc: DetectedDocument; isFirst: boolean; isLast: boolean }>();

  documents.forEach((doc, idx) => {
    for (let p = doc.startPage; p <= doc.endPage; p++) {
      pageToDocMap.set(p, {
        docIndex: idx,
        doc,
        isFirst: p === doc.startPage,
        isLast: p === doc.endPage,
      });
    }
  });

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Visual Document Stream</span>
            <span className="text-xs font-normal text-slate-500">
              ({pages.length} total pages)
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any scissor icon or divider between pages to add or remove document splits.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
            <span>Document Boundary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-slate-400" />
            <span>Click Divider to Toggle</span>
          </div>
        </div>
      </div>

      {/* Horizontally scrollable or wrapping page grid */}
      <div className="overflow-x-auto pb-3 pt-2 scrollbar-thin">
        <div className="flex items-center min-w-max gap-1">
          {pages.map((page, index) => {
            const pageNum = page.pageNumber;
            const docInfo = pageToDocMap.get(pageNum);
            const colorSet = docInfo
              ? DOC_COLORS[docInfo.docIndex % DOC_COLORS.length]
              : DOC_COLORS[0];
            const isSelected = docInfo && docInfo.doc.id === selectedDocId;

            return (
              <React.Fragment key={pageNum}>
                {/* Page Card */}
                <div
                  onClick={() => {
                    if (docInfo) onSelectDocument(docInfo.doc.id);
                    onPageClick?.(pageNum);
                  }}
                  className={`group relative flex flex-col items-center cursor-pointer transition-all duration-150 ${
                    isSelected ? 'scale-105 z-10' : 'hover:scale-102'
                  }`}
                  title={`Page ${pageNum} • ${docInfo?.doc.name || 'Document'}`}
                >
                  {/* Document Start Indicator Header */}
                  {docInfo?.isFirst && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold rounded-full shadow-xs whitespace-nowrap z-20 ${colorSet.badge}`}
                    >
                      {docInfo.doc.name.replace('.pdf', '')}
                    </div>
                  )}

                  {/* Thumbnail / Page Frame */}
                  <div
                    className={`w-20 h-28 sm:w-24 sm:h-32 bg-white rounded-lg border-2 shadow-xs overflow-hidden flex flex-col justify-between transition-colors ${
                      docInfo?.isFirst ? 'ring-2 ring-offset-1 ring-slate-400' : ''
                    } ${colorSet.border} ${isSelected ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}
                  >
                    {page.thumbnailUrl ? (
                      <img
                        src={page.thumbnailUrl}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full p-2 flex flex-col justify-between bg-slate-50/70">
                        <div className="space-y-1">
                          <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
                          <div className="w-14 h-1 bg-slate-200 rounded-full" />
                          <div className="w-12 h-1 bg-slate-200 rounded-full" />
                        </div>
                        {page.hasHeaderPattern && (
                          <div className="text-[9px] font-semibold text-red-600 truncate">
                            Header
                          </div>
                        )}
                        <FileText className="w-4 h-4 text-slate-300 mx-auto" />
                      </div>
                    )}
                  </div>

                  {/* Page Footer Label */}
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-600">
                    <span>p. {pageNum}</span>
                    {page.pageNumberDetected?.current === 1 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Page 1 detected" />
                    )}
                  </div>
                </div>

                {/* Divider / Cut Point between pages */}
                {pageNum < pages.length && (
                  <div className="relative flex items-center justify-center px-1">
                    <button
                      type="button"
                      onClick={() => onToggleSplit(pageNum + 1)}
                      className={`group relative p-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                        docInfo?.isLast
                          ? 'bg-red-500 text-white shadow-sm hover:bg-red-600 scale-110'
                          : 'text-slate-300 hover:text-slate-700 hover:bg-slate-200/80 hover:scale-110'
                      }`}
                      title={
                        docInfo?.isLast
                          ? `Remove split between page ${pageNum} and ${pageNum + 1}`
                          : `Split into separate document at page ${pageNum + 1}`
                      }
                      aria-label={`Toggle split point after page ${pageNum}`}
                    >
                      <Scissors
                        className={`w-3.5 h-3.5 transition-transform ${
                          docInfo?.isLast ? 'rotate-90' : 'group-hover:rotate-45'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
