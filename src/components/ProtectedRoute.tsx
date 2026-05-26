import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is not validated and not an admin, they must go to /convite
  if (!user.inviteValidated && !isAdmin && location.pathname !== '/convite') {
    return <Navigate to="/convite" replace />;
  }

  // If user is validated or admin, and they are on /convite, redirect to /menu
  if ((user.inviteValidated || isAdmin) && location.pathname === '/convite') {
    return <Navigate to="/menu" replace />;
  }

  return <>{children}</>;
}