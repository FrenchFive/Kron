import type { WordSequence, Chapter } from '@/engine/wordSequence';
import { parseText } from './textParser';

function stripMarkdown(text: string): string {
  return text
    // Remove images ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Convert links [text](url) → text
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    // Remove bold/italic markers
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove blockquote markers
    .replace(/^>\s?/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s/gm, '')
    .replace(/^[\s]*\d+\.\s/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n');
}

export function parseMarkdown(md: string, documentId: string): WordSequence {
  // Split by ## headings for chapters
  const chapterRegex = /^##\s+(.+)$/gm;
  const parts: { title: string; content: string }[] = [];

  let match: RegExpExecArray | null;
  const headingPositions: { title: string; index: number }[] = [];

  while ((match = chapterRegex.exec(md)) !== null) {
    headingPositions.push({ title: match[1].trim(), index: match.index });
  }

  if (headingPositions.length === 0) {
    // No ## headings — treat as single chapter
    // Check for a # heading as title
    const h1Match = md.match(/^#\s+(.+)$/m);
    const title = h1Match ? h1Match[1].trim() : 'Untitled';
    const content = md.replace(/^#\s+.+$/m, '').trim();
    const stripped = stripMarkdown(content);
    const ws = parseText(stripped, documentId);
    if (ws.chapters.length > 0) {
      ws.chapters[0].title = title;
    }
    return ws;
  }

  // Preamble before first heading
  const preamble = md.slice(0, headingPositions[0].index).trim();
  if (preamble) {
    // Check for # title in preamble
    const h1Match = preamble.match(/^#\s+(.+)$/m);
    const preambleContent = preamble.replace(/^#\s+.+$/m, '').trim();
    if (preambleContent) {
      parts.push({ title: h1Match ? h1Match[1].trim() : 'Introduction', content: preambleContent });
    }
  }

  for (let i = 0; i < headingPositions.length; i++) {
    const start = headingPositions[i].index;
    const end = i < headingPositions.length - 1 ? headingPositions[i + 1].index : md.length;
    const sectionContent = md.slice(start, end).replace(/^##\s+.+$/m, '').trim();
    parts.push({ title: headingPositions[i].title, content: sectionContent });
  }

  // Build WordSequence with multiple chapters
  const chapters: Chapter[] = [];
  let globalIndex = 0;

  for (const part of parts) {
    const stripped = stripMarkdown(part.content);
    if (!stripped.trim()) continue;

    const partWs = parseText(stripped, documentId);
    if (partWs.totalWords === 0) continue;

    // Re-index words with global offset
    const chapter: Chapter = {
      title: part.title,
      startIndex: globalIndex,
      paragraphs: partWs.chapters[0].paragraphs.map(p => ({
        startIndex: p.startIndex + globalIndex,
        sentences: p.sentences.map(s => ({
          startIndex: s.startIndex + globalIndex,
          words: s.words.map(w => ({
            ...w,
            index: w.index + globalIndex,
            isChapterStart: w.index + globalIndex === globalIndex && globalIndex === 0,
            isParagraphStart: w.index === p.startIndex,
            isSentenceStart: w.index === s.startIndex,
          })),
        })),
      })),
    };

    globalIndex += partWs.totalWords;
    chapters.push(chapter);
  }

  return { documentId, chapters, totalWords: globalIndex };
}
