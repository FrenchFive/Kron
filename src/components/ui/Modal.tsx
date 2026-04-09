import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { onBackButton } from '@/utils/native';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close modal on Android back button
  useEffect(() => {
    if (!isOpen) return;
    return onBackButton(onClose);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headerPaddingTop = 'env(safe-area-inset-top, 0px)';
  const bodyPaddingBottom = 'calc(20px + env(safe-area-inset-bottom, 0px))';
  const bodyPaddingTop = title ? undefined : 'calc(20px + env(safe-area-inset-top, 0px))';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel — slides in from right */}
      <div
        className="relative flex h-full w-full max-w-[480px] flex-col overflow-hidden border-l border-[var(--color-border)] bg-[var(--color-bg)] animate-slide-in"
        style={{
          animation: 'slideIn 200ms ease-out',
          boxShadow: 'var(--shadow-panel)',
        }}
      >
        {title && (
          <div
            className="border-b border-[var(--color-border)]"
            style={{ paddingTop: headerPaddingTop }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-display text-[24px] font-extrabold lowercase tracking-[-0.04em] text-[var(--color-text)]">
                {title}
              </h2>
              <IconButton label="Close" onClick={onClose}>
                <X size={20} strokeWidth={1.5} />
              </IconButton>
            </div>
          </div>
        )}
        <div
          className="flex-1 overflow-y-auto p-5"
          style={{
            paddingTop: bodyPaddingTop,
            paddingBottom: bodyPaddingBottom,
          }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
