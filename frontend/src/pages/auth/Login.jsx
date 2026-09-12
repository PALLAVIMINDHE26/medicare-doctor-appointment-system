import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Stethoscope, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/axios';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const dashboardPathFor = (role) => {
  if (role === 'doctor') return '/doctor/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/patient/dashboard';
};

const DEMO_ACCOUNTS = [
  { role: 'Patient', email: 'rahul.deshmukh@example.demo' },
  { role: 'Doctor', email: 'aisha.sharma@medicare.demo' },
  { role: 'Admin', email: 'admin@medicare.demo' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const fillDemo = (email) => {
    setForm({ email, password: 'Password123' });
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const from = location.state?.from?.pathname;
      navigate(from && from !== '/login' ? from : dashboardPathFor(user.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            <span className="text-lg">MediCare Plus</span>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Log in to manage your appointments.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <Input
                label="Email address"
                name="email"
                type="email"
                icon={Mail}
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              <Button type="submit" fullWidth loading={loading} icon={LogIn}>
                Log in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-4">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              Demo credentials (password: Password123)
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="rounded-lg border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center bg-blue-600 lg:flex">
        <div className="max-w-md px-8 text-white">
          <h2 className="text-3xl font-bold">Your health, scheduled simply.</h2>
          <p className="mt-4 text-blue-100">
            Access your appointments, medical history and doctor consultations from one secure dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
