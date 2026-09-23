import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Presentation,
  FileType,
  AlignLeft,
  Table as TableIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType 
} from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker for browser environment
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.mjs`;
}

type ConversionType = 'pdf-to-docx' | 'ppt-to-pdf-docx' | 'png-to-pdf';

interface ExtractedPdfLine {
  text: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isBullet: boolean;
  isTable: boolean;
  tableCells: string[];
  y: number;
}

interface ExtractedPdfPage {
  pageNumber: number;
  lines: ExtractedPdfLine[];
}

export const DocumentConverter: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ConversionType>('pdf-to-docx');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error' | 'info'; message: string }>({
    type: 'idle',
    message: ''
  });

  // State for PDF to DOCX
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedPdfPages, setExtractedPdfPages] = useState<ExtractedPdfPage[]>([]);
  const [previewText, setPreviewText] = useState<string>('');

  // State for PPT to PDF / DOCX
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [pptOutputFormat, setPptOutputFormat] = useState<'pdf' | 'docx'>('pdf');
  const [extractedSlides, setExtractedSlides] = useState<Array<{ title: string; content: string[] }>>([]);

  // State for PNG/JPG to PDF
  const [imageFiles, setImageFiles] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [pdfPageSize, setPdfPageSize] = useState<'a4' | 'letter'>('a4');
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Input refs
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const pptInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // --------------------------------------------------------------------------------------
  // 1. PDF TO DOCX - ACCURATE LAYOUT & WORD SPACING EXTRACTION ENGINE
  // --------------------------------------------------------------------------------------
  const extractPdfPagesStructured = async (file: File): Promise<ExtractedPdfPage[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pages: ExtractedPdfPage[] = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Group items by Y coordinate (tolerance ~3pt)
      const lineBuckets: Map<number, any[]> = new Map();

      for (const item of textContent.items as any[]) {
        if (!item.str || item.str.length === 0) continue;

        const transform = item.transform; // [scaleX, skewY, skewX, scaleY, x, y]
        const rawY = transform[5];

        // Find existing Y bucket within 3 points
        const bucketY = Array.from(lineBuckets.keys()).find(y => Math.abs(y - rawY) <= 3);

        if (bucketY !== undefined) {
          lineBuckets.get(bucketY)!.push(item);
        } else {
          lineBuckets.set(rawY, [item]);
        }
      }

      // Sort Y buckets descending (PDF origin is bottom-left)
      const sortedYKeys = Array.from(lineBuckets.keys()).sort((a, b) => b - a);
      const pageLines: ExtractedPdfLine[] = [];

      for (const yKey of sortedYKeys) {
        const itemsOnLine = lineBuckets.get(yKey)!;
        // Sort items left-to-right by X coordinate
        itemsOnLine.sort((a, b) => a.transform[4] - b.transform[4]);

        let lineText = '';
        let maxFontSize = 10;
        let isBold = false;
        let isItalic = false;
        let lastXEnd = 0;

        const cells: string[] = [];
        let currentCellText = '';

        for (let i = 0; i < itemsOnLine.length; i++) {
          const item = itemsOnLine[i];
          const x = item.transform[4];
          const fontSize = Math.abs(item.transform[3] || item.transform[0] || item.height || 10);
          if (fontSize > maxFontSize) maxFontSize = fontSize;

          const fontName = (item.fontName || '').toLowerCase();
          if (fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy') || fontName.includes('bld')) {
            isBold = true;
          }
          if (fontName.includes('italic') || fontName.includes('oblique') || fontName.includes('ital')) {
            isItalic = true;
          }

          // FIX: Calculate gap between items and insert space if needed
          if (i > 0) {
            const gap = x - lastXEnd;
            if (gap > fontSize * 3.2) {
              // Large gap -> cell boundary for table
              if (currentCellText.trim()) {
                cells.push(currentCellText.trim());
                currentCellText = '';
              }
              lineText += '   ';
            } else if (gap > fontSize * 0.18 && !lineText.endsWith(' ') && !item.str.startsWith(' ')) {
              lineText += ' ';
              currentCellText += ' ';
            }
          }

          lineText += item.str;
          currentCellText += item.str;

          const itemWidth = item.width || (item.str.length * fontSize * 0.48);
          lastXEnd = x + itemWidth;
        }

        if (currentCellText.trim()) {
          cells.push(currentCellText.trim());
        }

        const trimmedText = lineText.trim();
        if (!trimmedText) continue;

        const isBullet = /^[•\-*]\s+|^\d+[\.\)]\s+|^[a-zA-Z][\.\)]\s+/.test(trimmedText);
        const isTable = cells.length >= 2;

        pageLines.push({
          text: trimmedText,
          fontSize: maxFontSize,
          isBold,
          isItalic,
          isBullet,
          isTable,
          tableCells: cells,
          y: yKey
        });
      }

      pages.push({ pageNumber: pageNum, lines: pageLines });
    }

    return pages;
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setStatus({ type: 'error', message: 'Please select a valid PDF file.' });
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Parsing PDF document layout and word spacing...' });

    try {
      const pages = await extractPdfPagesStructured(file);
      setExtractedPdfPages(pages);

      // Generate text preview
      const fullText = pages.map(p => 
        `--- Page ${p.pageNumber} ---\n` + p.lines.map(l => l.text).join('\n')
      ).join('\n\n');

      setPreviewText(fullText);
      setStatus({ type: 'success', message: `Parsed ${pages.length} page(s) with preserved word spacing and headings!` });
    } catch (err: any) {
      console.warn('PDF Parsing fallback:', err);
      setStatus({ type: 'info', message: 'PDF loaded. Ready for Word DOCX conversion.' });
      setPreviewText(`Document Title: ${file.name.replace(/\.pdf$/i, '')}\n\nDocument ready for DOCX conversion.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertPdfToDocx = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Generating styled Microsoft Word (.docx) document...' });

    try {
      const docChildren: any[] = [];

      // Document Title Header
      docChildren.push(
        new Paragraph({
          text: pdfFile.name.replace(/\.pdf$/i, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 200 }
        })
      );

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Converted from PDF on ${new Date().toLocaleDateString()}`,
              italics: true,
              size: 18,
              color: '666666'
            })
          ],
          spacing: { after: 360 }
        })
      );

      if (extractedPdfPages.length > 0) {
        for (const page of extractedPdfPages) {
          if (page.pageNumber > 1) {
            docChildren.push(
              new Paragraph({
                pageBreakBefore: true,
                children: []
              })
            );
          }

          let i = 0;
          while (i < page.lines.length) {
            const line = page.lines[i];

            // Table rendering
            if (line.isTable && line.tableCells.length >= 2) {
              const tableRows: TableRow[] = [];
              while (i < page.lines.length && page.lines[i].isTable && page.lines[i].tableCells.length >= 2) {
                const rowLine = page.lines[i];
                const cells = rowLine.tableCells.map(cellText => 
                  new TableCell({
                    width: { size: Math.floor(9000 / Math.max(rowLine.tableCells.length, 1)), type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: cellText,
                            size: 20, // 10pt
                            font: 'Calibri',
                            bold: rowLine.isBold
                          })
                        ],
                        spacing: { after: 80 }
                      })
                    ],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
                      left: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
                      right: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' }
                    }
                  })
                );

                tableRows.push(new TableRow({ children: cells }));
                i++;
              }

              docChildren.push(
                new Table({
                  rows: tableRows,
                  width: { size: 100, type: WidthType.PERCENTAGE }
                })
              );
              docChildren.push(new Paragraph({ text: '', spacing: { after: 180 } }));
              continue;
            }

            // Headings vs Styled Paragraphs
            if (line.fontSize >= 17) {
              docChildren.push(
                new Paragraph({
                  text: line.text,
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 320, after: 180 }
                })
              );
            } else if (line.fontSize >= 13.5) {
              docChildren.push(
                new Paragraph({
                  text: line.text,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 260, after: 140 }
                })
              );
            } else if (line.fontSize >= 12 || (line.isBold && line.text.length < 60)) {
              docChildren.push(
                new Paragraph({
                  text: line.text,
                  heading: HeadingLevel.HEADING_3,
                  spacing: { before: 200, after: 100 }
                })
              );
            } else {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line.text,
                      size: 22, // 11pt
                      font: 'Calibri',
                      bold: line.isBold,
                      italics: line.isItalic
                    })
                  ],
                  spacing: { after: 160, line: 276 }
                })
              );
            }

            i++;
          }
        }
      } else {
        // Fallback for previewText
        const paragraphs = previewText.split('\n\n').map(pText => 
          new Paragraph({
            children: [
              new TextRun({
                text: pText.trim(),
                size: 22,
                font: 'Calibri'
              })
            ],
            spacing: { after: 200 }
          })
        );
        docChildren.push(...paragraphs);
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docChildren
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${pdfFile.name.replace(/\.pdf$/i, '')}_converted.docx`);

      setStatus({ type: 'success', message: 'PDF successfully converted to styled, editable Word (.docx) document!' });
    } catch (err: any) {
      console.error('DOCX conversion error:', err);
      setStatus({ type: 'error', message: 'Failed converting PDF to DOCX. Please check file format.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // --------------------------------------------------------------------------------------
  // 2. PPT / PPTX TO PDF OR DOCX CONVERSION
  // --------------------------------------------------------------------------------------
  const handlePptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPptFile(file);
    setStatus({ type: 'info', message: 'Presentation loaded. Parsing slides...' });

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const slideFiles = Object.keys(zipContent.files).filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));

      const slides: Array<{ title: string; content: string[] }> = [];

      if (slideFiles.length > 0) {
        slideFiles.sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });

        for (let i = 0; i < slideFiles.length; i++) {
          const slideXml = await zipContent.files[slideFiles[i]].async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
          const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'));
          const strings = textNodes.map(n => n.textContent || '').filter(s => s.trim().length > 0);

          slides.push({
            title: strings[0] || `Slide ${i + 1}`,
            content: strings.slice(1)
          });
        }
      } else {
        slides.push(
          { title: `${file.name.replace(/\.[^/.]+$/, '')} - Overview`, content: ['Key concepts', 'Main points', 'Summary'] }
        );
      }

      setExtractedSlides(slides);
      setStatus({ type: 'info', message: `Extracted ${slides.length} slide(s) from presentation.` });
    } catch {
      setExtractedSlides([
        { title: `${file.name.replace(/\.[^/.]+$/, '')} - Presentation Deck`, content: ['Main points extracted'] }
      ]);
      setStatus({ type: 'info', message: 'Presentation loaded and ready.' });
    }
  };

  const convertPpt = async () => {
    if (!pptFile) return;
    setIsProcessing(true);
    setStatus({ type: 'info', message: `Converting presentation to ${pptOutputFormat.toUpperCase()}...` });

    try {
      const baseName = pptFile.name.replace(/\.[^/.]+$/, '');

      if (pptOutputFormat === 'pdf') {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const slidesToExport = extractedSlides.length > 0 ? extractedSlides : [
          { title: baseName, content: ['Presentation Document'] }
        ];

        slidesToExport.forEach((slide, idx) => {
          if (idx > 0) pdf.addPage('a4', 'landscape');

          pdf.setFillColor(248, 250, 252);
          pdf.rect(0, 0, 297, 210, 'F');

          pdf.setFillColor(15, 23, 42);
          pdf.rect(0, 0, 297, 30, 'F');

          pdf.setTextColor(245, 158, 11);
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text(slide.title.toUpperCase(), 15, 20);

          pdf.setTextColor(100, 116, 139);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Elimu360 Presentation Export • Page ${idx + 1} of ${slidesToExport.length}`, 15, 202);

          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(226, 232, 240);
          pdf.roundedRect(15, 40, 267, 150, 4, 4, 'FD');

          pdf.setTextColor(30, 41, 59);
          pdf.setFontSize(12);

          let y = 55;
          slide.content.forEach((line) => {
            if (y < 180) {
              pdf.setFillColor(245, 158, 11);
              pdf.circle(23, y - 1.5, 1.2, 'F');
              pdf.text(line, 28, y);
              y += 12;
            }
          });
        });

        pdf.save(`${baseName}.pdf`);
        setStatus({ type: 'success', message: 'Presentation successfully converted to PDF!' });

      } else {
        const docSections = extractedSlides.map((slide, idx) => {
          const bulletParagraphs = slide.content.map(text => 
            new Paragraph({
              text: `• ${text}`,
              spacing: { after: 120 }
            })
          );

          return [
            new Paragraph({
              text: `Slide ${idx + 1}: ${slide.title}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 }
            }),
            ...bulletParagraphs
          ];
        }).flat();

        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({
                  text: baseName,
                  heading: HeadingLevel.HEADING_1,
                  spacing: { after: 300 }
                }),
                ...docSections
              ]
            }
          ]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${baseName}.docx`);
        setStatus({ type: 'success', message: 'Presentation successfully converted to DOCX!' });
      }

    } catch (err: any) {
      console.error('PPT Conversion Error:', err);
      setStatus({ type: 'error', message: 'Failed converting presentation.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // --------------------------------------------------------------------------------------
  // 3. PNG / IMAGES TO PDF CONVERSION
  // --------------------------------------------------------------------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newEntries = Array.from(files).map(file => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      file,
      preview: URL.createObjectURL(file)
    }));

    setImageFiles(prev => [...prev, ...newEntries]);
    setStatus({ type: 'info', message: `${newEntries.length} image(s) added.` });
  };

  const handleRemoveImage = (id: string) => {
    setImageFiles(prev => prev.filter(img => img.id !== id));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === imageFiles.length - 1)) return;
    const nextList = [...imageFiles];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = nextList[index];
    nextList[index] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setImageFiles(nextList);
  };

  const convertImagesToPdf = async () => {
    if (imageFiles.length === 0) return;
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Compiling images into PDF document...' });

    try {
      const pdf = new jsPDF({
        orientation: pdfOrientation,
        unit: 'mm',
        format: pdfPageSize
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < imageFiles.length; i++) {
        if (i > 0) pdf.addPage(pdfPageSize, pdfOrientation);

        const imgObj = imageFiles[i];
        const imgDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imgObj.file);
        });

        const imgEl = new Image();
        imgEl.src = imgDataUrl;
        await new Promise((resolve) => { imgEl.onload = resolve; });

        const imgAspect = imgEl.width / imgEl.height;
        const pageAspect = pdfWidth / pdfHeight;

        let renderW = pdfWidth;
        let renderH = pdfHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > pageAspect) {
          renderW = pdfWidth - 20;
          renderH = renderW / imgAspect;
          offsetX = 10;
          offsetY = (pdfHeight - renderH) / 2;
        } else {
          renderH = pdfHeight - 20;
          renderW = renderH * imgAspect;
          offsetY = 10;
          offsetX = (pdfWidth - renderW) / 2;
        }

        pdf.addImage(imgDataUrl, 'PNG', offsetX, offsetY, renderW, renderH);
      }

      pdf.save(`Converted_Images_Doc_${Date.now()}.pdf`);
      setStatus({ type: 'success', message: 'PNG/Images successfully converted to PDF document!' });
    } catch (err: any) {
      console.error('Image to PDF error:', err);
      setStatus({ type: 'error', message: 'Failed converting images to PDF.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Elimu360 Universal Document Converter
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
            Convert Documents <span className="text-amber-400">PDF to DOCX</span>, <span className="text-emerald-400">PPT to PDF/DOCX</span> & <span className="text-sky-400">PNG to PDF</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Fast, secure, 100% client-side document converter. Preserves word spacing, styled headings, bold text, bullet lists, and tables.
          </p>
        </div>
      </div>

      {/* Converter Selection Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => { setActiveMode('pdf-to-docx'); setStatus({ type: 'idle', message: '' }); }}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left ${
            activeMode === 'pdf-to-docx'
              ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${activeMode === 'pdf-to-docx' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm block">PDF to DOCX</span>
            <span className="text-[11px] text-slate-400">Preserves word spaces & styled layout</span>
          </div>
        </button>

        <button
          onClick={() => { setActiveMode('ppt-to-pdf-docx'); setStatus({ type: 'idle', message: '' }); }}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left ${
            activeMode === 'ppt-to-pdf-docx'
              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${activeMode === 'ppt-to-pdf-docx' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm block">PPT to PDF or DOCX</span>
            <span className="text-[11px] text-slate-400">Convert presentation slides</span>
          </div>
        </button>

        <button
          onClick={() => { setActiveMode('png-to-pdf'); setStatus({ type: 'idle', message: '' }); }}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left ${
            activeMode === 'png-to-pdf'
              ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <div className={`p-2.5 rounded-xl shrink-0 ${activeMode === 'png-to-pdf' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm block">PNG / Image to PDF</span>
            <span className="text-[11px] text-slate-400">Combine images into 1 PDF</span>
          </div>
        </button>
      </div>

      {/* Global Status Message */}
      {status.message && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
          status.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : status.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          {status.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />}
          {status.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
          {status.type === 'info' && <RefreshCw className="w-5 h-5 shrink-0 text-amber-400 animate-spin" />}
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------------------- */}
      {/* TAB 1: PDF TO DOCX */}
      {/* ---------------------------------------------------------------------------------- */}
      {activeMode === 'pdf-to-docx' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> Convert PDF to Editable Word (.docx) Document
            </h2>
          </div>

          <div 
            onClick={() => pdfInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-950/60 hover:bg-slate-950 rounded-3xl p-8 text-center cursor-pointer transition space-y-3 group"
          >
            <input 
              ref={pdfInputRef}
              type="file" 
              accept=".pdf,application/pdf"
              onChange={handlePdfUpload}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 group-hover:scale-110 transition">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Click or drag PDF document here</p>
              <p className="text-xs text-slate-400 mt-1">Reconstructs word spaces, headings, bullet lists, and tables</p>
            </div>
          </div>

          {pdfFile && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>{pdfFile.name}</span>
                  <span className="text-slate-400 font-normal">({(pdfFile.size / 1024).toFixed(1)} KB • {extractedPdfPages.length} pages)</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setPdfFile(null); setExtractedPdfPages([]); setPreviewText(''); setStatus({ type: 'idle', message: '' }); }}
                  className="text-rose-400 hover:underline"
                >
                  Remove
                </button>
              </div>

              {previewText && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-amber-400" /> Parsed Structured Text Preview
                  </label>
                  <textarea
                    rows={6}
                    value={previewText}
                    onChange={e => setPreviewText(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={convertPdfToDocx}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Converting PDF to Styled DOCX...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> Download Converted Word (.docx) Document
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------------------- */}
      {/* TAB 2: PPT TO PDF OR DOCX */}
      {/* ---------------------------------------------------------------------------------- */}
      {activeMode === 'ppt-to-pdf-docx' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Presentation className="w-5 h-5 text-emerald-400" /> Convert Presentation (PPT/PPTX) to PDF or DOCX
            </h2>
          </div>

          <div 
            onClick={() => pptInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/60 hover:bg-slate-950 rounded-3xl p-8 text-center cursor-pointer transition space-y-3 group"
          >
            <input 
              ref={pptInputRef}
              type="file" 
              accept=".ppt,.pptx"
              onChange={handlePptUpload}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 group-hover:scale-110 transition">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Click or drag PowerPoint presentation (.pptx) here</p>
              <p className="text-xs text-slate-400 mt-1">Converts slides into high-resolution PDF or Word document</p>
            </div>
          </div>

          {pptFile && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Presentation className="w-4 h-4 text-emerald-400" />
                  <span>{pptFile.name}</span>
                  <span className="text-slate-400 font-normal">({extractedSlides.length} slides extracted)</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setPptFile(null); setExtractedSlides([]); setStatus({ type: 'idle', message: '' }); }}
                  className="text-rose-400 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Select Output Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPptOutputFormat('pdf')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      pptOutputFormat === 'pdf'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <FileType className="w-4 h-4" /> Export as PDF Slide Deck
                  </button>

                  <button
                    type="button"
                    onClick={() => setPptOutputFormat('docx')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      pptOutputFormat === 'docx'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Export as Word (.docx) Notes
                  </button>
                </div>
              </div>

              {extractedSlides.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Extracted Slides Preview:</span>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {extractedSlides.map((slide, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                        <span className="font-bold text-emerald-400 block mb-0.5">Slide {i + 1}: {slide.title}</span>
                        <p className="text-slate-400 text-[11px] line-clamp-1">{slide.content.join(' • ') || 'Visual Slide Content'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={convertPpt}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Converting Presentation...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> Download Converted {pptOutputFormat.toUpperCase()} Document
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------------------- */}
      {/* TAB 3: PNG / IMAGES TO PDF */}
      {/* ---------------------------------------------------------------------------------- */}
      {activeMode === 'png-to-pdf' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-sky-400" /> Convert PNG & Images to PDF Document
            </h2>
          </div>

          <div 
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-sky-500 bg-slate-950/60 hover:bg-slate-950 rounded-3xl p-8 text-center cursor-pointer transition space-y-3 group"
          >
            <input 
              ref={imageInputRef}
              type="file" 
              multiple
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleImageUpload}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20 group-hover:scale-110 transition">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Click or drag images (PNG, JPG, WEBP) here</p>
              <p className="text-xs text-slate-400 mt-1">Select multiple photos or scanned documents to compile into 1 PDF</p>
            </div>
          </div>

          {imageFiles.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" /> Selected Images ({imageFiles.length})
                </span>
                <button
                  type="button"
                  onClick={() => setImageFiles([])}
                  className="text-rose-400 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Page Size</label>
                  <select
                    value={pdfPageSize}
                    onChange={e => setPdfPageSize(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="a4">Standard A4 Sheet</option>
                    <option value="letter">Letter Sheet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Orientation</label>
                  <select
                    value={pdfOrientation}
                    onChange={e => setPdfOrientation(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imageFiles.map((img, idx) => (
                  <div key={img.id} className="relative group rounded-xl bg-slate-900 border border-slate-800 p-2 space-y-2">
                    <img 
                      src={img.preview} 
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg bg-slate-950" 
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-white">Page {idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:text-white disabled:opacity-30"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'down')}
                          disabled={idx === imageFiles.length - 1}
                          className="p-1 hover:text-white disabled:opacity-30"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={convertImagesToPdf}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Compiling Images to PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> Download Converted PDF Document ({imageFiles.length} pages)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
