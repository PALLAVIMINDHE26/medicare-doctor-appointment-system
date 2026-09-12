import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Shared shell for all authenticated dashboard pages (patient/doctor/admin).
 * The page itself renders inside <Outlet/> and is responsible for its own
 * DashboardTopbar title/actions.
 */
const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet context={{ openMobileSidebar: () => setMobileOpen(true) }} />
      </div>
    </div>
  );
};

export default DashboardLayout;
