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
      <div className="mb-4">
        <p className="page-subtitle">
          Drop in a passage, article draft, or notes and turn it into a clean reading session.
        </p>
      </div>
      <textarea
        className="soft-input h-[220px] resize-none"
        placeholder="Paste or type your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      {error && (
        <p className="mt-3 text-[15px] text-[var(--color-text)]">{error}</p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
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
