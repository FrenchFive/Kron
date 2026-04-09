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
        className="list-row w-full cursor-pointer bg-transparent text-left"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]">
          <FileUp size={18} strokeWidth={1.5} />
        </div>
        <span className="flex-1 font-serif text-[15px] font-semibold text-[var(--color-text)]">
          {loading ? 'Importing...' : 'Upload file'}
        </span>
        <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
      </button>
      {error && (
        <p className="py-3 font-serif text-[13px] text-[var(--color-text)]">{error}</p>
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
