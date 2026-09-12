import { Link } from 'react-router-dom';
import { Stethoscope, Home } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
      <Stethoscope className="h-8 w-8" />
    </span>
    <h1 className="mt-6 text-4xl font-extrabold text-slate-900">404</h1>
    <p className="mt-2 text-lg font-medium text-slate-700">Page not found</p>
    <p className="mt-1 max-w-sm text-sm text-slate-500">
      The page you are looking for does not exist or may have been moved.
    </p>
    <Link to="/" className="mt-6">
      <Button icon={Home}>Back to Home</Button>
    </Link>
  </div>
);

export default NotFound;
