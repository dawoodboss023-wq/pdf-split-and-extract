/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, Zap, Shield, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center pt-8 pb-10 sm:pt-14 sm:pb-12 max-w-4xl mx-auto px-4">
      {/* Subdued pill kicker */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-semibold text-[#E53935] mb-5 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Intelligent Document Boundary Recognition</span>
      </div>

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] text-balance mb-5">
        Split Combined PDF into <span className="text-[#E53935]">Separate PDFs</span>
      </h1>

      <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance mb-8">
        Upload one combined PDF and automatically separate its individual documents into independent PDF files.
      </p>

      {/* Feature highlights */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Auto Title & Header Detection</span>
        </div>
        <span className="hidden sm:inline text-slate-300">·</span>
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Page Number Reset Recognition</span>
        </div>
        <span className="hidden sm:inline text-slate-300">·</span>
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Private & Auto-Deleted</span>
        </div>
      </div>
    </div>
  );
};
