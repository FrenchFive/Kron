import { NavLink } from 'react-router-dom';
import { Home, BookOpen, BarChart3 } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'home' },
  { to: '/library', icon: BookOpen, label: 'library' },
  { to: '/stats', icon: BarChart3, label: 'stats' },
] as const;

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg)] border-t border-[var(--color-border)] lg:hidden"
      style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 no-underline transition-colors duration-150 ${
                isActive
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={1.5} />
                <span className={`font-serif text-[11px] ${isActive ? 'font-medium' : 'font-normal'}`}>
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
