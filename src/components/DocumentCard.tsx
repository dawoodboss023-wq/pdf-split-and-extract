/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Edit2,
  Check,
  Eye,
  Trash2,
  Combine,
  Split,
  ChevronUp,
  ChevronDown,
  Info,
} from 'lucide-react';
import type { DetectedDocument, PageMetadata } from '../types/pdf';

interface DocumentCardProps {
  document: DetectedDocument;
  index: number;
  totalDocuments: number;
  totalPages: number;
  pages: PageMetadata[];
  isSelected: boolean;
  onSelect: () => void;
  onRename: (newName: string) => void;
  onUpdateRange: (startPage: number, endPage: number) => void;
  onPreview: () => void;
  onRemove: () => void;
  onMergeWithNext?: () => void;
  onSplitDocument?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  index,
  totalDocuments,
  totalPages,
  pages,
  isSelected,
  onSelect,
  onRename,
  onUpdateRange,
  onPreview,
  onRemove,
  onMergeWithNext,
  onSplitDocument,
  onMoveUp,
  onMoveDown,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(document.name);
  const [isEditingRange, setIsEditingRange] = useState(false);
  const [tempStart, setTempStart] = useState(document.startPage);
  const [tempEnd, setTempEnd] = useState(document.endPage);

  const handleSaveName = () => {
    let clean = tempName.trim();
    if (!clean) clean = `Document-${String(index + 1).padStart(2, '0')}.pdf`;
    if (!clean.endsWith('.pdf')) clean += '.pdf';
    onRename(clean);
    setIsEditingName(false);
  };

  const handleSaveRange = () => {
    const s = Math.max(1, Math.min(totalPages, tempStart));
    const e = Math.max(s, Math.min(totalPages, tempEnd));
    onUpdateRange(s, e);
    setIsEditingRange(false);
  };

  // First page thumbnail
  const firstPageMeta = pages.find((p) => p.pageNumber === document.startPage);

  return (
    <div
      onClick={onSelect}
      className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all duration-200 relative ${
        isSelected
          ? 'border-red-500 shadow-md ring-2 ring-red-100'
          : 'border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Thumbnail & Document Title Info */}
        <div className="flex items-start gap-3.5">
          {/* Thumbnail preview */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="w-14 h-18 sm:w-16 sm:h-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group/thumb relative"
            title="Click to preview this document"
          >
            {firstPageMeta?.thumbnailUrl ? (
              <img
                src={firstPageMeta.thumbnailUrl}
                alt={document.name}
                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
              />
            ) : (
              <FileText className="w-6 h-6 text-[#E53935]" />
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Eye className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title / Name Editor */}
            {isEditingName ? (
              <div
                className="flex items-center gap-2 mb-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="px-2.5 py-1 text-sm font-bold border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                  title="Save name"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1 group/name">
                <h4 className="text-base font-bold text-slate-900 truncate">
                  {document.name}
                </h4>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempName(document.name);
                    setIsEditingName(true);
                  }}
                  className="text-slate-400 hover:text-slate-700 opacity-60 hover:opacity-100 p-1 rounded-md cursor-pointer transition-opacity"
                  title="Rename document"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Range & Page Count */}
            {isEditingRange ? (
              <div
                className="flex flex-wrap items-center gap-2 mt-1.5 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-slate-500">From page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={tempStart}
                  onChange={(e) => setTempStart(parseInt(e.target.value, 10) || 1)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded-md text-xs font-semibold tabular-nums"
                />
                <span className="text-slate-500">to:</span>
                <input
                  type="number"
                  min={tempStart}
                  max={totalPages}
                  value={tempEnd}
                  onChange={(e) => setTempEnd(parseInt(e.target.value, 10) || tempStart)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded-md text-xs font-semibold tabular-nums"
                />
                <button
                  type="button"
                  onClick={handleSaveRange}
                  className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                  Pages {document.startPage}–{document.endPage}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-500">
                  {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempStart(document.startPage);
                    setTempEnd(document.endPage);
                    setIsEditingRange(true);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium underline ml-1 cursor-pointer"
                >
                  Edit range
                </button>
              </div>
            )}

            {/* Detection Signals */}
            {document.signals && document.signals.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {document.signals.slice(0, 2).map((sig, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    <Info className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-xs">{sig}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Action Buttons */}
        <div
          className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 self-end sm:self-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reordering */}
          {onMoveUp && index > 0 && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Move Document Up"
              aria-label="Move document up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}

          {onMoveDown && index < totalDocuments - 1 && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Move Document Down"
              aria-label="Move document down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Preview */}
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Preview pages"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview</span>
          </button>

          {/* Merge with next */}
          {onMergeWithNext && index < totalDocuments - 1 && (
            <button
              type="button"
              onClick={onMergeWithNext}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Merge with adjacent document below"
            >
              <Combine className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Merge Next</span>
            </button>
          )}

          {/* Split document */}
          {onSplitDocument && document.pageCount > 1 && (
            <button
              type="button"
              onClick={onSplitDocument}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Split this document into smaller parts"
            >
              <Split className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Split</span>
            </button>
          )}

          {/* Delete */}
          {totalDocuments > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
              title="Remove document boundary"
              aria-label="Remove document boundary"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
