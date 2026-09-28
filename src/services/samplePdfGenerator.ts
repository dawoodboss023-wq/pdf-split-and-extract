/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generates a realistic multi-document combined PDF for testing and demonstration.
 * Contains 3 distinct multi-page documents (total 7 pages) with realistic headers,
 * page number resets (e.g. Page 1 of 2, Page 1 of 3), and layout elements.
 */
export async function generateSampleCombinedPdf(): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawHeaderBar = (page: any, title: string, subtitle: string, r = 0.9, g = 0.22, b = 0.21) => {
    const { width, height } = page.getSize();
    // Top colored banner
    page.drawRectangle({
      x: 40,
      y: height - 80,
      width: width - 80,
      height: 40,
      color: rgb(r, g, b),
    });
    page.drawText(title, {
      x: 55,
      y: height - 65,
      size: 16,
      font: fontHelveticaBold,
      color: rgb(1, 1, 1),
    });
    page.drawText(subtitle, {
      x: 55,
      y: height - 105,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawLine({
      start: { x: 40, y: height - 115 },
      end: { x: width - 40, y: height - 115 },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
  };

  const drawFooter = (page: any, pageStr: string, docName: string) => {
    const { width } = page.getSize();
    page.drawLine({
      start: { x: 40, y: 50 },
      end: { x: width - 40, y: 50 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    page.drawText(docName, {
      x: 40,
      y: 35,
      size: 9,
      font: fontHelvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(pageStr, {
      x: width - 110,
      y: 35,
      size: 9,
      font: fontHelveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });
  };

  // ==========================================
  // DOCUMENT 1: Commercial Invoice (Pages 1 & 2)
  // ==========================================
  // Page 1
  const doc1Page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  drawHeaderBar(doc1Page1, 'ACME LOGISTICS & FREIGHT INC.', 'INVOICE #INV-2026-4401', 0.9, 0.22, 0.21);
  doc1Page1.drawText('Bill To: Apex Global Enterprises\nDate: September 24, 2026\nPayment Terms: Net 30 Days\nDue Date: October 24, 2026', {
    x: 45,
    y: 700,
    size: 10,
    lineHeight: 16,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  doc1Page1.drawText('DESCRIPTION                                                    QTY       UNIT PRICE       TOTAL', {
    x: 45,
    y: 620,
    size: 9,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  doc1Page1.drawLine({
    start: { x: 45, y: 610 },
    end: { x: 550, y: 610 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  doc1Page1.drawText('1. Cross-Border Freight Hauling - Zone A                  4           $1,250.00         $5,000.00\n2. Warehouse Pallet Storage (30 days)                    12              $85.00         $1,020.00\n3. Port Customs Clearance Documentation                   2             $350.00           $700.00\n4. Cold Storage Monitoring Protocol                       4             $180.00           $720.00', {
    x: 45,
    y: 580,
    size: 9.5,
    lineHeight: 22,
    font: fontHelvetica,
    color: rgb(0.2, 0.2, 0.2),
  });
  doc1Page1.drawText('[Continued on next page...]', {
    x: 45,
    y: 450,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  drawFooter(doc1Page1, 'Page 1 of 2', 'Document 1: Invoice #INV-2026-4401');

  // Page 2
  const doc1Page2 = pdfDoc.addPage([595.28, 841.89]);
  drawHeaderBar(doc1Page2, 'ACME LOGISTICS & FREIGHT INC.', 'INVOICE #INV-2026-4401 (CONT.)', 0.9, 0.22, 0.21);
  doc1Page2.drawText('5. Express Courier Dispatch Surcharge                     1             $420.00           $420.00\n6. Pallet Shrink Wrap & Securing                          12              $25.00           $300.00', {
    x: 45,
    y: 700,
    size: 9.5,
    lineHeight: 22,
    font: fontHelvetica,
    color: rgb(0.2, 0.2, 0.2),
  });
  doc1Page2.drawLine({
    start: { x: 45, y: 640 },
    end: { x: 550, y: 640 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  doc1Page2.drawText('SUBTOTAL:        $8,160.00\nSALES TAX (8%):    $652.80\nTOTAL DUE:       $8,812.80', {
    x: 380,
    y: 610,
    size: 10,
    lineHeight: 18,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  doc1Page2.drawText('Wire Transfer Instructions:\nBank: JPMorgan Chase\nRouting: 021000021\nAccount: 9832749102\nThank you for your business.', {
    x: 45,
    y: 520,
    size: 9.5,
    lineHeight: 16,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  drawFooter(doc1Page2, 'Page 2 of 2', 'Document 1: Invoice #INV-2026-4401');

  // ========================================================
  // DOCUMENT 2: Master Services Agreement (Pages 3, 4 & 5)
  // ========================================================
  // Page 3 (Document 2, Page 1)
  const doc2Page1 = pdfDoc.addPage([595.28, 841.89]);
  drawHeaderBar(doc2Page1, 'STRATOS LEGAL & ADVISORY GROUP', 'MASTER SERVICES AGREEMENT - CONTRACT #MSA-881', 0.15, 0.35, 0.6);
  doc2Page1.drawText('THIS MASTER SERVICES AGREEMENT is made effective as of September 2026,\nby and between STRATOS ADVISORY GROUP ("Provider") and APEX VENTURES ("Client").\n\nRECITALS:\nWHEREAS, Provider has specialized expertise in enterprise software architectures;\nWHEREAS, Client desires to retain Provider to perform strategic technology consultation;\nNOW THEREFORE, in consideration of the mutual covenants herein, the parties agree as follows:\n\n1. SCOPE OF SERVICES\nProvider shall deliver the technical architecture design and implementation roadmaps as described\nin attached Statements of Work (SOWs) executed from time to time.\n\n2. INDEPENDENT CONTRACTOR STATUS\nProvider operates strictly as an independent contractor. Neither party is agent or employee of the other.', {
    x: 45,
    y: 700,
    size: 10,
    lineHeight: 16,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  drawFooter(doc2Page1, 'Page 1 of 3', 'Document 2: Master Services Agreement #MSA-881');

  // Page 4 (Document 2, Page 2)
  const doc2Page2 = pdfDoc.addPage([595.28, 841.89]);
  drawHeaderBar(doc2Page2, 'STRATOS LEGAL & ADVISORY GROUP', 'MASTER SERVICES AGREEMENT - SECTION 3 & 4', 0.15, 0.35, 0.6);
  doc2Page2.drawText('3. CONFIDENTIALITY AND NON-DISCLOSURE\nEach party acknowledges that during the engagement it will receive proprietary and sensitive\ninformation belonging to the other party. The Receiving Party agrees:\n(a) To hold confidential information in strict confidence;\n(b) Not to disclose information to any third party without express written consent;\n(c) To protect information with the same degree of care as its own confidential assets.\n\n4. INTELLECTUAL PROPERTY RIGHTS\nAll deliverables created exclusively for Client upon receipt of full payment shall become\nthe property of Client. Pre-existing frameworks and developer tools remain Provider property.', {
    x: 45,
    y: 700,
    size: 10,
    lineHeight: 16,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  drawFooter(doc2Page2, 'Page 2 of 3', 'Document 2: Master Services Agreement #MSA-881');

  // Page 5 (Document 2, Page 3)
  const doc2Page3 = pdfDoc.addPage([595.28, 841.89]);
  drawHeaderBar(doc2Page3, 'STRATOS LEGAL & ADVISORY GROUP', 'MASTER SERVICES AGREEMENT - EXECUTION SIGNATURES', 0.15, 0.35, 0.6);
  doc2Page3.drawText('5. TERM AND TERMINATION\nThis Agreement commences on the Effective Date and continues for a period of twelve (12) months\nunless terminated earlier upon thirty (30) days written notice.\n\n6. GOVERNING LAW AND JURISDICTION\nThis Agreement is governed by the laws of the State of California without regard to conflict of laws.\n\nIN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.\n\nPROVIDER: Stratos Advisory Group               CLIENT: Apex Ventures Inc.\nBy: /s/ Marcus Vance                           By: /s/ Elena Rostova\nTitle: Managing Principal                      Title: Chief Operating Officer\nDate: Sep 24, 2026                             Date: Sep 24, 2026', {
    x: 45,
    y: 700,
    size: 10,
    lineHeight: 16,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  drawFooter(doc2Page3, 'Page 3 of 3', 'Document 2: Master Services Agreement #MSA-881');

  // ========================================================
  // DOCUMENT 3: Executive Performance Audit (Pages 6 & 7)
  // ========================================================
  // Page 6 (Document 3, Page 1)
  const doc3Page1 = pdfDoc.addPage([595.28, 841.89]);
  drawHeaderBar(doc3Page1, 'TECHNOVISION SYSTEMS AUDIT', 'EXECUTIVE PERFORMANCE AUDIT - REPORT #REP-904', 0.18, 0.5, 0.32);
  doc3Page1.drawText('EXECUTIVE SUMMARY\nThis audit report outlines system throughput, database query latencies, and server health.\nOver the 90-day observation window, aggregate platform uptime reached 99.98%.\n\nKEY OBSERVATIONS:\n- Peak concurrent user volume increased by 38% without latency degradation.\n- Query indexing optimization reduced average response time from 142ms to 38ms.\n- Memory consumption maintained an average headroom of 42% on all clusters.\n\nRECOMMENDATION SUMMARY:\n1. Expand distributed cache cluster for regional failover redundancy.\n2. Implement automated archival of audit logs older than 180 days.', {
    x: 45,
    y: 700,
    size: 10,
    lineHeight: 16,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  drawFooter(doc3Page1, 'Page 1 of 2', 'Document 3: Performance Audit #REP-904');

  // Page 7 (Document 3, Page 2)
  const doc3Page2 = pdfDoc.addPage([595.28, 841.89]);
  drawHeaderBar(doc3Page2, 'TECHNOVISION SYSTEMS AUDIT', 'EXECUTIVE PERFORMANCE AUDIT - BENCHMARKS & SIGN-OFF', 0.18, 0.5, 0.32);
  doc3Page2.drawText('BENCHMARK METRICS SUMMARY:\nComponent              Baseline       Target         Observed Status\nAPI Gateway            < 50ms         < 35ms         28ms     PASSED\nDatabase Cache Hit     > 85%          > 92%          94.4%    PASSED\nStorage I/O Latency    < 12ms         < 8ms          4.2ms    PASSED\nWorker Queue Lag       < 500ms        < 200ms        65ms     PASSED\n\nFINAL CERTIFICATION:\nThe engineering infrastructure meets all contractual reliability benchmarks for enterprise launch.\n\nLead Auditor: Dr. Sarah Lin, PE, CISSP\nVerification Code: CERT-AUDIT-2026-9042', {
    x: 45,
    y: 700,
    size: 10,
    lineHeight: 16,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  drawFooter(doc3Page2, 'Page 2 of 2', 'Document 3: Performance Audit #REP-904');

  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes.buffer as ArrayBuffer], 'sample-combined-documents.pdf', { type: 'application/pdf' });
}
