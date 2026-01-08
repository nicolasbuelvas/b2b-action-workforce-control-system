import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import type { UserRole } from '../types/roles';

interface Props {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, loading, user } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <Navigate
        to="/forbidden"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}