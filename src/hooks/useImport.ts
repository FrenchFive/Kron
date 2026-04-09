import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseText } from '@/parsers/textParser';
import { detectFileType, type SourceType } from '@/parsers/index';
import { createDocument } from '@/db/documents';
import { generateId } from '@/utils/id';
import { useSettingsStore } from '@/store/settingsStore';
import type { WordSequence } from '@/engine/wordSequence';

interface ImportState {
  loading: boolean;
  error: string | null;
}

export function useImport() {
  const [state, setState] = useState<ImportState>({ loading: false, error: null });
  const navigate = useNavigate();
  const defaultWpm = useSettingsStore((s) => s.defaultWpm);

  const importText = useCallback(async (text: string, title?: string) => {
    setState({ loading: true, error: null });
    try {
      const docId = generateId();
      const ws = parseText(text, docId);
      if (ws.totalWords === 0) {
        setState({ loading: false, error: 'No readable text found.' });
        return null;
      }
      if (title) ws.chapters[0].title = title;

      const doc = await createDocument({
        title: title || ws.chapters[0]?.title || 'Untitled',
        sourceType: 'paste',
        sourceUri: null,
        wordCount: ws.totalWords,
        wpmLastUsed: defaultWpm,
        wordSequence: JSON.stringify(ws),
      });

      setState({ loading: false, error: null });
      return doc;
    } catch (e) {
      setState({ loading: false, error: 'Failed to import text.' });
      console.error(e);
      return null;
    }
  }, [defaultWpm]);

  const importFile = useCallback(async (file: File) => {
    setState({ loading: true, error: null });
    try {
      const sourceType = detectFileType(file.name);
      if (!sourceType) {
        const ext = file.name.split('.').pop() ?? '';
        setState({ loading: false, error: `ReadFast can't read .${ext} files. Try TXT, EPUB, PDF, DOCX, HTML, or MD.` });
        return null;
      }

      const docId = generateId();
      let ws: WordSequence;
      let title = file.name.replace(/\.[^.]+$/, '');

      switch (sourceType) {
        case 'txt': {
          const text = await file.text();
          ws = parseText(text, docId);
          break;
        }
        case 'epub': {
          const { parseEpub } = await import('@/parsers/epubParser');
          const buffer = await file.arrayBuffer();
          ws = await parseEpub(buffer, docId);
          break;
        }
        case 'pdf': {
          const { parsePdf } = await import('@/parsers/pdfParser');
          const buffer = await file.arrayBuffer();
          ws = await parsePdf(buffer, docId, title);
          break;
        }
        case 'docx': {
          const { parseDocx } = await import('@/parsers/docxParser');
          const buffer = await file.arrayBuffer();
          ws = await parseDocx(buffer, docId, title);
          break;
        }
        case 'html': {
          const text = await file.text();
          const { parseHtml } = await import('@/parsers/htmlParser');
          ws = parseHtml(text, docId);
          title = ws.chapters[0]?.title || title;
          break;
        }
        case 'md': {
          const text = await file.text();
          const { parseMarkdown } = await import('@/parsers/markdownParser');
          ws = parseMarkdown(text, docId);
          title = ws.chapters[0]?.title || title;
          break;
        }
        default:
          setState({ loading: false, error: `Unsupported format: ${sourceType}` });
          return null;
      }

      if (ws.totalWords === 0) {
        setState({ loading: false, error: 'No readable text found in this file.' });
        return null;
      }

      const doc = await createDocument({
        title,
        sourceType: sourceType as SourceType,
        sourceUri: file.name,
        wordCount: ws.totalWords,
        wpmLastUsed: defaultWpm,
        wordSequence: JSON.stringify(ws),
      });

      setState({ loading: false, error: null });
      return doc;
    } catch (e) {
      setState({ loading: false, error: 'Failed to import file.' });
      console.error(e);
      return null;
    }
  }, [defaultWpm]);

  const importAndRead = useCallback(async (text: string, title?: string) => {
    const doc = await importText(text, title);
    if (doc) navigate(`/player/${doc.id}`);
    return doc;
  }, [importText, navigate]);

  const importFileAndRead = useCallback(async (file: File) => {
    const doc = await importFile(file);
    if (doc) navigate(`/player/${doc.id}`);
    return doc;
  }, [importFile, navigate]);

  return {
    ...state,
    importText,
    importFile,
    importAndRead,
    importFileAndRead,
  };
}
