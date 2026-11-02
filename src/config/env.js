/**
 * Cấu hình đọc từ biến môi trường Vite (import.meta.env).
 * Tập trung ở một chỗ để không rải import.meta.env khắp codebase.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  enableDevLogin: (import.meta.env.VITE_ENABLE_DEV_LOGIN ?? 'false') === 'true',
};
