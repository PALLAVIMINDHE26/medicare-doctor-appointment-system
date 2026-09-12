import { Menu, Bell } from 'lucide-react';

const DashboardTopbar = ({ title, subtitle, onOpenMobile, actions }) => (
  <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div>
        <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {actions}
      <button
        type="button"
        className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:block"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </button>
    </div>
  </header>
);

export default DashboardTopbar;
