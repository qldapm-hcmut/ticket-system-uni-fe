import { useAuth } from '../features/auth/AuthContext';
import { hasRole } from '../constants/roles';
import { EmptyState } from '../components/ui/states';

/**
 * Yêu cầu user có ít nhất một trong các vai trò `roles`.
 * Dùng cho các khu vực Organizer/Admin.
 */
export function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  const allowed = roles.some((r) => hasRole(user, r));

  if (!allowed) {
    return (
      <EmptyState
        title="Không có quyền truy cập"
        description="Khu vực này yêu cầu vai trò phù hợp. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn."
      />
    );
  }
  return children;
}
