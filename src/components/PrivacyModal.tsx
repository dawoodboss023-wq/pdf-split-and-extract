/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, Lock, Trash2, EyeOff } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Privacy & Data Security Policy
              </h3>
              <p className="text-xs text-slate-500">
                PDF Split & Extract Data Safeguards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-4 text-sm text-slate-600 leading-relaxed">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">
                Client-Side In-Memory Processing
              </strong>
              Your documents are processed securely in your browser&apos;s isolated sandbox memory.
              We do not upload or store your sensitive files on public servers.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-[#E53935] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">
                Instant Automatic Deletion
              </strong>
              All temporary blob pointers and document buffers are cleared immediately upon clicking
              &ldquo;Start New PDF&rdquo; or closing your browser tab.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">
                Strict Zero-Log Policy
              </strong>
              No human or third party ever views your documents, invoices, legal contracts, or medical records.
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
