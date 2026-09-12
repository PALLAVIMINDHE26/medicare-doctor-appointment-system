import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

/**
 * Gatekeeps authenticated routes. If `allowedRoles` is provided, also
 * enforces role-based access — mismatched roles are bounced to their own
 * dashboard rather than shown a raw 403 page, which is friendlier UX.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback = role === 'doctor' ? '/doctor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
