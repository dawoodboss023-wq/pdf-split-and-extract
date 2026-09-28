/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Scissors, Menu, X, ShieldCheck, HelpCircle, Layers } from 'lucide-react';

interface HeaderProps {
  onNavClick: (sectionId: string) => void;
  onOpenPrivacy: () => void;
  onOpenHowItWorks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavClick,
  onOpenPrivacy,
  onOpenHowItWorks,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <button
            onClick={() => onNavClick('home')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            aria-label="PDF Split & Extract Home"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E53935] to-[#f87171] text-white shadow-sm shadow-red-200 transition-transform group-hover:scale-105">
              <FileText className="w-5 h-5" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                <Scissors className="w-3.5 h-3.5 text-[#E53935]" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#E53935] transition-colors">
                PDF Split & Extract
              </span>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Smart Document Boundary Separator
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavClick('home')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={onOpenHowItWorks}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              How It Works
            </button>
            <button
              onClick={() => onNavClick('features')}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              Detection Signals
            </button>
            <button
              onClick={onOpenPrivacy}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Privacy & Security
            </button>
          </nav>

          {/* Right Action */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onNavClick('upload-zone')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#E53935] hover:bg-[#d32f2f] active:bg-[#c62828] rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Upload PDF
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => {
              onNavClick('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => {
              onOpenHowItWorks();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            How It Works
          </button>
          <button
            onClick={() => {
              onNavClick('features');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            Detection Signals
          </button>
          <button
            onClick={() => {
              onOpenPrivacy();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Privacy & Security
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                onNavClick('upload-zone');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-[#E53935] hover:bg-[#d32f2f] rounded-lg shadow-sm"
            >
              Upload PDF
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
