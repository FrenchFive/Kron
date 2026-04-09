import JSZip from 'jszip';
import type { WordSequence, Chapter } from '@/engine/wordSequence';
import { parseText } from './textParser';

export async function parseEpub(buffer: ArrayBuffer, documentId: string): Promise<WordSequence> {
  const zip = await JSZip.loadAsync(buffer);

  // Read container.xml to find content.opf path
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Invalid EPUB: missing container.xml');

  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, 'text/xml');
  const rootfileEl = containerDoc.querySelector('rootfile');
  const opfPath = rootfileEl?.getAttribute('full-path');
  if (!opfPath) throw new Error('Invalid EPUB: missing rootfile path');

  // Determine base directory of the OPF file
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  // Read content.opf
  const opfXml = await zip.file(opfPath)?.async('text');
  if (!opfXml) throw new Error('Invalid EPUB: missing content.opf');

  const opfDoc = parser.parseFromString(opfXml, 'text/xml');

  // Build manifest map: id → href
  const manifestMap = new Map<string, string>();
  const manifestItems = opfDoc.querySelectorAll('manifest > item');
  for (const item of manifestItems) {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) manifestMap.set(id, href);
  }

  // Get spine order (reading order)
  const spineItems = opfDoc.querySelectorAll('spine > itemref');
  const spineIds: string[] = [];
  for (const item of spineItems) {
    const idref = item.getAttribute('idref');
    if (idref) spineIds.push(idref);
  }

  // Process each chapter in spine order
  const chapters: Chapter[] = [];
  let globalIndex = 0;

  for (let ci = 0; ci < spineIds.length; ci++) {
    const href = manifestMap.get(spineIds[ci]);
    if (!href) continue;

    const filePath = opfDir + href;
    const htmlContent = await zip.file(filePath)?.async('text');
    if (!htmlContent) continue;

    // Parse HTML and extract text
    const chapterDoc = parser.parseFromString(htmlContent, 'text/html');
    const textContent = chapterDoc.body?.textContent?.trim() ?? '';
    if (!textContent) continue;

    // Try to get chapter title
    const titleEl = chapterDoc.querySelector('title, h1, h2, h3');
    const chapterTitle = titleEl?.textContent?.trim() || `Chapter ${ci + 1}`;

    // Parse text
    const chapterWs = parseText(textContent, documentId);
    if (chapterWs.totalWords === 0) continue;

    // Re-index with global offset
    const chapter: Chapter = {
      title: chapterTitle,
      startIndex: globalIndex,
      paragraphs: chapterWs.chapters[0].paragraphs.map(p => ({
        startIndex: p.startIndex + globalIndex,
        sentences: p.sentences.map(s => ({
          startIndex: s.startIndex + globalIndex,
          words: s.words.map(w => ({
            ...w,
            index: w.index + globalIndex,
          })),
        })),
      })),
    };

    globalIndex += chapterWs.totalWords;
    chapters.push(chapter);
  }

  return { documentId, chapters, totalWords: globalIndex };
}
