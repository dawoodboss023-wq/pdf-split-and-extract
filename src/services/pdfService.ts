/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import type { PageMetadata, DetectedDocument, UploadedPdfInfo, GeneratedPdfFile } from '../types/pdf';

// Dynamic import or setup for pdfjs-dist
let pdfjsLib: any = null;

async function getPdfJs() {
  if (!pdfjsLib) {
    try {
      pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        // Use CDN worker matching or default
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
      }
    } catch (e) {
      console.warn('PDF.js dynamic import error, will use pure pdf-lib fallback', e);
    }
  }
  return pdfjsLib;
}

/**
 * Common document starter keywords for header detection
 */
const DOCUMENT_STARTER_KEYWORDS = [
  'INVOICE',
  'RECEIPT',
  'STATEMENT',
  'PURCHASE ORDER',
  'BILL OF LADING',
  'AGREEMENT',
  'CONTRACT',
  'TERMS AND CONDITIONS',
  'MASTER SERVICES',
  'NON-DISCLOSURE',
  'EXECUTIVE SUMMARY',
  'REPORT',
  'PERFORMANCE AUDIT',
  'AUDIT REPORT',
  'CERTIFICATE OF',
  'POLICY NO',
  'APPLICATION FORM',
  'MEMORANDUM',
  'W-2',
  '1099',
  'FORM 1040',
  'TAX RETURN',
  'PAYSLIP',
  'PAYSTUB',
  'PACKING LIST',
  'DELIVERY NOTE',
  'QUOTATION',
  'PROPOSAL',
  'RESUME',
  'CURRICULUM VITAE',
];

/**
 * Analyzes text for page numbering patterns like "Page 1 of 4", "1 of 5", "Page 1"
 */
function detectPageNumber(text: string): { current: number; total?: number; raw: string } | undefined {
  // Page 1 of 5, Page 1 / 5, Page 1
  const matchPageOf = text.match(/\b(?:page|sheet|p\.?)\s*(\d+)\s*(?:of|\/)\s*(\d+)\b/i);
  if (matchPageOf) {
    return {
      current: parseInt(matchPageOf[1], 10),
      total: parseInt(matchPageOf[2], 10),
      raw: matchPageOf[0],
    };
  }

  const matchSimple = text.match(/\b(?:page|sheet)\s*(\d+)\b/i);
  if (matchSimple) {
    return {
      current: parseInt(matchSimple[1], 10),
      raw: matchSimple[0],
    };
  }

  // Look at trailing lines for "1 / 4"
  const matchFraction = text.match(/\b(\d+)\s*\/\s*(\d+)\b/);
  if (matchFraction) {
    const cur = parseInt(matchFraction[1], 10);
    const tot = parseInt(matchFraction[2], 10);
    if (cur <= tot && tot <= 500) {
      return {
        current: cur,
        total: tot,
        raw: matchFraction[0],
      };
    }
  }

  return undefined;
}

/**
 * Renders thumbnail for a single page using PDF.js and offscreen canvas
 */
async function renderPageThumbnail(pdfJsDoc: any, pageNumber: number): Promise<string | undefined> {
  try {
    const page = await pdfJsDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 0.5 }); // thumbnail scale
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (e) {
    console.warn(`Could not render thumbnail for page ${pageNumber}`, e);
    return undefined;
  }
}

/**
 * Extract text and metadata from PDF pages
 */
