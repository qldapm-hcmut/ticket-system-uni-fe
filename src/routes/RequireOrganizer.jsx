import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { ROLES } from '../constants/roles';

/**
 * Bảo vệ route check-in (A35, RBAC): CHỈ ORGANIZER được vào.
 * STUDENT và ADMIN (ADMIN không có quyền check-in theo hợp đồng) -> chuyển tới 403.
 *
 * Lưu ý: đây là lớp bảo vệ phía client cho UX; backend vẫn là nơi quyết định quyền thật.
 */
export function RequireOrganizer({ children }) {
  const { hasRole } = useAuth();
  if (!hasRole(ROLES.ORGANIZER)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}
