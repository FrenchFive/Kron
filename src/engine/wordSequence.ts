export interface WordSequence {
  documentId: string;
  chapters: Chapter[];
  totalWords: number;
}

export interface Chapter {
  title: string;
  startIndex: number;
  paragraphs: Paragraph[];
}

export interface Paragraph {
  startIndex: number;
  sentences: Sentence[];
}

export interface Sentence {
  startIndex: number;
  words: Word[];
}

export interface Word {
  text: string;
  index: number;
  orpIndex: number;
  pauseMultiplier: number;
  isChapterStart: boolean;
  isParagraphStart: boolean;
  isSentenceStart: boolean;
}

export interface PositionMap {
  sentenceStartIndices: number[];
  paragraphStartIndices: number[];
  chapterStartIndices: number[];
}

export function buildPositionMap(ws: WordSequence): PositionMap {
  const sentenceStartIndices: number[] = [];
  const paragraphStartIndices: number[] = [];
  const chapterStartIndices: number[] = [];

  for (const chapter of ws.chapters) {
    chapterStartIndices.push(chapter.startIndex);
    for (const paragraph of chapter.paragraphs) {
      paragraphStartIndices.push(paragraph.startIndex);
      for (const sentence of paragraph.sentences) {
        sentenceStartIndices.push(sentence.startIndex);
      }
    }
  }

  return { sentenceStartIndices, paragraphStartIndices, chapterStartIndices };
}

export function getWordAt(ws: WordSequence, index: number): Word | null {
  for (const chapter of ws.chapters) {
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        for (const word of sentence.words) {
          if (word.index === index) return word;
        }
      }
    }
  }
  return null;
}

export function getAllWords(ws: WordSequence): Word[] {
  const words: Word[] = [];
  for (const chapter of ws.chapters) {
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        words.push(...sentence.words);
      }
    }
  }
  return words;
}

export function getChapterForIndex(ws: WordSequence, index: number): Chapter | null {
  for (let i = ws.chapters.length - 1; i >= 0; i--) {
    if (ws.chapters[i].startIndex <= index) {
      return ws.chapters[i];
    }
  }
  return ws.chapters[0] ?? null;
}
