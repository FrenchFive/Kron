import { Readability } from '@mozilla/readability';
import { parseText } from './textParser';
import type { WordSequence } from '@/engine/wordSequence';

export function parseHtml(html: string, documentId: string): WordSequence {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const reader = new Readability(doc);
  const article = reader.parse();

  if (!article || !article.textContent?.trim()) {
    return { documentId, chapters: [], totalWords: 0 };
  }

  const ws = parseText(article.textContent, documentId);
  if (ws.chapters.length > 0) {
    ws.chapters[0].title = article.title || ws.chapters[0].title;
  }

  return ws;
}
