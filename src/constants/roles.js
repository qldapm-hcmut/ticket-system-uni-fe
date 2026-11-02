/**
 * Vai trò suy ra từ API GET /me (mảng user.roles).
 * SSOT: docs/openapi.yaml -> UserRole.
 */
export const ROLES = {
  STUDENT: 'STUDENT',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN',
};

export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

export const REGISTRATION_STATUS = {
  REGISTERED: 'REGISTERED',
  WAITLISTED: 'WAITLISTED',
  CANCELLED: 'CANCELLED',
  CANCELLED_BY_EVENT: 'CANCELLED_BY_EVENT',
  EXPIRED: 'EXPIRED',
};

/** Nhãn tiếng Việt cho trạng thái sự kiện. */
export const EVENT_STATUS_LABELS = {
  DRAFT: 'Nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  REJECTED: 'Bị từ chối',
  PUBLISHED: 'Đã công bố',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Đã kết thúc',
};

/** Nhãn tiếng Việt cho trạng thái đăng ký. */
export const REGISTRATION_STATUS_LABELS = {
  REGISTERED: 'Đã đăng ký',
  WAITLISTED: 'Trong hàng chờ',
  CANCELLED: 'Đã hủy',
  CANCELLED_BY_EVENT: 'Hủy do sự kiện',
  EXPIRED: 'Hết hạn',
};

export function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}