export async function analyzeUploadedPdf(
  file: File,
  onProgress?: (percent: number, message: string) => void
): Promise<UploadedPdfInfo> {
  onProgress?.(10, 'Reading PDF file data...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(25, 'Validating PDF structure & security...');
  let pdfLibDoc: PDFDocument;
  try {
    pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('password') || msg.includes('encrypt')) {
      throw new Error('This PDF is password protected. Please unlock it and try again.');
    }
    throw new Error("We couldn't read this PDF. Please try another file.");
  }

  const pageCount = pdfLibDoc.getPageCount();
  if (pageCount === 0) {
    throw new Error('This PDF contains no pages.');
  }

  onProgress?.(40, `Analyzing ${pageCount} pages for document patterns...`);

  // Attempt to load PDF.js for text extraction and thumbnail rendering
  const pages: PageMetadata[] = [];
  let pdfJsDoc: any = null;

  try {
    const pLib = await getPdfJs();
    if (pLib) {
      const loadingTask = pLib.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0)),
        isEvalSupported: false,
        useWorkerFetch: false,
      });
      pdfJsDoc = await loadingTask.promise;
    }
  } catch (e) {
    console.warn('PDF.js parsing failed, fallback to structural parsing', e);
  }

  // Iterate over each page
  for (let i = 1; i <= pageCount; i++) {
    const pageIndex = i - 1;
    const pdfLibPage = pdfLibDoc.getPage(pageIndex);
    const { width, height } = pdfLibPage.getSize();
    const rotation = pdfLibPage.getRotation().angle;
    const isLandscape = width > height;

    let text = '';
    let thumbnailUrl: string | undefined;

    if (pdfJsDoc) {
      try {
        const page = await pdfJsDoc.getPage(i);
        const textContent = await page.getTextContent();
        text = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Render thumbnail (limit resolution to save memory)
        thumbnailUrl = await renderPageThumbnail(pdfJsDoc, i);
      } catch (err) {
        console.warn(`Could not read text for page ${i}`, err);
      }
    }

    const isBlank = text.length < 15;
    const firstLine = text.slice(0, 120);

    // Check header keywords in top 300 characters
    const topText = text.slice(0, 300).toUpperCase();
    const hasHeaderPattern = DOCUMENT_STARTER_KEYWORDS.some((kw) => topText.includes(kw));

    // Page numbering
    const pageNumberDetected = detectPageNumber(text);

    pages.push({
      pageNumber: i,
      text,
      firstLine,
      hasHeaderPattern,
      pageNumberDetected,
      isBlank,
      width,
      height,
      isLandscape,
      isDocumentStartCandidate: false,
      confidenceScore: 0,
      detectionReasons: [],
      thumbnailUrl,
    });

    const percent = Math.min(85, Math.floor(40 + (i / pageCount) * 45));
    onProgress?.(percent, `Analyzing page ${i} of ${pageCount}...`);
  }

  onProgress?.(90, 'Evaluating multi-signal boundary detection...');

  return {
    file,
    name: file.name,
    size: file.size,
    pageCount,
    arrayBuffer,
    pages,
  };
}

/**
 * Detects document boundaries across pages using multiple detection signals:
 * 1. Page 1 resets (e.g. Page 1 of N or reset to 1) -> VERY HIGH SIGNAL (+50)
 * 2. New title/header patterns (Invoice, Agreement, Statement, Report...) -> HIGH SIGNAL (+35)
 * 3. Page layout / orientation change -> MEDIUM SIGNAL (+20)
 * 4. Post-blank separator page (page following blank separator) -> HIGH SIGNAL (+30)
 * 5. Page 1 is always the start of Document 1
 */
export function detectDocumentBoundaries(pages: PageMetadata[]): {
  documents: DetectedDocument[];
  inconclusive: boolean;
} {
  if (pages.length === 0) {
    return { documents: [], inconclusive: true };
  }

  const n = pages.length;

  // Mark page 1 as start of Document 1
  pages[0].isDocumentStartCandidate = true;
  pages[0].confidenceScore = 100;
  pages[0].detectionReasons = ['First page of combined document'];

  const splitPoints: number[] = [1]; // 1-indexed start page numbers

  for (let i = 1; i < n; i++) {
    const curPage = pages[i];
    const prevPage = pages[i - 1];
    let score = 0;
    const reasons: string[] = [];

    // SIGNAL 1: Page Numbering Reset
    if (curPage.pageNumberDetected) {
      if (curPage.pageNumberDetected.current === 1) {
        score += 55;
        reasons.push(
          `Page numbering reset (${curPage.pageNumberDetected.raw})`
        );
      } else if (
        prevPage.pageNumberDetected &&
        prevPage.pageNumberDetected.total &&
        prevPage.pageNumberDetected.current === prevPage.pageNumberDetected.total
      ) {
        // Previous page was the final page of its document (e.g. Page 3 of 3)
        score += 50;
        reasons.push(
          `Follows previous document end (${prevPage.pageNumberDetected.raw})`
        );
      }
    }

    // SIGNAL 2: Document Starter Header Pattern
    if (curPage.hasHeaderPattern) {
      score += 35;
      const matchedKw = DOCUMENT_STARTER_KEYWORDS.find((kw) =>
        curPage.text.slice(0, 300).toUpperCase().includes(kw)
      );
      reasons.push(`Detected document title/header pattern ("${matchedKw}")`);
    }

    // SIGNAL 3: Post-Blank Separator
    if (prevPage.isBlank && !curPage.isBlank) {
      score += 40;
      reasons.push('Follows blank separator page');
    }

    // SIGNAL 4: Layout & Orientation Shift
    if (curPage.isLandscape !== prevPage.isLandscape) {
      score += 20;
      reasons.push(
        `Orientation shifted (${prevPage.isLandscape ? 'Landscape' : 'Portrait'} → ${
          curPage.isLandscape ? 'Landscape' : 'Portrait'
        })`
      );
    } else if (
      Math.abs(curPage.width - prevPage.width) > 30 ||
      Math.abs(curPage.height - prevPage.height) > 30
    ) {
      score += 15;
      reasons.push('Page dimensions shifted significantly');
    }

    curPage.confidenceScore = score;
    curPage.detectionReasons = reasons;

    // Threshold for automatic split candidate
    if (score >= 35) {
      curPage.isDocumentStartCandidate = true;
      splitPoints.push(curPage.pageNumber);
    }
  }

  // If only 1 document detected for a multi-page document and no confidence,
  // or if split points didn't identify boundaries
  const inconclusive = splitPoints.length === 1 && n > 1;

  // Build document boundary list
  const documents: DetectedDocument[] = [];
  for (let i = 0; i < splitPoints.length; i++) {
    const start = splitPoints[i];
    const end = i + 1 < splitPoints.length ? splitPoints[i + 1] - 1 : n;
    const pageCount = end - start + 1;
    const pageMeta = pages[start - 1];

    let confidence: 'high' | 'medium' | 'manual' = 'high';
    if (start === 1 && splitPoints.length === 1) {
      confidence = 'medium';
    } else if (pageMeta.confidenceScore < 45 && start !== 1) {
      confidence = 'medium';
    }

    const docIndex = String(i + 1).padStart(2, '0');
    documents.push({
      id: `doc-${i + 1}-${Date.now()}`,
      name: `Document-${docIndex}.pdf`,
      startPage: start,
      endPage: end,
      pageCount,
      confidence,
      signals: pageMeta.detectionReasons.length > 0 ? pageMeta.detectionReasons : ['Detected document boundary'],
    });
  }

  return { documents, inconclusive };
}

