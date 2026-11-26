import { http, unwrap } from '../../lib/http';

/**
 * Service đăng nhập / phiên (A26). Mọi call API auth gom ở đây.
 * SSOT: docs/openapi.yaml -> tag Auth.
 */

/** A1 — POST /auth/google: đổi Google ID token lấy access/refresh token nội bộ. */
export async function loginWithGoogle(idToken) {
  const res = await http.post('/auth/google', { idToken });
  return unwrap(res); // AuthTokens { accessToken, refreshToken, expiresIn, user }
}

/** A4 — GET /me: thông tin user hiện tại + roles + units. */
export async function fetchMe() {
  const res = await http.get('/me');
  return unwrap(res); // User
}

/** A3 — POST /auth/logout: thu hồi refresh token. */
export async function logoutApi(refreshToken) {
  if (!refreshToken) return;
  await http.post('/auth/logout', { refreshToken });
}
