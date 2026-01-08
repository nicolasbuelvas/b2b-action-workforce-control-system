import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}