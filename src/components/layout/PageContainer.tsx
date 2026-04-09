import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Set true on pages that show the BottomTabBar (Home, Library, Stats) */
  withTabBar?: boolean;
}

export function PageContainer({ children, className = '', withTabBar = false }: PageContainerProps) {
  return (
    <div
      className={`w-full max-w-[680px] mx-auto px-5 md:px-6 ${className}`}
      style={{
        paddingTop: 'calc(28px + env(safe-area-inset-top, 0px))',
        paddingBottom: withTabBar
          ? 'calc(92px + env(safe-area-inset-bottom, 0px))'
          : 'calc(32px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {children}
    </div>
  );
}
