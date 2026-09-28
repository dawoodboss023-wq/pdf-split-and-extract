/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  BookmarkCheck,
  Hash,
  FileMinus2,
  Maximize2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const signals = [
    {
      icon: Hash,
      title: 'Page Numbering Resets',
      desc: 'Detects patterns like "Page 1 of 4", "1 of 3", or numbering resetting to 1, pinpointing when a fresh document begins.',
    },
    {
      icon: BookmarkCheck,
      title: 'Title & Header Recognition',
      desc: 'Recognizes structural headings such as "Invoice", "Master Services Agreement", "Statement", or "Audit Report".',
    },
    {
      icon: FileMinus2,
      title: 'Blank Separator Pages',
      desc: 'Identifies blank separator sheets frequently inserted by high-volume office scanners between document batches.',
    },
    {
      icon: Maximize2,
      title: 'Layout & Dimension Shifts',
      desc: 'Flags abrupt transitions between portrait and landscape pages, or varying page dimensions.',
    },
    {
      icon: FileText,
      title: 'Repeated Document Structures',
      desc: 'Identifies recurring corporate letterheads, company logos, and boilerplate margins across large PDF files.',
    },
    {
      icon: Sliders,
      title: 'Failsafe Manual Fine-Tuning',
      desc: 'Intuitive visual timeline lets you click between any two pages to add, remove, or merge document boundaries with 1 click.',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] bg-red-50 px-2.5 py-1 rounded-md">
            Intelligent PDF Analysis
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Why This Is Not a Normal PDF Splitter
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Most splitters force you to manually calculate start and end pages.
            Our engine inspects the actual document contents and layout boundaries automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.map((sig, idx) => {
            const Icon = sig.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E53935] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {sig.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {sig.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quality note */}
        <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                100% Original Vector & Font Fidelity
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Pages are cleanly extracted as native PDF streams. No compression artifacts, degraded text, or lost metadata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
