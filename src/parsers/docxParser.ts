import mammoth from 'mammoth';
import type { WordSequence } from '@/engine/wordSequence';
import { parseText } from './textParser';

export async function parseDocx(
  buffer: ArrayBuffer,
  documentId: string,
  title: string
): Promise<WordSequence> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = result.value;

  const ws = parseText(text, documentId);
  if (ws.chapters.length > 0) {
    ws.chapters[0].title = title;
  }

  return ws;
}
