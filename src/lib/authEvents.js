/**
 * Cầu nối giữa tầng axios (không phải React) và AuthContext.
 * Khi refresh token thất bại, axios phát sự kiện này để AuthContext đăng xuất + điều hướng.
 */
const SESSION_EXPIRED = 'auth:session-expired';

export function emitSessionExpired() {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED));
}

export function onSessionExpired(handler) {
  window.addEventListener(SESSION_EXPIRED, handler);
  return () => window.removeEventListener(SESSION_EXPIRED, handler);
}
