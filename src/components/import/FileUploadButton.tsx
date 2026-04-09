import { useRef } from 'react';
import { FileUp, ChevronRight } from 'lucide-react';
import { useImport } from '@/hooks/useImport';
import { FILE_ACCEPT } from '@/parsers/index';

export function FileUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { loading, error, importFileAndRead } = useImport();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importFileAndRead(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <button
        className="w-full flex items-center gap-4 py-4 border-b border-[var(--color-border)] bg-transparent cursor-pointer text-left"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        <FileUp size={20} strokeWidth={1.5} className="text-[var(--color-text-secondary)] shrink-0" />
        <span className="font-serif text-[15px] text-[var(--color-text)] flex-1">
          {loading ? 'Importing...' : 'Upload file'}
        </span>
        <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
      </button>
      {error && (
        <p className="py-2 font-serif text-[13px] text-[var(--color-text)]">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={FILE_ACCEPT}
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
