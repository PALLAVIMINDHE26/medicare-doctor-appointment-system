import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  User,
  Users,
  Stethoscope,
  Tags,
  ClipboardList,
  Clock,
  LogOut,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const NAV_BY_ROLE = {
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctors', label: 'Find Doctors', icon: Search },
    { to: '/patient/appointments', label: 'My Appointments', icon: CalendarDays },
    { to: '/patient/profile', label: 'My Profile', icon: User },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/doctor/patients', label: 'My Patients', icon: Users },
    { to: '/doctor/availability', label: 'Availability', icon: Clock },
    { to: '/doctor/profile', label: 'My Profile', icon: User },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
    { to: '/admin/patients', label: 'Manage Patients', icon: Users },
    { to: '/admin/appointments', label: 'Appointments', icon: ClipboardList },
    { to: '/admin/specializations', label: 'Specializations', icon: Tags },
  ],
};

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_BY_ROLE[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Stethoscope className="h-4 w-4" />
            </span>
            <span>MediCare Plus</span>
          </div>
          <button type="button" className="p-1 text-slate-500 lg:hidden" onClick={onCloseMobile} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <link.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg px-1 py-1.5">
            <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="truncate text-xs capitalize text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
