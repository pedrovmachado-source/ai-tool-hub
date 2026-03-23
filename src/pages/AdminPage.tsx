import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) return <Navigate to="/" replace />;

  return <AdminPanel onBack={() => navigate('/')} />;
}