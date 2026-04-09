import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { getDocument, updateDocument } from '@/db/documents';
import { parseText } from '@/parsers/textParser';
import type { WordSequence } from '@/engine/wordSequence';

/** Reconstruct plain text from a WordSequence */
function wordSequenceToText(ws: WordSequence): string {
  const lines: string[] = [];
  for (const chapter of ws.chapters) {
    for (const paragraph of chapter.paragraphs) {
      const words: string[] = [];
      for (const sentence of paragraph.sentences) {
        for (const word of sentence.words) {
          words.push(word.text);
        }
      }
      lines.push(words.join(' '));
    }
  }
  return lines.join('\n\n');
}

export function EditContentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const doc = await getDocument(id!);
      if (!doc) {
        navigate('/library');
        return;
      }
      setTitle(doc.title);
      const ws: WordSequence = JSON.parse(doc.wordSequence);
      setContent(wordSequenceToText(ws));
      setLoading(false);
    }
    load();
  }, [id, navigate]);

  const handleSave = useCallback(async () => {
    if (!id || saving) return;
    setSaving(true);
    try {
      const ws = parseText(content, id);
      if (ws.totalWords === 0) {
        setSaving(false);
        return;
      }
      await updateDocument(id, {
        wordSequence: JSON.stringify(ws),
        wordCount: ws.totalWords,
      });
      navigate(-1);
    } catch {
      setSaving(false);
    }
  }, [id, content, saving, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-bg)]">
        <span className="font-serif text-[15px] text-[var(--color-text-secondary)]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]"
        style={{ paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))' }}
      >
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <span className="max-w-[200px] truncate font-serif text-[15px] font-semibold text-[var(--color-text)]">
          {title}
        </span>
        <IconButton label="Save" onClick={handleSave}>
          <Save size={20} strokeWidth={1.5} />
        </IconButton>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full resize-none bg-[var(--color-bg)] px-5 py-4 font-serif text-[15px] leading-relaxed text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
        placeholder="Enter your text..."
        disabled={saving}
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
      />
    </div>
  );
}