/**
 * Creates separate PDF files from original document bytes using pdf-lib.
 * Preserves 100% vector resolution, original fonts, metadata, and embedded images.
 */
export async function createSeparatePdfs(
  originalArrayBuffer: ArrayBuffer,
  boundaries: DetectedDocument[],
  onProgress?: (percent: number, message: string) => void
): Promise<GeneratedPdfFile[]> {
  onProgress?.(10, 'Loading master document into engine...');
  const originalPdf = await PDFDocument.load(originalArrayBuffer);

  const totalDocs = boundaries.length;
  const results: GeneratedPdfFile[] = [];

  for (let idx = 0; idx < totalDocs; idx++) {
    const docDef = boundaries[idx];
    const stepPercent = Math.min(90, Math.floor(15 + ((idx + 1) / totalDocs) * 75));
    onProgress?.(stepPercent, `Generating ${docDef.name} (pages ${docDef.startPage}–${docDef.endPage})...`);

    const newDoc = await PDFDocument.create();

    // Collect 0-indexed page indices
    const pageIndices: number[] = [];
    for (let p = docDef.startPage; p <= docDef.endPage; p++) {
      pageIndices.push(p - 1);
    }

    // Copy exact original pages with all assets, vectors, and fonts
    const copiedPages = await newDoc.copyPages(originalPdf, pageIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    // Save as Uint8Array
    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    results.push({
      id: docDef.id,
      name: docDef.name.endsWith('.pdf') ? docDef.name : `${docDef.name}.pdf`,
      startPage: docDef.startPage,
      endPage: docDef.endPage,
      pageCount: docDef.pageCount,
      size: blob.size,
      blob,
      downloadUrl,
    });
  }

  onProgress?.(100, 'All separate PDFs generated successfully!');
  return results;
}

/**
 * Packages all generated PDFs into a real ZIP archive using JSZip
 */
export async function createZipArchive(
  files: GeneratedPdfFile[],
  zipFilename = 'PDF-Split-Extract-All-Documents.zip'
): Promise<{ blob: Blob; downloadUrl: string; filename: string }> {
  const zip = new JSZip();

  // Deduplicate file names if any collision
  const usedNames = new Set<string>();
  for (const file of files) {
    let name = file.name;
    if (usedNames.has(name)) {
      const extIndex = name.lastIndexOf('.');
      const base = extIndex > 0 ? name.substring(0, extIndex) : name;
      const ext = extIndex > 0 ? name.substring(extIndex) : '.pdf';
      name = `${base}_${file.startPage}-${file.endPage}${ext}`;
    }
    usedNames.add(name);

    const arrayBuffer = await file.blob.arrayBuffer();
    zip.file(name, arrayBuffer);
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const downloadUrl = URL.createObjectURL(zipBlob);
  return {
    blob: zipBlob,
    downloadUrl,
    filename: zipFilename,
  };
}

/**
 * Triggers native browser download for a Blob
 */
export function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formats bytes into a human readable string (e.g. "24.6 MB")
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
