import { NavLink } from 'react-router-dom';
import { Home, BookOpen, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'home' },
  { to: '/library', icon: BookOpen, label: 'library' },
  { to: '/stats', icon: BarChart3, label: 'stats' },
] as const;

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[220px] h-screen fixed left-0 top-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] py-8 px-4">
      {/* Logo */}
      <div className="px-3 mb-10">
        <span className="font-display font-extrabold text-[24px] uppercase tracking-[0.08em] text-[var(--color-accent)]">
          KRON
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-[18px] no-underline font-serif text-[15px] transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--color-surface)] font-medium text-[var(--color-text)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-[var(--color-border)] pt-4 mt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-[18px] no-underline font-serif text-[15px] transition-colors duration-150 ${
              isActive
                ? 'bg-[var(--color-surface)] font-medium text-[var(--color-text)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
            }`
          }
        >
          <Settings size={20} strokeWidth={1.5} />
          <span>settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
