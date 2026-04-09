import { NavLink } from 'react-router-dom';
import { Home, BookOpen, BarChart3 } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'home' },
  { to: '/library', icon: BookOpen, label: 'library' },
  { to: '/stats', icon: BarChart3, label: 'stats' },
] as const;

export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_92%,transparent)] backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto flex h-[68px] max-w-[680px] items-center justify-around px-4">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex min-w-[84px] flex-col items-center gap-1 rounded-[18px] px-4 py-2.5 no-underline transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-secondary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-1/2 top-[6px] h-[2px] w-8 -translate-x-1/2 rounded-full transition-opacity ${
                    isActive ? 'bg-[var(--color-accent)] opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon size={19} strokeWidth={1.6} className={isActive ? 'text-[var(--color-text)]' : undefined} />
                <span className={`font-serif text-[11px] ${isActive ? 'font-medium text-[var(--color-text)]' : 'font-normal'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
