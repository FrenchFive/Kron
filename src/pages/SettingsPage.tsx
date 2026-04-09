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
    <PageContainer className="pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <IconButton label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <h1 className="font-display font-extrabold text-[26px] lowercase text-[var(--color-text)]">
          settings
        </h1>
      </div>

      {/* Reading Section */}
      <section className="mb-6">
        <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-4">reading</h2>

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
          {/* Live preview */}
          <div className="mt-2 flex justify-center">
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

      <Divider className="mb-6" />

      {/* Appearance Section */}
      <section className="mb-6">
        <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-4">appearance</h2>

        <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)]">
          <span className="font-serif text-[15px] text-[var(--color-text)]">Theme</span>
          <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] overflow-hidden">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => settings.setTheme(t)}
                className={`px-3 py-1.5 font-serif text-[13px] border-none cursor-pointer transition-colors duration-150 ${
                  settings.theme === t
                    ? 'bg-[var(--color-bg)] text-[var(--color-text)] font-medium'
                    : 'bg-transparent text-[var(--color-text-secondary)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Divider className="mb-6" />

      {/* Data Section */}
      <section className="mb-6">
        <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-4">data</h2>

        <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)]">
          <span className="font-serif text-[15px] text-[var(--color-text)]">Storage used</span>
          <span className="font-serif text-[13px] text-[var(--color-text-secondary)]">{storageSize}</span>
        </div>

        <div className="py-4">
          <Button variant="danger" onClick={handleClearAll}>
            Clear all data
          </Button>
        </div>
      </section>

      <Divider className="mb-6" />

      {/* About Section */}
      <section>
        <h2 className="font-serif font-medium text-[16px] text-[var(--color-text-secondary)] mb-4">about</h2>
        <p className="font-serif text-[14px] text-[var(--color-text)]">Kron v1.0.0</p>
        <p className="font-serif text-[12px] text-[var(--color-text-secondary)]">Made by Five</p>
      </section>
    </PageContainer>
  );
}

function SettingRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-serif text-[15px] text-[var(--color-text)]">{label}</span>
        <span className="font-serif text-[13px] text-[var(--color-text-secondary)]">{value}</span>
      </div>
      {children}
    </div>
  );
}
