/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, Scissors, Shield } from 'lucide-react';

interface FooterProps {
  onNavClick: (sectionId: string) => void;
  onOpenPrivacy: () => void;
  onOpenHowItWorks: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavClick,
  onOpenPrivacy,
  onOpenHowItWorks,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#E53935] text-white shadow-xs">
              <FileText className="w-4 h-4" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <Scissors className="w-3 h-3 text-[#E53935]" />
              </div>
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 block">
                PDF Split & Extract
              </span>
              <p className="text-xs text-slate-500">
                Simple, secure PDF document tools.
              </p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavClick('home')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={onOpenHowItWorks}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <a
              href="mailto:support@pdfsplitextract.app"
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Contact
            </a>
          </nav>

          {/* Copyright */}
          <div className="text-xs text-slate-400 text-center md:text-right">
            © 2026 PDF Split & Extract
          </div>
        </div>
      </div>
    </footer>
  );
};
