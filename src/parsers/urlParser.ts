import { Readability } from '@mozilla/readability';
import { parseText } from './textParser';
import type { WordSequence } from '@/engine/wordSequence';

export async function parseUrl(url: string, documentId: string): Promise<{
  wordSequence: WordSequence;
  title: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch {
    throw new Error("Couldn't reach this URL. Check the link and try again.");
  } finally {
    clearTimeout(timeout);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('html') && !contentType.includes('text')) {
    throw new Error("This URL doesn't point to a readable page.");
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Fix relative URLs for images, links, etc. by setting base
  const base = doc.createElement('base');
  base.href = url;
  doc.head.prepend(base);

  const reader = new Readability(doc);
  const article = reader.parse();

  if (!article || !article.textContent?.trim()) {
    throw new Error("Couldn't extract readable text from this page.");
  }

  const ws = parseText(article.textContent, documentId);
  const title = article.title || 'Untitled';
  if (ws.chapters.length > 0) {
    ws.chapters[0].title = title;
  }

  return { wordSequence: ws, title };
}
