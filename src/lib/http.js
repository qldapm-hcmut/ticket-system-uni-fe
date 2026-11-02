import axios from 'axios';
import { env } from '../config/env';
import { toApiError } from './apiError';
import { emitSessionExpired } from './authEvents';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../utils/tokenStorage';

/**
 * Axios instance dùng chung (A28).
 * - Gắn Bearer access token vào mọi request.
 * - Tự refresh access token khi gặp 401, gom các request song song vào 1 lần refresh.
 * - Chuẩn hoá mọi lỗi thành ApiError (có error.code) trước khi trả về chỗ gọi.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Các endpoint auth không cần/không nên chèn access token hoặc refresh-retry.
const AUTH_PATHS = ['/auth/google', '/auth/refresh', '/auth/logout'];
function isAuthPath(url = '') {
  return AUTH_PATHS.some((p) => url.includes(p));
}

// ----- Request: gắn token -----
http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !isAuthPath(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- Response: refresh khi 401 -----
let isRefreshing = false;
/** @type {Array<(token: string | null) => void>} */
let pendingQueue = [];

function flushQueue(newToken) {
  pendingQueue.forEach((resolve) => resolve(newToken));
  pendingQueue = [];
}

/** Dùng axios "trần" để gọi refresh, tránh lặp interceptor. */
async function requestNewAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(
      `${env.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 },
    );
    const tokens = data?.data;
    if (!tokens?.accessToken) return null;
    setTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken, // refresh token được xoay vòng
    });
    return tokens.accessToken;
  } catch {
    return null;
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const shouldTryRefresh =
      status === 401 &&
      original &&
      !original._retried &&
      !isAuthPath(original.url) &&
      getRefreshToken();

    if (shouldTryRefresh) {
      original._retried = true;

      // Nếu đang có một lần refresh khác chạy, xếp hàng chờ nó xong.
      if (isRefreshing) {
        const newToken = await new Promise((resolve) => pendingQueue.push(resolve));
        if (!newToken) return Promise.reject(toApiError(error));
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      }

      isRefreshing = true;
      const newToken = await requestNewAccessToken();
      isRefreshing = false;
      flushQueue(newToken);

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      }

      // Refresh thất bại -> hết phiên: xoá token và báo cho AuthContext.
      clearTokens();
      emitSessionExpired();
    }

    return Promise.reject(toApiError(error));
  },
);

/** Trả về response.data.data (unwrap { data, meta }). */
export function unwrap(response) {
  return response.data?.data;
}

/** Trả về cả { data, meta } cho endpoint phân trang. */
export function unwrapPage(response) {
  return { data: response.data?.data ?? [], meta: response.data?.meta ?? null };
}
