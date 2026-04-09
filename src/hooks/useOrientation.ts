import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

function getOrientation(): Orientation {
  // Use screen.orientation API if available, fall back to matchMedia
  if (screen.orientation) {
    return screen.orientation.type.startsWith('landscape') ? 'landscape' : 'portrait';
  }
  return window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
}

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(getOrientation);

  useEffect(() => {
    const update = () => setOrientation(getOrientation());

    // Listen to screen.orientation change event (preferred)
    if (screen.orientation) {
      screen.orientation.addEventListener('change', update);
    }

    // Also listen to resize as a fallback
    window.addEventListener('resize', update);

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', update);
      }
      window.removeEventListener('resize', update);
    };
  }, []);

  return orientation;
}
