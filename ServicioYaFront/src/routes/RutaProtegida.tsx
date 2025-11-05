import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = { roles?: string[] }; // opcional: ['merchant']

export default function ProtectedRoute({ roles }: Props) {
  const { loading, isAuth, user } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: '2rem' }}>Verificando sesión…</div>;

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0) {
    const role = (user?.role ?? '').toString().toLowerCase();
    if (!roles.map(r => r.toLowerCase()).includes(role)) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return <Outlet />;
}
