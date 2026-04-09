import * as pdfjsLib from 'pdfjs-dist';
import type { WordSequence } from '@/engine/wordSequence';
import { parseText } from './textParser';

// Set worker source — use the bundled worker from pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function parsePdf(
  buffer: ArrayBuffer,
  documentId: string,
  title: string
): Promise<WordSequence> {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    let lastY: number | null = null;
    const lines: string[] = [];
    let currentLine = '';

    for (const item of content.items) {
      if ('str' in item) {
        const y = (item as { transform: number[] }).transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 2) {
          lines.push(currentLine);
          currentLine = '';
        }
        currentLine += item.str + ' ';
        lastY = y;
      }
    }
    if (currentLine) lines.push(currentLine);

    textParts.push(lines.join('\n'));
  }

  const fullText = textParts.join('\n\n');

  if (fullText.trim().split(/\s+/).length < 50 && pdf.numPages > 3) {
    console.warn('PDF may be image-based — very little text extracted relative to page count.');
  }

  const ws = parseText(fullText, documentId);
  if (ws.chapters.length > 0) {
    ws.chapters[0].title = title;
  }

  return ws;
}
