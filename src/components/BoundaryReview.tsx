/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  SlidersHorizontal,
  CheckCircle,
} from 'lucide-react';
import type { DetectedDocument, PageMetadata, UploadedPdfInfo } from '../types/pdf';
import { VisualPageStrip } from './VisualPageStrip';
import { DocumentCard } from './DocumentCard';

interface BoundaryReviewProps {
  pdfInfo: UploadedPdfInfo;
  documents: DetectedDocument[];
  inconclusive: boolean;
  onUpdateDocuments: (docs: DetectedDocument[]) => void;
  onConfirmSplit: () => void;
  onPreviewDocument: (doc: DetectedDocument) => void;
  onResetToAuto: () => void;
}

export const BoundaryReview: React.FC<BoundaryReviewProps> = ({
  pdfInfo,
  documents,
  inconclusive,
  onUpdateDocuments,
  onConfirmSplit,
  onPreviewDocument,
  onResetToAuto,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [manualModeOpen, setManualModeOpen] = useState(inconclusive);

  // Toggle boundary between pageNum - 1 and pageNum
  const handleToggleSplit = (targetPageNumber: number) => {
    // If targetPageNumber is already the start of some document (other than doc 1), remove split by merging
    const existingDocIdx = documents.findIndex((d) => d.startPage === targetPageNumber);
    if (existingDocIdx > 0) {
      // Merge with previous
      const prevDoc = documents[existingDocIdx - 1];
      const curDoc = documents[existingDocIdx];
      const merged: DetectedDocument = {
        ...prevDoc,
        endPage: curDoc.endPage,
        pageCount: curDoc.endPage - prevDoc.startPage + 1,
        signals: ['Manually merged boundary'],
      };
      const updated = [...documents];
      updated.splice(existingDocIdx - 1, 2, merged);
      onUpdateDocuments(updated);
      setSelectedDocId(merged.id);
      return;
    }

    // Otherwise, split the document that contains targetPageNumber
    const containerDocIdx = documents.findIndex(
      (d) => targetPageNumber > d.startPage && targetPageNumber <= d.endPage
    );
    if (containerDocIdx >= 0) {
      const parent = documents[containerDocIdx];
      const docA: DetectedDocument = {
        id: `${parent.id}-a`,
        name: parent.name,
        startPage: parent.startPage,
        endPage: targetPageNumber - 1,
        pageCount: targetPageNumber - parent.startPage,
        confidence: 'manual',
        signals: ['Manual split point'],
      };
      const nextIndex = documents.length + 1;
      const docB: DetectedDocument = {
        id: `doc-${Date.now()}`,
        name: `Document-${String(nextIndex).padStart(2, '0')}.pdf`,
        startPage: targetPageNumber,
        endPage: parent.endPage,
        pageCount: parent.endPage - targetPageNumber + 1,
        confidence: 'manual',
        signals: ['Manual split point'],
      };

      const updated = [...documents];
      updated.splice(containerDocIdx, 1, docA, docB);
      onUpdateDocuments(updated);
      setSelectedDocId(docB.id);
    }
  };

  const handleRename = (docId: string, newName: string) => {
    const updated = documents.map((d) => (d.id === docId ? { ...d, name: newName } : d));
    onUpdateDocuments(updated);
  };

  const handleUpdateRange = (docId: string, start: number, end: number) => {
    const updated = documents.map((d) =>
      d.id === docId ? { ...d, startPage: start, endPage: end, pageCount: end - start + 1 } : d
    );
    onUpdateDocuments(updated);
  };

  const handleRemove = (docIndex: number) => {
    if (documents.length <= 1) return;
    const target = documents[docIndex];
    const updated = [...documents];
    if (docIndex > 0) {
      // Expand previous document
      updated[docIndex - 1].endPage = target.endPage;
      updated[docIndex - 1].pageCount =
        updated[docIndex - 1].endPage - updated[docIndex - 1].startPage + 1;
      updated.splice(docIndex, 1);
    } else {
      // Expand next document
      updated[1].startPage = target.startPage;
      updated[1].pageCount = updated[1].endPage - updated[1].startPage + 1;
      updated.splice(0, 1);
    }
    onUpdateDocuments(updated);
  };

  const handleMergeWithNext = (docIndex: number) => {
    if (docIndex >= documents.length - 1) return;
    const cur = documents[docIndex];
    const next = documents[docIndex + 1];
    const merged: DetectedDocument = {
      ...cur,
      endPage: next.endPage,
      pageCount: next.endPage - cur.startPage + 1,
      signals: ['Merged document boundaries'],
    };
    const updated = [...documents];
    updated.splice(docIndex, 2, merged);
    onUpdateDocuments(updated);
    setSelectedDocId(merged.id);
  };

  const handleSplitDocInHalf = (docIndex: number) => {
    const doc = documents[docIndex];
    if (doc.pageCount <= 1) return;
    const mid = doc.startPage + Math.floor(doc.pageCount / 2);
    handleToggleSplit(mid);
  };

  const handleMoveUp = (docIndex: number) => {
    if (docIndex <= 0) return;
    const updated = [...documents];
    const temp = updated[docIndex];
    updated[docIndex] = updated[docIndex - 1];
    updated[docIndex - 1] = temp;
    onUpdateDocuments(updated);
  };

  const handleMoveDown = (docIndex: number) => {
    if (docIndex >= documents.length - 1) return;
    const updated = [...documents];
    const temp = updated[docIndex];
    updated[docIndex] = updated[docIndex + 1];
    updated[docIndex + 1] = temp;
    onUpdateDocuments(updated);
  };

  const handleAddDocument = () => {
    // Append a new document at the end if possible
    const lastDoc = documents[documents.length - 1];
    if (lastDoc && lastDoc.pageCount > 1) {
      const mid = lastDoc.startPage + Math.floor(lastDoc.pageCount / 2);
      handleToggleSplit(mid);
    } else {
      // Split the largest document
      let largest = documents[0];
      let largestIdx = 0;
      documents.forEach((d, i) => {
        if (d.pageCount > largest.pageCount) {
          largest = d;
          largestIdx = i;
        }
      });
      if (largest.pageCount > 1) {
        const mid = largest.startPage + Math.floor(largest.pageCount / 2);
        handleToggleSplit(mid);
      }
    }
  };

  // Quick preset splitter (split every N pages)
  const applyPresetSplit = (everyN: number) => {
    const total = pdfInfo.pageCount;
    const newDocs: DetectedDocument[] = [];
    let count = 1;
    for (let p = 1; p <= total; p += everyN) {
      const start = p;
      const end = Math.min(total, p + everyN - 1);
      const name = `Document-${String(count).padStart(2, '0')}.pdf`;
      newDocs.push({
        id: `doc-preset-${count}-${Date.now()}`,
        name,
        startPage: start,
        endPage: end,
        pageCount: end - start + 1,
        confidence: 'manual',
        signals: [`Split every ${everyN} ${everyN === 1 ? 'page' : 'pages'}`],
      });
      count++;
    }
    onUpdateDocuments(newDocs);
    setManualModeOpen(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* Top Header & Overview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 tracking-wider">
                ANALYSIS COMPLETE
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Detected {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Review and adjust the detected boundaries before creating the final files.
            </p>
          </div>

          {/* Action pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onResetToAuto}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Reset boundaries to automatic detection"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Reset to Auto
            </button>

            <button
              type="button"
              onClick={() => setManualModeOpen(!manualModeOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              Manual Split Presets
            </button>

            <button
              type="button"
              onClick={handleAddDocument}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E53935]" />
              Add Document
            </button>
          </div>
        </div>

        {/* Fallback Manual Notice if Inconclusive */}
        {inconclusive && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                Automatic detection was inconclusive
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                We couldn&apos;t find distinct repeated document titles or page numbering resets in this file.
                Use our visual page strip below or manual split options to define the boundaries.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPresetSplit(1)}
                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Split into 1 page each
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetSplit(2)}
                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Split every 2 pages
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Presets Panel */}
        {manualModeOpen && !inconclusive && (
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              BATCH SPLIT PRESETS
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPresetSplit(1)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold text-xs rounded-lg shadow-2xs cursor-pointer"
              >
                1 page per document ({pdfInfo.pageCount} docs)
              </button>
              <button
                type="button"
                onClick={() => applyPresetSplit(2)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold text-xs rounded-lg shadow-2xs cursor-pointer"
              >
                2 pages per document ({Math.ceil(pdfInfo.pageCount / 2)} docs)
              </button>
              {pdfInfo.pageCount >= 6 && (
                <button
                  type="button"
                  onClick={() => applyPresetSplit(3)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold text-xs rounded-lg shadow-2xs cursor-pointer"
                >
                  3 pages per document ({Math.ceil(pdfInfo.pageCount / 3)} docs)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Visual Page Strip */}
        <div className="mt-6">
          <VisualPageStrip
            pages={pdfInfo.pages}
            documents={documents}
            onToggleSplit={handleToggleSplit}
            onSelectDocument={setSelectedDocId}
            selectedDocId={selectedDocId}
          />
        </div>

        {/* Document Cards List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Detected Documents ({documents.length})</span>
            <span>Page Range</span>
          </div>

          {documents.map((doc, index) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              index={index}
              totalDocuments={documents.length}
              totalPages={pdfInfo.pageCount}
              pages={pdfInfo.pages}
              isSelected={doc.id === selectedDocId}
              onSelect={() => setSelectedDocId(doc.id)}
              onRename={(name) => handleRename(doc.id, name)}
              onUpdateRange={(s, e) => handleUpdateRange(doc.id, s, e)}
              onPreview={() => onPreviewDocument(doc)}
              onRemove={() => handleRemove(index)}
              onMergeWithNext={() => handleMergeWithNext(index)}
              onSplitDocument={() => handleSplitDocInHalf(index)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>

        {/* Primary Confirmation Action */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-900">{documents.length} PDF files</span> will be generated preserving original layout & quality.
          </div>

          <button
            type="button"
            onClick={onConfirmSplit}
            className="w-full sm:w-auto px-9 py-4 text-base font-bold text-white bg-[#E53935] hover:bg-[#d32f2f] active:bg-[#c62828] rounded-xl shadow-lg shadow-red-200 transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <span>Create Separate PDFs</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
