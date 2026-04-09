import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

const isNative = Capacitor.isNativePlatform();

// ── Haptics ──────────────────────────────────────────────

export function hapticLight() {
  if (isNative) Haptics.impact({ style: ImpactStyle.Light });
}

export function hapticMedium() {
  if (isNative) Haptics.impact({ style: ImpactStyle.Medium });
}

export function hapticTick() {
  if (isNative) Haptics.notification({ type: NotificationType.Success });
}

// ── StatusBar ────────────────────────────────────────────

export function hideStatusBar() {
  if (isNative) StatusBar.hide();
}

export function showStatusBar() {
  if (isNative) {
    StatusBar.show();
    syncStatusBarWithTheme();
  }
}

export function syncStatusBarWithTheme() {
  if (!isNative) return;
  const isDark = document.documentElement.classList.contains('dark');
  StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  StatusBar.setBackgroundColor({ color: isDark ? '#111111' : '#FFFFFF' });
}

// ── Keyboard ─────────────────────────────────────────────

export function hideKeyboard() {
  if (isNative) Keyboard.hide();
}

// ── Screen Orientation ──────────────────────────────────

/** Unlock rotation so the user can switch to landscape */
export function unlockOrientation() {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // Not supported or not allowed — fail silently
  }
}

/** Lock back to portrait (e.g. when leaving the player) */
export function lockPortrait() {
  try {
    screen.orientation?.lock?.('portrait').catch(() => {});
  } catch {
    // Not supported or not allowed — fail silently
  }
}

// ── App / Back Button ────────────────────────────────────

export function onBackButton(handler: () => void): () => void {
  if (!isNative) return () => {};

  const listener = App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      handler();
    } else {
      App.exitApp();
    }
  });

  return () => {
    listener.then(h => h.remove());
  };
}
