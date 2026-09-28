/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import type {
  AppStep,
  UploadedPdfInfo,
  DetectedDocument,
  GeneratedPdfFile,
} from './types/pdf';
import {
  analyzeUploadedPdf,
  detectDocumentBoundaries,
  createSeparatePdfs,
} from './services/pdfService';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { UploadCard } from './components/UploadCard';
import { BoundaryReview } from './components/BoundaryReview';
import { ResultsView } from './components/ResultsView';
import { ProcessingModal } from './components/ProcessingModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { PrivacyModal } from './components/PrivacyModal';
import { Footer } from './components/Footer';

export default function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pdfInfo, setPdfInfo] = useState<UploadedPdfInfo | null>(null);
  const [detectedDocuments, setDetectedDocuments] = useState<DetectedDocument[]>([]);
  const [inconclusive, setInconclusive] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedPdfFile[]>([]);

  // Processing state
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DetectedDocument | null>(null);
  const [previewGeneratedFile, setPreviewGeneratedFile] = useState<GeneratedPdfFile | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Quick initial page count read when file is selected
  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setPdfInfo(null);
    setDetectedDocuments([]);
    setGeneratedFiles([]);
    setPageCount(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
      setPageCount(doc.getPageCount());
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('password') || msg.includes('encrypt')) {
        setErrorMessage('This PDF is password protected. Please unlock it and try again.');
      } else {
        setErrorMessage("We couldn't read this PDF. Please try another file.");
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPageCount(null);
    setPdfInfo(null);
    setDetectedDocuments([]);
    setGeneratedFiles([]);
    setErrorMessage(null);
    setStep('upload');
  };

  // Full multi-signal analysis
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setStep('analyzing');
    setProcessingProgress(5);
    setProcessingMessage('Starting document analysis...');
    setErrorMessage(null);

    try {
      const info = await analyzeUploadedPdf(selectedFile, (percent, msg) => {
        setProcessingProgress(percent);
        setProcessingMessage(msg);
      });

      const { documents, inconclusive: isInconclusive } = detectDocumentBoundaries(info.pages);
      setPdfInfo(info);
      setDetectedDocuments(documents);
      setInconclusive(isInconclusive);

      // Short delay for visual smoothness
      setTimeout(() => {
        setStep('review');
      }, 400);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err?.message || "We couldn't read this PDF. Please try another file."
      );
      setStep('upload');
    }
  };

  // Create separate PDFs
  const handleConfirmSplit = async () => {
    if (!pdfInfo || detectedDocuments.length === 0) return;
    setStep('splitting');
    setProcessingProgress(10);
    setProcessingMessage('Initializing extraction engine...');

    try {
      const results = await createSeparatePdfs(
        pdfInfo.arrayBuffer,
        detectedDocuments,
        (percent, msg) => {
          setProcessingProgress(percent);
          setProcessingMessage(msg);
        }
      );

      setGeneratedFiles(results);
      setTimeout(() => {
        setStep('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 400);
    } catch (err: any) {
      console.error('Split error:', err);
      setErrorMessage(
        err?.message || 'An error occurred while creating separate PDFs. Please try again.'
      );
      setStep('review');
    }
  };

  // Reset to initial automatic detection boundaries
  const handleResetToAuto = () => {
    if (!pdfInfo) return;
    const { documents, inconclusive: isInconclusive } = detectDocumentBoundaries(pdfInfo.pages);
    setDetectedDocuments(documents);
    setInconclusive(isInconclusive);
  };

  // Clean reset
  const handleStartNew = () => {
    // Revoke generated blob URLs to prevent memory leaks
    generatedFiles.forEach((f) => {
      try {
        URL.revokeObjectURL(f.downloadUrl);
      } catch (e) {
        // ignore
      }
    });

    handleRemoveFile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Preview handlers
  const handleOpenPreviewDoc = (doc: DetectedDocument) => {
    setPreviewDoc(doc);
    setPreviewGeneratedFile(null);
    setIsPreviewOpen(true);
  };

  const handleOpenPreviewGeneratedFile = (file: GeneratedPdfFile) => {
    setPreviewGeneratedFile(file);
    setPreviewDoc(null);
    setIsPreviewOpen(true);
  };

  // Navigation scroll helper
  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <Header
        onNavClick={handleNavClick}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenHowItWorks={() => handleNavClick('how-it-works')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {step === 'upload' && (
          <div className="space-y-6">
            <HeroSection />
            <UploadCard
              onFileSelected={handleFileSelected}
              onAnalyze={handleAnalyze}
              selectedFile={selectedFile}
              pageCount={pageCount}
              onRemoveFile={handleRemoveFile}
              isAnalyzing={false}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />
          </div>
        )}

        {step === 'review' && pdfInfo && (
          <BoundaryReview
            pdfInfo={pdfInfo}
            documents={detectedDocuments}
            inconclusive={inconclusive}
            onUpdateDocuments={setDetectedDocuments}
            onConfirmSplit={handleConfirmSplit}
            onPreviewDocument={handleOpenPreviewDoc}
            onResetToAuto={handleResetToAuto}
          />
        )}

        {step === 'results' && selectedFile && (
          <ResultsView
            files={generatedFiles}
            originalFileName={selectedFile.name}
            onStartNew={handleStartNew}
            onPreviewFile={handleOpenPreviewGeneratedFile}
          />
        )}
      </main>

      {/* Informational Sections */}
      <HowItWorksSection />
      <FeaturesSection />

      {/* Footer */}
      <Footer
        onNavClick={handleNavClick}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenHowItWorks={() => handleNavClick('how-it-works')}
      />

      {/* Processing Animation Modal */}
      <ProcessingModal
        isOpen={step === 'analyzing' || step === 'splitting'}
        progress={processingProgress}
        statusMessage={processingMessage}
        stage={step === 'analyzing' ? 'analyzing' : 'splitting'}
      />

      {/* Document / Page Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        detectedDoc={previewDoc}
        generatedPdf={previewGeneratedFile}
        pages={pdfInfo?.pages || []}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
