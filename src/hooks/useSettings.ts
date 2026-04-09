import { useSettingsStore } from '@/store/settingsStore';

// Re-export for convenience — hooks layer wrapping store
export function useSettings() {
  return useSettingsStore();
}
