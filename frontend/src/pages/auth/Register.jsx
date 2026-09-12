import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, User as UserIcon, Stethoscope, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/axios';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Please enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Please enter a valid email';
    if (!form.phone || form.phone.trim().length < 7) errs.phone = 'Please enter a valid phone number';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/\d/.test(form.password)) errs.password = 'Password must contain at least one number';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success(`Welcome to MediCare Plus, ${user.name.split(' ')[0]}!`);
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden flex-1 items-center justify-center bg-blue-600 lg:flex">
        <div className="max-w-md px-8 text-white">
          <h2 className="text-3xl font-bold">Join in under a minute.</h2>
          <p className="mt-4 text-blue-100">
            Create a free account to book appointments with verified doctors, track your visit history, and manage
            your healthcare all in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Stethoscope className="h-5 w-5" />
            </span>
            <span className="text-lg">MediCare Plus</span>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign up as a patient to start booking appointments. Doctor accounts are created by an administrator.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <Input
                label="Full name"
                name="name"
                icon={UserIcon}
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
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
                label="Phone number"
                name="phone"
                icon={Phone}
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                helperText="At least 8 characters, including a number"
                required
              />
              <Input
                label="Confirm password"
                name="confirmPassword"
                type="password"
                icon={Lock}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />
              <Button type="submit" fullWidth loading={loading} icon={UserPlus}>
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
