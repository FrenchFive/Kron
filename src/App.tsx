import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { onBackButton } from '@/utils/native';

const TAB_ROUTES = ['/', '/library', '/stats'];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const showNav = TAB_ROUTES.includes(location.pathname);

  // Global Android back button — navigate back on sub-pages,
  // exit app on main tabs. PlayerPage and Modal handle their own.
  useEffect(() => {
    if (location.pathname.startsWith('/player/')) return; // PlayerPage has its own handler
    return onBackButton(() => {
      if (TAB_ROUTES.includes(location.pathname)) return; // Let default exit-app behavior run
      navigate(-1);
    });
  }, [location.pathname, navigate]);

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
