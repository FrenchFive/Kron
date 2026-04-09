import { Outlet, useLocation } from 'react-router-dom';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';

const TAB_ROUTES = ['/', '/library', '/stats'];

export default function App() {
  const location = useLocation();
  const showNav = TAB_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {showNav && <DesktopSidebar />}
      <main className={showNav ? 'lg:ml-[200px]' : ''}>
        <Outlet />
      </main>
      {showNav && <BottomTabBar />}
    </div>
  );
}
