/**
 * Lưu/đọc access & refresh token.
 * Dùng localStorage cho đơn giản ở phạm vi đồ án; nếu cần bảo mật hơn
 * có thể đổi sang httpOnly cookie mà không phải sửa chỗ gọi (chỉ sửa file này).
 */
const ACCESS_KEY = 'hcmut_events.accessToken';
const REFRESH_KEY = 'hcmut_events.refreshToken';

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setTokens({ accessToken, refreshToken }) {
  try {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch {
    /* storage có thể bị chặn (private mode) — bỏ qua */
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}
