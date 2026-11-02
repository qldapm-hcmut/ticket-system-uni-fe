import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { CenteredSpinner } from '../components/ui/Spinner';

/** Chặn truy cập khi chưa đăng nhập; chờ khôi phục phiên xong mới quyết định. */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) return <CenteredSpinner label="Đang khôi phục phiên…" />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
