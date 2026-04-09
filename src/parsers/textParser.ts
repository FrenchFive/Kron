import type { WordSequence, Chapter, Paragraph, Sentence, Word } from '@/engine/wordSequence';
import { calculateOrpIndex } from '@/engine/orp';
import { calculatePauseMultiplier, type PauseSettings } from '@/engine/punctuation';
import {
  DEFAULT_PUNCTUATION_MULTIPLIER,
  DEFAULT_COMMA_MULTIPLIER,
  DEFAULT_PARAGRAPH_MULTIPLIER,
} from '@/utils/constants';

const DEFAULT_PAUSE_SETTINGS: PauseSettings = {
  punctuationMultiplier: DEFAULT_PUNCTUATION_MULTIPLIER,
  commaMultiplier: DEFAULT_COMMA_MULTIPLIER,
  paragraphMultiplier: DEFAULT_PARAGRAPH_MULTIPLIER,
};

// Split text after sentence-ending punctuation followed by whitespace and a capital letter
const SENTENCE_SPLIT_RE = /(?<=[.!?])\s+(?=[A-Z])/;

function inferTitle(text: string): string {
  const firstLine = text.trim().split('\n')[0]?.trim() ?? '';
  if (firstLine.length > 0 && firstLine.length < 60 && !firstLine.includes('.')) {
    return firstLine;
  }
  return 'Untitled';
}

export function parseText(
  text: string,
  documentId: string,
  pauseSettings: PauseSettings = DEFAULT_PAUSE_SETTINGS
): WordSequence {
  // Normalize whitespace
  const normalized = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ');

  // Split into paragraphs by double newline
  const rawParagraphs = normalized
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (rawParagraphs.length === 0) {
    return { documentId, chapters: [], totalWords: 0 };
  }

  const title = inferTitle(normalized);
  let globalIndex = 0;
  const paragraphs: Paragraph[] = [];

  for (let pi = 0; pi < rawParagraphs.length; pi++) {
    const paragraphText = rawParagraphs[pi]
      .replace(/\s+/g, ' ')
      .trim();

    const paragraphStartIndex = globalIndex;
    const sentences: Sentence[] = [];

    // Split paragraph into sentences
    const rawSentences = paragraphText.split(SENTENCE_SPLIT_RE).filter(s => s.length > 0);

    for (let si = 0; si < rawSentences.length; si++) {
      const sentenceText = rawSentences[si].trim();
      if (sentenceText.length === 0) continue;

      const sentenceStartIndex = globalIndex;
      const wordTexts = sentenceText.split(/\s+/).filter(w => w.length > 0);
      const words: Word[] = [];

      for (let wi = 0; wi < wordTexts.length; wi++) {
        const wordText = wordTexts[wi];
        const isLastWordInParagraph = si === rawSentences.length - 1 && wi === wordTexts.length - 1;

        words.push({
          text: wordText,
          index: globalIndex,
          orpIndex: calculateOrpIndex(wordText),
          pauseMultiplier: calculatePauseMultiplier(wordText, isLastWordInParagraph, pauseSettings),
          isChapterStart: globalIndex === 0,
          isParagraphStart: globalIndex === paragraphStartIndex,
          isSentenceStart: globalIndex === sentenceStartIndex,
        });

        globalIndex++;
      }

      if (words.length > 0) {
        sentences.push({
          startIndex: sentenceStartIndex,
          words,
        });
      }
    }

    if (sentences.length > 0) {
      paragraphs.push({
        startIndex: paragraphStartIndex,
        sentences,
      });
    }
  }

  const chapter: Chapter = {
    title,
    startIndex: 0,
    paragraphs,
  };

  return {
    documentId,
    chapters: [chapter],
    totalWords: globalIndex,
  };
}
