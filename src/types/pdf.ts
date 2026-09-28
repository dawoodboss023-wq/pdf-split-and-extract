/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PageMetadata {
  pageNumber: number; // 1-indexed
  text: string;
  firstLine: string;
  hasHeaderPattern: boolean;
  pageNumberDetected?: {
    current: number;
    total?: number;
    raw: string;
  };
  isBlank: boolean;
  width: number;
  height: number;
  isLandscape: boolean;
  isDocumentStartCandidate: boolean;
  confidenceScore: number;
  detectionReasons: string[];
  thumbnailUrl?: string;
}

export interface DetectedDocument {
  id: string;
  name: string;
  startPage: number;
  endPage: number;
  pageCount: number;
  confidence: 'high' | 'medium' | 'manual';
  signals: string[];
}

export interface UploadedPdfInfo {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
  pages: PageMetadata[];
  isEncrypted?: boolean;
}

export interface GeneratedPdfFile {
  id: string;
  name: string;
  startPage: number;
  endPage: number;
  pageCount: number;
  size: number;
  blob: Blob;
  downloadUrl: string;
}

export type AppStep = 'upload' | 'analyzing' | 'review' | 'splitting' | 'results';
