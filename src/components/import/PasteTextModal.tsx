import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useImport } from '@/hooks/useImport';

interface PasteTextModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasteTextModal({ isOpen, onClose }: PasteTextModalProps) {
  const [text, setText] = useState('');
  const { loading, error, importAndRead } = useImport();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    const doc = await importAndRead(text.trim());
    if (doc) {
      setText('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paste text">
      <textarea
        className="w-full h-[200px] p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] font-serif text-[15px] text-[var(--color-text)] resize-none outline-none focus:border-[var(--color-accent)]"
        placeholder="Paste or type your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      {error && (
        <p className="mt-3 font-serif text-[14px] text-[var(--color-text)]">{error}</p>
      )}
      <div className="mt-4 flex gap-3">
        <Button onClick={handleSubmit} disabled={!text.trim() || loading}>
          {loading ? 'Importing...' : 'Start reading'}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
