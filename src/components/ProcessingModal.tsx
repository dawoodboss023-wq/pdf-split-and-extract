/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2, CheckCircle2, FileText, Split, Sparkles } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  progress: number;
  statusMessage: string;
  stage: 'analyzing' | 'splitting';
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  progress,
  statusMessage,
  stage,
}) => {
  if (!isOpen) return null;

  const steps = stage === 'analyzing'
    ? [
        { label: 'Uploading & reading PDF data', threshold: 15 },
        { label: 'Analyzing layout, text & page structures', threshold: 45 },
        { label: 'Detecting document boundaries & numbering patterns', threshold: 80 },
        { label: 'Finalizing document partitions', threshold: 95 },
      ]
    : [
        { label: 'Loading source document', threshold: 15 },
        { label: 'Extracting page ranges with vector fidelity', threshold: 50 },
        { label: 'Packaging independent PDF documents', threshold: 85 },
        { label: 'Finalizing downloads & compression', threshold: 95 },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center">
        {/* Animated Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-red-100 animate-ping opacity-25" />
          <div className="relative w-20 h-20 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#E53935] shadow-xs">
            {stage === 'analyzing' ? (
              <Split className="w-9 h-9 animate-pulse" />
            ) : (
              <FileText className="w-9 h-9 animate-bounce duration-1000" />
            )}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
          {stage === 'analyzing' ? 'Analyzing your PDF...' : 'Creating Separate PDFs...'}
        </h3>
        <p className="text-slate-500 text-sm mb-6 min-h-[20px] font-medium">
          {statusMessage || 'Processing your document...'}
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-[#E53935] to-[#f87171] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-6">
          <span>Progress</span>
          <span className="tabular-nums font-mono text-slate-800">{Math.round(progress)}%</span>
        </div>

        {/* Status Checklist */}
        <div className="space-y-2.5 text-left border-t border-slate-100 pt-5">
          {steps.map((st, i) => {
            const isDone = progress >= st.threshold;
            const isCurrent =
              progress < st.threshold &&
              (i === 0 || progress >= steps[i - 1].threshold);

            return (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs sm:text-sm transition-colors ${
                  isDone
                    ? 'text-emerald-700 font-medium'
                    : isCurrent
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#E53935] animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className="truncate">{st.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>High-fidelity vector & layout preservation active</span>
        </div>
      </div>
    </div>
  );
};
