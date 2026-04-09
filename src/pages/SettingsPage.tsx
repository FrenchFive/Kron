import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useSettingsStore } from '@/store/settingsStore';
import { db } from '@/db/database';
import { MIN_WPM, MAX_WPM, MIN_FONT_SIZE, MAX_FONT_SIZE } from '@/utils/constants';

export function SettingsPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const [storageSize, setStorageSize] = useState<string>('Calculating...');

  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(est => {
        const usedMB = ((est.usage ?? 0) / 1024 / 1024).toFixed(1);
        setStorageSize(`Using ${usedMB} MB`);
      });
    } else {
      setStorageSize('Unknown');
    }
  }, []);

  const handleClearAll = async () => {
    if (window.confirm('This will delete all your documents, bookmarks, and stats. This cannot be undone.')) {
      await db.delete();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <PageContainer>
      <div className="mb-8 flex items-start gap-3">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <div className="pt-1">
          <span className="page-kicker mb-3">preferences</span>
          <h1 className="page-title">settings</h1>
          <p className="page-subtitle mt-3 max-w-[30ch]">
            Tune reading speed, typography, and the pacing of each session.
          </p>
        </div>
      </div>

      <section className="surface-card p-5 mb-5">
        <h2 className="section-heading mb-4">reading</h2>

        <SettingRow label="Default WPM" value={`${settings.defaultWpm}`}>
          <input
            type="range"
            min={MIN_WPM}
            max={MAX_WPM}
            step={10}
            value={settings.defaultWpm}
            onChange={(e) => settings.setDefaultWpm(Number(e.target.value))}
          />
        </SettingRow>

        <SettingRow label="Font size" value={`${settings.fontSize}px`}>
          <input
            type="range"
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            step={2}
            value={settings.fontSize}
            onChange={(e) => settings.setFontSize(Number(e.target.value))}
          />
          <div className="mt-3 flex justify-center rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4">
            <span
              className="font-serif font-bold text-[var(--color-text)]"
              style={{ fontSize: `${settings.fontSize}px` }}
            >
              kr<span className="text-[var(--color-accent)]">o</span>n
            </span>
          </div>
        </SettingRow>

        <SettingRow label="Pause at periods" value={`${settings.punctuationMultiplier.toFixed(1)}x`}>
          <input
            type="range"
            min={1.0}
            max={3.0}
            step={0.1}
            value={settings.punctuationMultiplier}
            onChange={(e) => settings.setPunctuationMultiplier(Number(e.target.value))}
          />
        </SettingRow>

        <SettingRow label="Pause at commas" value={`${settings.commaMultiplier.toFixed(1)}x`}>
          <input
            type="range"
            min={1.0}
            max={2.0}
            step={0.1}
            value={settings.commaMultiplier}
            onChange={(e) => settings.setCommaMultiplier(Number(e.target.value))}
          />
        </SettingRow>

        <SettingRow label="Pause at paragraphs" value={`${settings.paragraphMultiplier.toFixed(1)}x`}>
          <input
            type="range"
            min={1.0}
            max={4.0}
            step={0.1}
            value={settings.paragraphMultiplier}
            onChange={(e) => settings.setParagraphMultiplier(Number(e.target.value))}
          />
        </SettingRow>
      </section>

      <section className="surface-card-flat p-5 mb-5">
        <h2 className="section-heading mb-4">appearance</h2>

        <div className="border-b border-[var(--color-border)] py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-serif text-[15px] text-[var(--color-text)]">Theme</span>
            <span className="tiny-meta">light / dark / system</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => settings.setTheme(t)}
                className={`chip-toggle ${
                  settings.theme === t
                    ? 'is-active'
                    : ''
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card-flat p-5 mb-5">
        <h2 className="section-heading mb-4">data</h2>
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] py-4">
          <span className="font-serif text-[15px] text-[var(--color-text)]">Storage used</span>
          <span className="meta-text text-right">{storageSize}</span>
        </div>
        <div className="pt-4">
          <Button variant="danger" onClick={handleClearAll}>
            Clear all data
          </Button>
        </div>
      </section>

      <section className="surface-card-flat p-5">
        <h2 className="section-heading mb-4">about</h2>
        <div className="space-y-1">
          <p className="font-serif text-[15px] text-[var(--color-text)]">Kron v1.0.0</p>
          <p className="meta-text">Made by Five</p>
        </div>
      </section>
    </PageContainer>
  );
}

function SettingRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--color-border)] py-4 last:border-b-0 last:pb-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-serif text-[15px] text-[var(--color-text)]">{label}</span>
        <span className="meta-text">{value}</span>
      </div>
      {children}
    </div>
  );
}
