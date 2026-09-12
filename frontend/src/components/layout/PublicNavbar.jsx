import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Stethoscope, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const NAV_LINKS = [
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#specializations', label: 'Specializations' },
  { to: '/#about', label: 'About' },
];

const dashboardPathFor = (role) => {
  if (role === 'doctor') return '/doctor/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/patient/dashboard';
};

const PublicNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="text-lg">MediCare Plus</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.to} href={link.to} className="text-sm font-medium text-slate-600 hover:text-blue-600">
              {link.label}
            </a>
          ))}
          <NavLink to="/doctors" className="text-sm font-medium text-slate-600 hover:text-blue-600">
            Find Doctors
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500">Hi, {user.name.split(' ')[0]}</span>
              <Button size="sm" onClick={() => navigate(dashboardPathFor(user.role))}>
                Go to Dashboard
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { logout(); navigate('/'); }}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="p-2 text-slate-600 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a key={link.to} href={link.to} className="py-1 text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link to="/doctors" className="py-1 text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>
              Find Doctors
            </Link>
            <div className="mt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Button onClick={() => navigate(dashboardPathFor(user.role))}>Go to Dashboard</Button>
                  <Button variant="secondary" onClick={() => { logout(); navigate('/'); }}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => navigate('/login')}>Log in</Button>
                  <Button onClick={() => navigate('/register')}>Sign up</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
