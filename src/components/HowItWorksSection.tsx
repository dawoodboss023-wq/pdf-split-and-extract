/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UploadCloud, ScanEye, DownloadCloud, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload PDF',
      desc: 'Upload your combined PDF containing multiple distinct documents or scanned batches.',
      icon: UploadCloud,
    },
    {
      num: '02',
      title: 'Detect & Review',
      desc: 'We analyze the PDF and identify separate documents. Review or adjust the detected boundaries.',
      icon: ScanEye,
    },
    {
      num: '03',
      title: 'Download',
      desc: 'Download each PDF individually or download everything as a single organized ZIP.',
      icon: DownloadCloud,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-t border-slate-200/80 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E53935] bg-red-50 px-2.5 py-1 rounded-md">
            Three Simple Steps
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            How It Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Effortlessly separate combined scanned batches, invoice books, and legal packets in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="relative bg-slate-50/80 border border-slate-200 rounded-3xl p-8 hover:border-slate-300 transition-all flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#E53935] shadow-xs mb-6">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="text-3xl font-black text-slate-300 font-mono mb-2">
                  {st.num}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {st.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
