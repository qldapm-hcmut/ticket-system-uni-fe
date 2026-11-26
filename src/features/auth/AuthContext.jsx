import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchMe, logoutApi } from './auth.api';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../../utils/tokenStorage';
import { onSessionExpired } from '../../lib/authEvents';
import { hasRole } from '../../constants/roles';

const AuthContext = createContext(null);

/**
 * Nguồn sự thật về phiên đăng nhập cho toàn app (A26/A28).
 * - Khi mount: nếu có access token thì gọi GET /me khôi phục phiên.
 * - Lắng nghe sự kiện session-expired từ tầng axios để tự đăng xuất.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // 'loading' khi đang khôi phục phiên lúc mở app.
  const [bootstrapping, setBootstrapping] = useState(Boolean(getAccessToken()));

  const applyLogout = useCallback(() => {
    clearTokens();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // Khôi phục phiên khi mở app.
  useEffect(() => {
    let active = true;
    if (!getAccessToken()) {
      setBootstrapping(false);
      return;
    }
    fetchMe()
      .then((me) => active && setUser(me))
      .catch(() => active && applyLogout())
      .finally(() => active && setBootstrapping(false));
    return () => {
      active = false;
    };
  }, [applyLogout]);

  // Axios báo hết phiên (refresh thất bại) -> đăng xuất.
  useEffect(() => onSessionExpired(() => applyLogout()), [applyLogout]);

  /** Gọi sau khi /auth/google trả AuthTokens. */
  const login = useCallback((authTokens) => {
    setTokens({
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken,
    });
    setUser(authTokens.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi(getRefreshToken());
    } catch {
      /* dù backend lỗi vẫn đăng xuất phía client */
    } finally {
      applyLogout();
    }
  }, [applyLogout]);

  /** Làm mới thông tin user (vd sau khi role thay đổi). */
  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
      hasRole: (role) => hasRole(user, role),
    }),
    [user, bootstrapping, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>');
  return ctx;
}
